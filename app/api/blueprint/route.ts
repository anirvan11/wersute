import { NextRequest, NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { BlueprintSchema } from '@/lib/schema'
export const maxDuration = 60

const BLUEPRINT_SYSTEM = `You are a senior Indian startup consultant who has worked with 200+ Indian startups on budgeting and technical scoping.

Given a conversation history between an AI advisor and a founder, produce an accurate product blueprint as JSON.
Return ONLY valid JSON — no markdown, no backticks, no explanation whatsoever.

=== SPECIAL REQUESTS DETECTION ===
Scan the conversation for any EXPLICIT constraint the founder stated that the matched developer needs to know but that is NOT a product feature. Only capture things the founder actually said — never infer or invent.

Capture things like:
- Technology preferences: "I want to use Flutter", "build it in Django", "must use Next.js"
- Hosting/infra requirements: "must be hosted in India", "needs to be on AWS"
- Integrations explicitly named: "needs Razorpay", "integrate with Shopify"
- Compliance needs: "must be GDPR compliant", "HIPAA required"
- Design preferences: "minimal Linear-style design", "should look like Notion"
- Any other explicit hard constraint the founder voiced

Rules for special_requests:
- Include the field ONLY if there is at least one explicit request. If none, OMIT the field entirely (do not output an empty array).
- Each entry is a short, plain-language string capturing the founder's stated constraint.
- Do NOT include features here — features belong in core_features.
- Do NOT infer or assume. If the founder didn't say it explicitly, it does not go here.

=== COST ESTIMATION RULES (INR, based on Indian market rates 2025) ===
Indian freelancer rate: ₹800–₹2,000/hr | Agency rate: ₹2,500–₹5,000/hr

Calculate by adding up confirmed components:

BASE:
- Web app: Budget ₹60,000–₹1,20,000 | Premium ₹1,50,000–₹3,00,000
- Mobile app: Budget ₹1,20,000–₹2,50,000 | Premium ₹3,00,000–₹6,00,000
- Both web + mobile: Budget ₹1,80,000–₹3,50,000 | Premium ₹4,50,000–₹10,00,000

ADD per confirmed component:
- Payment gateway: +₹25,000–₹40,000 | +₹60,000–₹1,20,000
- Maps / GPS: +₹35,000–₹70,000 | +₹80,000–₹1,50,000
- Push notifications: +₹15,000–₹25,000 | +₹40,000–₹80,000
- WhatsApp Business API: +₹20,000–₹35,000 | +₹50,000–₹1,00,000
- Real-time features: +₹40,000–₹80,000 | +₹1,00,000–₹2,00,000
- Admin dashboard: +₹40,000–₹70,000 | +₹80,000–₹1,50,000
- Multi-role users: +₹30,000–₹50,000 | +₹60,000–₹1,20,000
- Image/file uploads: +₹15,000–₹25,000 | +₹30,000–₹60,000
- Social login: +₹10,000–₹20,000 | +₹25,000–₹50,000
- Third-party API (per integration): +₹20,000–₹40,000 | +₹50,000–₹1,00,000

COMPLEXITY:
- low: 1-3 features, web only, no third-party integrations
- medium: 4-5 features, mobile or web, 1-2 integrations
- high: 6+ features, mobile+web, multiple integrations or real-time

TIMELINE:
- low: 30-60 days | medium: 60-120 days | high: 120-180 days

=== OUTPUT SCHEMA (strictly follow) ===
{
  "startup_summary": "2-3 sentence overview of exactly what is being built",
  "problem_statement": "the core problem being solved",
  "target_users": "specific description of who the users are",
  "core_features": ["only features confirmed in conversation"],
  "special_requests": ["only explicit founder-stated constraints — OMIT this key entirely if none"],
  "complexity_level": "low|medium|high",
  "estimated_timeline_days": 90,
  "estimated_cost_range": {
    "budget": { "min": 200000, "max": 500000 },
    "premium": { "min": 500000, "max": 1200000 },
    "currency": "INR"
  }
}`

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function generateBlueprint(messages: any[], attempt = 1): Promise<any> {
  const MAX_ATTEMPTS = 3
  try {
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 2048,
      system: BLUEPRINT_SYSTEM,
      messages: [
        ...messages.map((m: any) => ({ role: m.role, content: m.content })),
        { role: 'user', content: 'Generate the blueprint JSON now based on our conversation.' },
      ],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())

    // Safety: model sometimes returns more features than the schema cap. Keep the top 15.
    if (Array.isArray(json.core_features) && json.core_features.length > 15) {
      json.core_features = json.core_features.slice(0, 15)
    }

    return BlueprintSchema.parse(json)
    
  } catch (e: any) {
    // Distinguish transient API errors from parse/validation errors — both retry, but log differently
    const isApiError = e?.status === 429 || e?.status === 529 || e?.status >= 500
    console.warn(
      `Blueprint attempt ${attempt}/${MAX_ATTEMPTS} failed (${isApiError ? 'API error' : 'parse/validation'}):`,
      e?.message ?? e
    )

    if (attempt < MAX_ATTEMPTS) {
      // Backoff only matters for API errors; harmless for parse retries
      await sleep(attempt * 800)
      return generateBlueprint(messages, attempt + 1)
    }
    throw new Error(`Blueprint generation failed after ${MAX_ATTEMPTS} attempts: ${e?.message ?? 'unknown'}`)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId } = await req.json()

    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (error || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    const blueprint = await generateBlueprint(conversation.messages_json)

    const { data: saved, error: saveError } = await supabaseAdmin
      .from('blueprints')
      .insert({ conversation_id: conversationId, structured_json: blueprint })
      .select()
      .single()

    if (saveError) throw saveError

    return NextResponse.json({ blueprint, blueprintId: saved.id })
  } catch (error: any) {
    console.error('Blueprint error:', error?.message ?? error)
    return NextResponse.json({ error: 'Blueprint generation failed' }, { status: 500 })
  }
}
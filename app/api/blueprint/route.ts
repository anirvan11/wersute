import { NextRequest, NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { BlueprintSchema } from '@/lib/schema'

const BLUEPRINT_SYSTEM = `You are a senior Indian startup consultant who has worked with 200+ Indian startups on budgeting and technical scoping.

Given a conversation history between an AI advisor and a founder, produce an accurate product blueprint as JSON.
Return ONLY valid JSON — no markdown, no backticks, no explanation whatsoever.

=== TECH STACK RULES (STRICT) ===
Only include technologies explicitly confirmed in the conversation. If not discussed, exclude it.

PLATFORM:
- Mobile app confirmed → React Native (cross-platform) or Flutter
- Web only → Next.js + Supabase
- Both → React Native + Next.js (admin web)
- Not discussed → default to Next.js (web)

PAYMENTS:
- Online payments confirmed → Razorpay
- Offline/manual → exclude payment SDK entirely

MAPS/LOCATION:
- Live GPS tracking confirmed → Google Maps API
- Simple status updates only → exclude Google Maps
- Not needed → exclude

NOTIFICATIONS:
- Push notifications confirmed → Firebase FCM
- WhatsApp confirmed → WhatsApp Business API
- SMS confirmed → Twilio or MSG91
- Not needed → exclude all

AUTH:
- Social login (Google/Facebook) → NextAuth or Supabase Auth with OAuth
- Email/phone signup → Supabase Auth
- Admin-managed users → no self-signup, just admin panel

REAL-TIME:
- Live chat/tracking confirmed → Supabase Realtime or Socket.io
- Not needed → exclude

MEDIA:
- File/image uploads confirmed → Supabase Storage or AWS S3
- Not needed → exclude

=== COST ESTIMATION RULES (INR, based on Indian market rates 2025) ===
Indian freelancer rate: ₹800–₹2,000/hr | Agency rate: ₹2,500–₹5,000/hr

Calculate by adding up confirmed components:

BASE (always included):
- Web app (Next.js): Budget ₹60,000–₹1,20,000 | Premium ₹1,50,000–₹3,00,000
- Mobile app (React Native): Budget ₹1,20,000–₹2,50,000 | Premium ₹3,00,000–₹6,00,000
- Both web + mobile: Budget ₹1,80,000–₹3,50,000 | Premium ₹4,50,000–₹10,00,000

ADD per confirmed component:
- Payment gateway (Razorpay): +₹25,000–₹40,000 | +₹60,000–₹1,20,000
- Google Maps / GPS: +₹35,000–₹70,000 | +₹80,000–₹1,50,000
- Push notifications (Firebase): +₹15,000–₹25,000 | +₹40,000–₹80,000
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
- low complexity: 30-60 days
- medium complexity: 60-120 days  
- high complexity: 120-180 days

=== OUTPUT SCHEMA (strictly follow) ===
{
  "startup_summary": "2-3 sentence overview of exactly what is being built",
  "problem_statement": "the core problem being solved",
  "target_users": "specific description of who the users are",
  "core_features": ["only features confirmed in conversation"],
  "suggested_tech_stack": ["only confirmed technologies"],
  "complexity_level": "low|medium|high",
  "estimated_timeline_days": 90,
  "estimated_cost_range": {
    "budget": { "min": 200000, "max": 500000 },
    "premium": { "min": 500000, "max": 1200000 },
    "currency": "INR"
  }
}`

async function generateBlueprint(messages: any[], attempt = 1): Promise<any> {
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

  try {
    const json = JSON.parse(text.replace(/```json|```/g, '').trim())
    return BlueprintSchema.parse(json)
  } catch (e) {
    if (attempt < 3) {
      console.warn(`Blueprint attempt ${attempt} failed, retrying...`)
      return generateBlueprint(messages, attempt + 1)
    }
    throw new Error('Blueprint generation failed after 2 retries')
  }
}

export async function POST(req: NextRequest) {
  try {
    const { conversationId, projectName } = await req.json()

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
  } catch (error) {
    console.error('Blueprint error:', error)
    return NextResponse.json({ error: 'Blueprint generation failed' }, { status: 500 })
  }
}
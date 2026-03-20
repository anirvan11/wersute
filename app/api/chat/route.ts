import { NextRequest, NextResponse } from 'next/server'
import { anthropic, CLAUDE_MODEL } from '@/lib/claude'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { getSystemPrompt, getNextStage, shouldAdvanceStage } from '@/lib/fsm'

export async function POST(req: NextRequest) {
  try {
    const { message, conversationId, userId } = await req.json()

    // Get or create conversation
    let conversation
    if (conversationId) {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single()
      if (error) throw error
      conversation = data
    } else {
      const { data, error } = await supabaseAdmin
        .from('conversations')
        .insert({ user_id: userId ?? null, stage: 'DISCOVERY', messages_json: [] })
        .select()
        .single()
      if (error) throw error
      conversation = data
    }

    // Append user message
    const messages = [
      ...(conversation.messages_json || []),
      { role: 'user', content: message, timestamp: new Date().toISOString() },
    ]

    // Advance stage if threshold hit
    let currentStage = conversation.stage
    if (shouldAdvanceStage(currentStage, messages.length)) {
      currentStage = getNextStage(currentStage)
    }

    // Call Claude
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      system: getSystemPrompt(currentStage),
      messages: messages.map((m: { role: 'user' | 'assistant'; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    })

    const aiMessage =
      response.content[0].type === 'text' ? response.content[0].text : ''

    // Append AI response
    messages.push({
      role: 'assistant',
      content: aiMessage,
      timestamp: new Date().toISOString(),
    })

    // Persist to DB
    await supabaseAdmin
      .from('conversations')
      .update({
        messages_json: messages,
        stage: currentStage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversation.id)

    return NextResponse.json({
      message: aiMessage,
      conversationId: conversation.id,
      stage: currentStage,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
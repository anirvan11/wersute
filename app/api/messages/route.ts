import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const projectId = searchParams.get('projectId')
  const freelancerId = searchParams.get('freelancerId')
  const userId = req.headers.get('x-user-id')

  if (!userId || !projectId || !freelancerId) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }

  const { data: messages, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('project_id', projectId)
    .eq('freelancer_id', freelancerId)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ messages: messages ?? [] })
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id')
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { projectId, freelancerId, content, senderRole } = await req.json()

  if (!projectId || !freelancerId || !content || !senderRole) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      project_id: projectId,
      freelancer_id: freelancerId,
      sender_id: userId,
      sender_role: senderRole,
      content: content.trim(),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: data })
}
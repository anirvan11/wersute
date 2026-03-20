import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(req: NextRequest) {
  console.log('update-status route hit')
  try {
    const body = await req.json()
    console.log('body:', body)
    const { projectId, status } = body

    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ status })
      .eq('id', projectId)
      .select()

    console.log('supabase result:', data, error)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('catch error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
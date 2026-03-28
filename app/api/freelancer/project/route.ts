import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: freelancer } = await supabaseAdmin
      .from('freelancers')
      .select('id, name, status')
      .eq('user_id', userId)
      .single()

    if (!freelancer) return NextResponse.json({ error: 'Freelancer not found' }, { status: 404 })
    if (freelancer.status !== 'approved') return NextResponse.json({ error: 'Not approved' }, { status: 403 })

    const { data: projects } = await supabaseAdmin
      .from('projects')
      .select('*, blueprints(*)')
      .eq('selected_freelancer_id', freelancer.id)
      .order('created_at', { ascending: false })

    return NextResponse.json({ projects: projects ?? [], freelancer })
  } catch (error) {
    console.error('Freelancer projects error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
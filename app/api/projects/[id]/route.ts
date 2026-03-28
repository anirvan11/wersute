import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = req.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: freelancer } = await supabaseAdmin
      .from('freelancers')
      .select('id, status')
      .eq('user_id', userId)
      .single()

    if (!freelancer || freelancer.status !== 'approved') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('*, blueprints(*)')
      .eq('id', id)
      .eq('selected_freelancer_id', freelancer.id)
      .single()

    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

    let founderEmail = null
    if (project.user_id) {
      try {
        const { data: userData } = await supabaseAdmin.auth.admin.getUserById(project.user_id)
        founderEmail = userData?.user?.email ?? null
      } catch { }
    }

    return NextResponse.json({ project, founderEmail })
  } catch (error) {
    console.error('Freelancer project detail error:', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
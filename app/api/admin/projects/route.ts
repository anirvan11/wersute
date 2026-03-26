import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function GET() {
  const { data: projects } = await supabaseAdmin
    .from('projects')
    .select('*, blueprints(*)')
    .order('created_at', { ascending: false })

  if (!projects) return NextResponse.json({ projects: [] })

  const emailMap: Record<string, string> = {}

  for (const project of projects) {
    if (!project.user_id || project.user_id.length !== 36) continue
    try {
      const { data } = await supabaseAdmin.auth.admin.getUserById(project.user_id)
      if (data?.user?.email) {
        emailMap[project.user_id] = data.user.email
      }
    } catch {
      // skip
    }
  }

  const projectsWithEmail = projects.map(p => ({
    ...p,
    founder_email: emailMap[p.user_id] ?? null,
  }))

  return NextResponse.json({ projects: projectsWithEmail })
}
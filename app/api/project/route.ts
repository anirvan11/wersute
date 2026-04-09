import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { blueprintId, userId, projectName } = await req.json()

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .insert({
        user_id: userId ?? null,
        blueprint_id: blueprintId,
        name: projectName || 'My Project',
        status: 'MATCHING',
      })
      .select()
      .single()

    if (error) throw error

    await supabaseAdmin.from('status_updates').insert({
      project_id: project.id,
      status: 'MATCHING',
      note: 'Project submitted. Finding the right developer.',
    })

    if (process.env.RESEND_API_KEY && process.env.ADMIN_EMAIL) {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: process.env.ADMIN_EMAIL,
        subject: `🚀 New Wersute Project: ${project.name}`,
        html: `
          <h2>New project submitted</h2>
          <p><strong>Project:</strong> ${project.name}</p>
          <p><strong>Project ID:</strong> ${project.id}</p>
          <p><strong>Blueprint ID:</strong> ${blueprintId}</p>
          <p><strong>Status:</strong> MATCHING</p>
        `,
      })
    }

    return NextResponse.json({ projectId: project.id })
  } catch (error) {
    console.error('Project creation error:', error)
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
  }
}

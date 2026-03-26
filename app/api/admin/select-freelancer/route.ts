import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { projectId, freelancerId } = await req.json()

    const { data: project, error } = await supabaseAdmin
      .from('projects')
      .update({
        selected_freelancer_id: freelancerId,
        status: 'DEVELOPER_ASSIGNED',
      })
      .eq('id', projectId)
      .select('*')
      .single()

    if (error) throw error

    // Email founder confirmation
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(project.user_id)
    const founderEmail = userData?.user?.email

    if (founderEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Wersute <onboarding@resend.dev>',
        to: founderEmail,
        subject: `✅ Developer assigned — ${project.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #1a6fd4;">Developer assigned!</h2>
            <p>Your developer has been confirmed and work will begin shortly.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${projectId}"
               style="display: inline-block; background: #1a6fd4; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              Track My Project
            </a>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">— The Wersute Team</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('select-freelancer error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
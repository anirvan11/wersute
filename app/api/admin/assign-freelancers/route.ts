import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { projectId, quotes } = await req.json()
    // quotes = [{ freelancer_id, quote_amount, note }]

    // Delete existing quotes for this project first
    await supabaseAdmin
      .from('project_quotes')
      .delete()
      .eq('project_id', projectId)

    // Insert new quotes
    const quotesWithProject = quotes.map((q: any) => ({
      ...q,
      project_id: projectId,
    }))

    const { error: quotesError } = await supabaseAdmin
      .from('project_quotes')
      .insert(quotesWithProject)

    if (quotesError) throw quotesError

    // Update project status to READY_TO_SELECT
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .update({ status: 'READY_TO_SELECT' })
      .eq('id', projectId)
      .select('*, blueprints(*)')
      .single()

    if (projectError) throw projectError

    // Get founder email
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(project.user_id)
    const founderEmail = userData?.user?.email

    // Send email to founder
    if (founderEmail && process.env.RESEND_API_KEY) {
      await resend.emails.send({
        from: 'Wersute <onboarding@resend.dev>',
        to: founderEmail,
        subject: `🎉 Your developer matches are ready — ${project.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2 style="color: #1a6fd4;">Your matches are ready!</h2>
            <p>Hi there,</p>
            <p>We've found <strong>${quotes.length} developer${quotes.length > 1 ? 's' : ''}</strong> who are a great fit for <strong>${project.name}</strong>.</p>
            <p>Log in to your dashboard to view their profiles and quotes, and select the one that works best for you.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/${projectId}" 
               style="display: inline-block; background: #1a6fd4; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
              View My Matches
            </a>
            <p style="color: #94a3b8; font-size: 13px; margin-top: 32px;">— The Wersute Team</p>
          </div>
        `,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('assign-freelancers error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
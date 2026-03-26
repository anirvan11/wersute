import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  const { freelancerId, action } = await req.json()

  const { data: freelancer, error } = await supabaseAdmin
    .from('freelancers')
    .update({ status: action })
    .eq('id', freelancerId)
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  try {
    if (freelancer.user_id && process.env.RESEND_API_KEY) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(freelancer.user_id)
      const email = userData?.user?.email
      if (email) {
        await resend.emails.send({
          from: 'Wersute <onboarding@resend.dev>',
          to: email,
          subject: action === 'approved'
            ? '✅ Your Wersute profile has been approved!'
            : '❌ Your Wersute profile was not approved',
          html: action === 'approved'
            ? `
              <div style="font-family: sans-serif; max-width: 560px;">
                <h2 style="color: #1a6fd4;">You're approved! 🎉</h2>
                <p>Hi ${freelancer.name},</p>
                <p>Your developer profile on Wersute has been approved. You'll be notified when you're matched with a project.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/freelancer/dashboard"
                   style="display: inline-block; background: #1a6fd4; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 16px;">
                  Go to Dashboard
                </a>
              </div>
            `
            : `
              <div style="font-family: sans-serif; max-width: 560px;">
                <h2>Profile not approved</h2>
                <p>Hi ${freelancer.name},</p>
                <p>Unfortunately your profile wasn't approved at this time. Feel free to reach out to info@wersute.com for more details.</p>
              </div>
            `,
        })
      }
    }
  } catch (e) {
    console.error('Email failed (non-fatal):', e)
  }

  return NextResponse.json({ success: true })
}
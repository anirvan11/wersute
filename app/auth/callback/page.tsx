'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search)
      const next = params.get('next')
      const isFreelancer = next === 'freelancer'

      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (!retrySession) {
            window.location.replace(isFreelancer ? '/freelancer/signup' : '/login')
            return
          }
          await handleUser(retrySession.user.id, retrySession.user.email!, isFreelancer)
        }, 1000)
        return
      }

      await handleUser(session.user.id, session.user.email!, isFreelancer)
    }

   async function handleUser(userId: string, email: string, isFreelancer: boolean) {
  if (isFreelancer) {
    // Check if this is a founder or admin account first
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (userData?.role === 'founder' || userData?.role === 'admin') {
      // Sign them out and redirect back to freelancer signup with error
      await supabase.auth.signOut()
      window.location.replace('/freelancer/signup?error=founder_account')
      return
    }

    // Check if freelancer profile exists
    const { data: existing } = await supabase
      .from('freelancers')
      .select('id, status')
      .eq('user_id', userId)
      .single()

    if (existing) {
      window.location.replace(
        existing.status === 'approved' ? '/freelancer/dashboard' : '/freelancer/pending'
      )
      return
    }

    // No profile yet — send to profile step
    window.location.replace('/freelancer/signup?step=profile')
    return
  }

  // Founder flow — same as before
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single()

  if (!existingUser) {
    await supabase.from('users').insert({ id: userId, email, role: 'founder' })
  }

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  const destination = userData?.role === 'admin' ? '/admin' : '/chat'
  window.history.replaceState(null, '', destination)
  window.location.replace(destination)
}

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#020817',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <p style={{ color: '#475569', fontSize: '14px' }}>Signing you in...</p>
    </div>
  )
}
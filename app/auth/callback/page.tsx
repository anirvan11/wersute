'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (!retrySession) {
            window.location.replace('/login')
            return
          }
          await handleUser(retrySession.user.id, retrySession.user.email!)
        }, 1000)
        return
      }

      await handleUser(session.user.id, session.user.email!)
    }

    async function handleUser(userId: string, email: string) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (!existing) {
        await supabase.from('users').insert({
          id: userId,
          email,
          role: 'founder'
        })
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      const destination = userData?.role === 'admin' ? '/admin' : '/chat'
      
      // Replace entire history with just the destination
      window.history.replaceState(null, '', destination)
      window.location.replace(destination)
    }

    handleCallback()
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#020817',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <p style={{ color: '#475569', fontSize: '14px' }}>Signing you in...</p>
    </div>
  )
}
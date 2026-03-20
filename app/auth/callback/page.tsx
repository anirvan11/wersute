'use client'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthCallbackPage() {
  useEffect(() => {
    async function handleCallback() {
      // Get session - Supabase automatically handles the hash/code
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Wait a moment and try again - session might still be loading
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession()
          if (!retrySession) {
            window.location.href = '/login'
            return
          }
          await handleUser(retrySession.user.id, retrySession.user.email!)
        }, 1000)
        return
      }

      await handleUser(session.user.id, session.user.email!)
    }

    async function handleUser(userId: string, email: string) {
      // Insert user if not exists
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

      // Get role and redirect
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userData?.role === 'admin') {
        window.location.href = '/admin'
      } else {
        window.location.href = '/chat'
      }
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
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#475569', fontSize: '14px' }}>Signing you in...</p>
      </div>
    </div>
  )
}
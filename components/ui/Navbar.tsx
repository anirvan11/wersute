'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? null)

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      setRole(data?.role ?? 'founder')
    }
    getUser()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '14px 24px',
      backgroundColor: '#0f172a',
      borderBottom: '1px solid #1e293b',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <a href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', textDecoration: 'none' }}>
        Wersute
      </a>

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {role === 'admin' && (
          <a href="/admin" style={{
            color: '#f59e0b',
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            backgroundColor: 'rgba(245,158,11,0.1)',
            padding: '6px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(245,158,11,0.2)'
          }}>
            Admin Panel
          </a>
        )}
        {role === 'founder' && (
          <a href="/projects" style={{
            color: '#94a3b8',
            fontSize: '13px',
            textDecoration: 'none',
          }}>
            My Projects
          </a>
        )}
        {email && (
          <span style={{ color: '#475569', fontSize: '12px' }}>
            {email}
          </span>
        )}
        <button
          onClick={handleSignOut}
          style={{
            background: 'none',
            border: '1px solid #334155',
            color: '#94a3b8',
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    </nav>
  )
}
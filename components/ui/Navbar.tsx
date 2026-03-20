'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
    <>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 24px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
        position: 'relative',
        zIndex: 10,
      }}>
        <a href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#60a5fa', textDecoration: 'none' }}>
          Wersute
        </a>

        {/* Desktop links */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {role === 'admin' && (
              <a href="/admin" style={{
                color: '#f59e0b', fontSize: '13px', fontWeight: '600',
                textDecoration: 'none', backgroundColor: 'rgba(245,158,11,0.1)',
                padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)'
              }}>
                Admin Panel
              </a>
            )}
            {role === 'founder' && (
              <a href="/projects" style={{ color: '#94a3b8', fontSize: '13px', textDecoration: 'none' }}>
                My Projects
              </a>
            )}
            {email && (
              <span style={{ color: '#475569', fontSize: '12px' }}>{email}</span>
            )}
            <button onClick={handleSignOut} style={{
              background: 'none', border: '1px solid #334155', color: '#94a3b8',
              padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer'
            }}>
              Sign Out
            </button>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}
          >
            {menuOpen ? (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        )}
      </nav>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed',
          top: '57px',
          left: 0,
          right: 0,
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
          zIndex: 50,
          padding: '8px 0',
        }}>
          {role === 'admin' && (
            <a href="/admin" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 20px',
              color: '#f59e0b', fontWeight: '600', fontSize: '15px', textDecoration: 'none',
              borderBottom: '1px solid #1e293b'
            }}>
              Admin Panel
            </a>
          )}
          {role === 'founder' && (
            <a href="/projects" onClick={() => setMenuOpen(false)} style={{
              display: 'block', padding: '14px 20px',
              color: '#94a3b8', fontSize: '15px', textDecoration: 'none',
              borderBottom: '1px solid #1e293b'
            }}>
              My Projects
            </a>
          )}
          {email && (
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e293b' }}>
              <span style={{ color: '#475569', fontSize: '13px' }}>{email}</span>
            </div>
          )}
          <button onClick={handleSignOut} style={{
            display: 'block', width: '100%', textAlign: 'left',
            padding: '14px 20px', background: 'none', border: 'none',
            color: '#f87171', fontSize: '15px', cursor: 'pointer'
          }}>
            Sign Out
          </button>
        </div>
      )}
    </>
  )
}
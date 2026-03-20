'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setUserEmail(session.user.email)
      }
    }
    checkUser()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <main style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 32px',
        borderBottom: '1px solid #1e293b'
      }}>
        <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#60a5fa' }}>Wersute</span>

        {userEmail ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <a href="/chat" style={{
              color: '#94a3b8', fontSize: '14px', textDecoration: 'none'
            }}>
              Continue Building
            </a>
            <div
  title={userEmail ?? ''}
  onClick={() => window.location.href = '/projects'}
  style={{
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: '700',
    color: 'white',
    cursor: 'pointer',
  }}
>
  {userEmail[0].toUpperCase()}
</div>
            <button onClick={handleSignOut} style={{
              background: 'none',
              border: '1px solid #334155',
              color: '#94a3b8',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              cursor: 'pointer'
            }}>
              Sign Out
            </button>
          </div>
        ) : (
          <a href="/login" style={{
            color: '#94a3b8',
            fontSize: '14px',
            textDecoration: 'none'
          }}>
            Sign In
          </a>
        )}
      </nav>

      {/* Hero */}
      <section style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '0 16px',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.2)',
          color: '#60a5fa',
          fontSize: '13px',
          padding: '6px 16px',
          borderRadius: '999px',
          marginBottom: '32px'
        }}>
          AI-managed startup execution
        </div>

        <h1 style={{
          fontSize: 'clamp(36px, 6vw, 72px)',
          fontWeight: 'bold',
          marginBottom: '24px',
          lineHeight: '1.1',
          maxWidth: '800px'
        }}>
          Turn your idea into a{' '}
          <span style={{ color: '#60a5fa' }}>product blueprint</span>
        </h1>

        <p style={{
          fontSize: '18px',
          color: '#94a3b8',
          marginBottom: '40px',
          maxWidth: '540px',
          lineHeight: '1.6'
        }}>
          Chat with our AI. Get a consultant-grade startup blueprint.
          We match you with the right developer and manage the build.
        </p>

        <a href={userEmail ? '/chat' : '/login'} style={{
          backgroundColor: '#2563eb',
          color: 'white',
          padding: '16px 40px',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: '600',
          textDecoration: 'none',
          boxShadow: '0 0 40px rgba(37,99,235,0.3)'
        }}>
          {userEmail ? 'Continue Building →' : 'Start Building — It\'s Free →'}
        </a>

        <p style={{ color: '#334155', fontSize: '13px', marginTop: '16px' }}>
          No credit card required to start.
        </p>
      </section>
    </main>
  )
}
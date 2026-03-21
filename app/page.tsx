'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const SmallStar = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="#60a5fa">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" />
  </svg>
)

const CTAStar = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" />
  </svg>
)

const floatingStars = [
  { top: '12%', left: '8%', size: 20, opacity: 0.15 },
  { top: '25%', right: '6%', size: 14, opacity: 0.1 },
  { top: '60%', left: '5%', size: 10, opacity: 0.08 },
  { top: '75%', right: '10%', size: 18, opacity: 0.12 },
  { top: '45%', right: '3%', size: 8, opacity: 0.07 },
  { top: '88%', left: '15%', size: 12, opacity: 0.09 },
]

const steps = [
  { step: '01', title: 'Chat with AI', desc: 'Describe your startup idea in plain language' },
  { step: '02', title: 'Get Blueprint', desc: 'Receive a detailed product and cost blueprint' },
  { step: '03', title: 'We Build It', desc: 'Matched with developers, managed end-to-end' },
]

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) setUserEmail(session.user.email)
    }
    checkUser()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    setUserEmail(null)
  }

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#040d1a',
      color: 'white',
      overscrollBehavior: 'none',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Background glow */}
      <div style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(26,111,212,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(26,111,212,0.1) 0%, transparent 50%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      {/* Floating stars */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {floatingStars.map((star, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: star.top,
            left: (star as any).left,
            right: (star as any).right,
          }}>
            <svg
              width={star.size}
              height={star.size}
              viewBox="0 0 24 24"
              fill="white"
              style={{ opacity: star.opacity }}
            >
              <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5Z" />
            </svg>
          </div>
        ))}
      </div>

     {/* Nav */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        zIndex: 10,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(4,13,26,0.8)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          <Image
            src="/logo.png"
            alt="Wersute"
            width={36}
            height={36}
            style={{ borderRadius: '8px' }}
          />
          <span style={{
            fontSize: '20px',
            fontWeight: '700',
            color: 'white',
            fontFamily: "'Georgia', serif",
          }}>
            Wersute
          </span>
        </div>

        {/* Nav right */}
        {userEmail ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              title={userEmail}
              onClick={() => { window.location.href = '/projects' }}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: '#1a6fd4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: '700',
                color: 'white',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                flexShrink: 0,
              }}
            >
              {userEmail[0].toUpperCase()}
            </div>
            <a href="/chat" style={{
              backgroundColor: '#1a6fd4',
              color: 'white',
              fontSize: '13px',
              textDecoration: 'none',
              fontFamily: 'system-ui, sans-serif',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: '600',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}>
              Build
            </a>
            <button
              onClick={handleSignOut}
              style={{
                background: 'none',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'rgba(255,255,255,0.4)',
                padding: '7px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'system-ui, sans-serif',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Out
            </button>
          </div>
        ) : (
          <a href="/login" style={{
            backgroundColor: '#1a6fd4',
            color: 'white',
            fontSize: '14px',
            textDecoration: 'none',
            fontFamily: 'system-ui, sans-serif',
            padding: '8px 20px',
            borderRadius: '8px',
            fontWeight: '600',
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
        minHeight: '90vh',
        padding: '60px 24px',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(26,111,212,0.12)',
          border: '1px solid rgba(26,111,212,0.3)',
          color: '#60a5fa',
          fontSize: '12px',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          padding: '8px 20px',
          borderRadius: '999px',
          marginBottom: '48px',
        }}>
          <SmallStar />
          AI-Powered Startup Execution
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(40px, 6vw, 80px)',
          fontWeight: '700',
          lineHeight: '1.08',
          maxWidth: '900px',
          letterSpacing: '-0.02em',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          margin: '0 0 28px 0',
        }}>
          Your idea deserves{' '}
          <span style={{ color: '#1a6fd4' }}>to be built.</span>
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.45)',
          maxWidth: '560px',
          lineHeight: '1.7',
          fontFamily: 'system-ui, sans-serif',
          fontWeight: '400',
          margin: '0 0 56px 0',
        }}>
          Tell our AI your startup idea. Get a consultant-grade blueprint.
          We match you with the right developer and manage the entire build.
        </p>

        {/* CTA */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '96px' }}>
          <a href={userEmail ? '/chat' : '/login'} style={{ textDecoration: 'none' }}>
            <div style={{
              backgroundColor: '#1a6fd4',
              color: 'white',
              padding: '18px 48px',
              borderRadius: '14px',
              fontSize: '17px',
              fontWeight: '600',
              fontFamily: 'system-ui, sans-serif',
              boxShadow: '0 0 60px rgba(26,111,212,0.4)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
            }}>
              <CTAStar />
              {userEmail ? 'Continue Building' : 'Start Building — Free'}
            </div>
          </a>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', fontFamily: 'system-ui, sans-serif' }}>
            No credit card required
          </span>
        </div>

        {/* Steps */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '700px',
          width: '100%',
        }}>
          {steps.map((item) => (
            <div key={item.step} style={{
              flex: '1',
              minWidth: '180px',
              backgroundColor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '24px 20px',
              textAlign: 'left',
            }}>
              <div style={{
                color: '#1a6fd4',
                fontSize: '11px',
                fontWeight: '700',
                letterSpacing: '0.15em',
                fontFamily: 'system-ui, sans-serif',
                marginBottom: '10px',
              }}>
                {item.step}
              </div>
              <div style={{
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                fontFamily: "'Georgia', serif",
                marginBottom: '6px',
              }}>
                {item.title}
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.35)',
                fontSize: '13px',
                lineHeight: '1.5',
                fontFamily: 'system-ui, sans-serif',
              }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '24px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
        fontFamily: 'system-ui, sans-serif',
      }}>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          2025 Wersute
        </span>
        <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px' }}>
          Built in India
        </span>
      </footer>

    </main>
  )
}
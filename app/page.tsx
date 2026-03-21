'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const headlines = [
  'to be built.',
  'to launch fast.',
  'to find its users.',
  'to make an impact.',
]

const chatMessages = [
  { from: 'ai', text: 'Tell me about your startup idea — what problem are you solving?' },
  { from: 'user', text: 'I want to build an app for elderly meal delivery...' },
  { from: 'ai', text: 'Great! Will users pay through the app or offline?' },
  { from: 'user', text: 'Through the app, with subscriptions.' },
  { from: 'ai', text: 'Perfect — generating your blueprint now! ⚙️' },
]

const featureData = [
  { title: 'AI Conversation', desc: 'Natural chat that extracts the right details from your idea without technical jargon' },
  { title: 'Accurate Estimates', desc: 'INR cost estimates based on confirmed features — budget and premium tiers' },
  { title: 'Smart Blueprint', desc: 'Structured blueprint with features, stack, timeline, and complexity score' },
  { title: 'Developer Matching', desc: 'We find the right developer for your specific stack and budget requirements' },
  { title: 'Live Dashboard', desc: 'Track your project status from matching through testing to completion' },
  { title: 'Admin Managed', desc: 'Our team oversees every project so you never have to chase updates' },
]

const featureIcons = [
  'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  'M2 3h20v14H2zM8 21h8M12 17v4',
  'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
]

const stepData = [
  { step: '01', title: 'Chat with AI', desc: 'Describe your startup idea in plain language. Our AI advisor asks the right questions to understand your vision, target users, and key features.', icon: '💬' },
  { step: '02', title: 'Get Your Blueprint', desc: 'Receive a detailed product blueprint with feature list, tech stack recommendation, timeline, and accurate INR cost estimates.', icon: '📋' },
  { step: '03', title: 'We Build It', desc: 'Submit your blueprint and we match you with the right developer. Track progress on your dashboard from start to launch.', icon: '🚀' },
]

const visionData = [
  { icon: '🤝', title: 'Founder First', desc: 'We exist to serve founders. Every feature, every decision is made with the founder experience in mind.' },
  { icon: '🇮🇳', title: 'Built for India', desc: 'INR pricing, Indian developer network, and an understanding of the Indian startup ecosystem.' },
  { icon: '⚡', title: 'Speed to Market', desc: 'From idea to blueprint in one conversation. From blueprint to live product in weeks, not months.' },
]

const contactData = [
  { icon: '✉️', label: 'info@wersute.com' },
  { icon: '📞', label: '+91 9080063304' },
  { icon: '📍', label: 'Bangalore, India' },
]

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headlineIdx, setHeadlineIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [typing, setTyping] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const [hoveredVision, setHoveredVision] = useState<number | null>(null)
  const [visibleFeatures, setVisibleFeatures] = useState<number[]>([])

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

  useEffect(() => {
    const target = headlines[headlineIdx]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < target.length) {
          setDisplayed(target.slice(0, displayed.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2200)
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1))
        } else {
          setIsDeleting(false)
          setHeadlineIdx((prev) => (prev + 1) % headlines.length)
        }
      }
    }, isDeleting ? 35 : 80)
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, headlineIdx])

  useEffect(() => {
    const interval = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (visibleMessages >= chatMessages.length) {
      const reset = setTimeout(() => {
        setVisibleMessages(0)
        setTyping(false)
      }, 3500)
      return () => clearTimeout(reset)
    }
    setTyping(true)
    const delay = visibleMessages === 0 ? 600 : chatMessages[visibleMessages - 1].from === 'ai' ? 1400 : 1000
    const show = setTimeout(() => {
      setTyping(false)
      setTimeout(() => setVisibleMessages(prev => prev + 1), 150)
    }, delay)
    return () => clearTimeout(show)
  }, [visibleMessages])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          featureData.forEach((_, i) => {
            setTimeout(() => {
              setVisibleFeatures(prev => prev.includes(i) ? prev : [...prev, i])
            }, i * 120)
          })
        }
      })
    }, { threshold: 0.1 })
    const el = document.getElementById('features')
    if (el) observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const nextIsAi = visibleMessages < chatMessages.length && chatMessages[visibleMessages].from === 'ai'

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  function hoverIn(e: React.MouseEvent, translateY: string, shadow: string) {
    const el = e.currentTarget as HTMLElement
    el.style.transform = translateY
    el.style.boxShadow = shadow
  }

  function hoverOut(e: React.MouseEvent, shadow: string) {
    const el = e.currentTarget as HTMLElement
    el.style.transform = 'translateY(0)'
    el.style.boxShadow = shadow
  }

  const navLinks = [
    { href: 'how-it-works', label: 'How it Works' },
    { href: 'features', label: 'Features' },
    { href: 'vision', label: 'Vision' },
    { href: 'contact', label: 'Contact' },
  ]

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      overscrollBehavior: 'none',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>

      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        @keyframes gentleFade {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes softBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes featureIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 40px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/logo.png" alt="Wersute" width={36} height={36} style={{ borderRadius: '8px' }} />
          <span style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', letterSpacing: '-0.01em' }}>
            Wersute
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="mobile-hidden">
          {navLinks.map((item) => (
            <a key={item.href} href={'#' + item.href} onClick={(e) => smoothScroll(e, item.href)}
              style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
              {item.label}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="mobile-hidden">
          {userEmail ? (
            <>
              <div title={userEmail} onClick={() => { window.location.href = '/projects' }} style={{
                width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#1a6fd4',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '700', color: 'white', cursor: 'pointer',
              }}>
                {userEmail[0].toUpperCase()}
              </div>
              <a href="/chat" style={{
                backgroundColor: '#1a6fd4', color: 'white', padding: '8px 20px',
                borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none',
              }}>Continue Building</a>
              <button onClick={handleSignOut} style={{
                background: 'none', border: '1px solid #e2e8f0', color: '#64748b',
                padding: '8px 16px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer',
              }}>Sign Out</button>
            </>
          ) : (
            <>
              <a href="/login" style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>Login</a>
              <a href="/login" style={{
                backgroundColor: '#1a6fd4', color: 'white', padding: '8px 20px',
                borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none',
              }}>Get Started</a>
            </>
          )}
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-only"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
          {menuOpen ? (
            <svg width="24" height="24" fill="none" stroke="#0f172a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="none" stroke="#0f172a" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="mobile-only" style={{
          position: 'fixed', top: '64px', left: 0, right: 0, zIndex: 99,
          backgroundColor: 'white', borderBottom: '1px solid #e2e8f0',
          padding: '16px 24px', display: 'flex', flexDirection: 'column',
        }}>
          {navLinks.map((item) => (
            <a key={item.href} href={'#' + item.href} onClick={(e) => smoothScroll(e, item.href)} style={{
              color: '#374151', fontSize: '15px', textDecoration: 'none',
              padding: '14px 0', borderBottom: '1px solid #f1f5f9', fontWeight: '500',
            }}>{item.label}</a>
          ))}
          <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userEmail ? (
              <>
                <a href="/chat" style={{
                  backgroundColor: '#1a6fd4', color: 'white', padding: '12px', borderRadius: '8px',
                  fontSize: '15px', fontWeight: '600', textDecoration: 'none', textAlign: 'center',
                }}>Continue Building</a>
                <button onClick={handleSignOut} style={{
                  background: 'none', border: '1px solid #e2e8f0', color: '#64748b',
                  padding: '12px', borderRadius: '8px', fontSize: '15px', cursor: 'pointer',
                }}>Sign Out</button>
              </>
            ) : (
              <>
                <a href="/login" style={{
                  backgroundColor: '#1a6fd4', color: 'white', padding: '12px', borderRadius: '8px',
                  fontSize: '15px', fontWeight: '600', textDecoration: 'none', textAlign: 'center',
                }}>Get Started</a>
                <a href="/login" style={{
                  border: '1px solid #e2e8f0', color: '#374151', padding: '12px', borderRadius: '8px',
                  fontSize: '15px', fontWeight: '500', textDecoration: 'none', textAlign: 'center',
                }}>Login</a>
              </>
            )}
          </div>
        </div>
      )}

      {/* HERO */}
      <section style={{
        maxWidth: '1200px', margin: '0 auto', padding: '100px 40px 80px',
        display: 'flex', alignItems: 'center', gap: '60px', flexWrap: 'wrap',
      }}>
        <div style={{ flex: '1', minWidth: '300px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            backgroundColor: '#eff6ff', border: '1px solid #bfdbfe',
            color: '#1a6fd4', fontSize: '12px', fontWeight: '600',
            letterSpacing: '0.08em', textTransform: 'uppercase',
            padding: '6px 16px', borderRadius: '999px', marginBottom: '32px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#1a6fd4">
              <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" />
            </svg>
            AI-Powered Startup Execution
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: '800', lineHeight: '1.1',
            letterSpacing: '-0.03em', margin: '0 0 24px 0', color: '#0f172a',
          }}>
            Your idea deserves{' '}
            <br />
            <span style={{ color: '#1a6fd4' }}>
              {displayed}
              <span style={{
                display: 'inline-block', width: '3px', height: '0.85em',
                backgroundColor: '#1a6fd4', marginLeft: '2px',
                verticalAlign: 'middle', opacity: cursorVisible ? 1 : 0,
                borderRadius: '1px', transition: 'opacity 0.1s',
              }} />
            </span>
          </h1>

          <p style={{ fontSize: '18px', color: '#64748b', lineHeight: '1.7', margin: '0 0 40px 0', maxWidth: '480px' }}>
            Chat with our AI advisor. Get a consultant-grade product blueprint.
            We match you with the right developer and manage the entire build.
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href={userEmail ? '/chat' : '/login'} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={(e) => hoverIn(e, 'translateY(-2px)', '0 8px 32px rgba(26,111,212,0.4)')}
                onMouseLeave={(e) => hoverOut(e, '0 4px 24px rgba(26,111,212,0.3)')}
                style={{
                  backgroundColor: '#1a6fd4', color: 'white', padding: '14px 32px',
                  borderRadius: '10px', fontSize: '16px', fontWeight: '600',
                  display: 'inline-flex', alignItems: 'center', gap: '8px',
                  cursor: 'pointer', boxShadow: '0 4px 24px rgba(26,111,212,0.3)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" />
                </svg>
                {userEmail ? 'Continue Building' : 'Get Started — Free'}
              </div>
            </a>
            <a href="#how-it-works" onClick={(e) => smoothScroll(e, 'how-it-works')} style={{ textDecoration: 'none' }}>
              <div
                onMouseEnter={(e) => hoverIn(e, 'translateY(-1px)', '0 4px 16px rgba(0,0,0,0.06)')}
                onMouseLeave={(e) => hoverOut(e, 'none')}
                style={{
                  border: '1px solid #e2e8f0', color: '#374151', padding: '14px 32px',
                  borderRadius: '10px', fontSize: '16px', fontWeight: '600', cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
              >
                How it Works
              </div>
            </a>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '16px' }}>No credit card required</p>
        </div>

        {/* Animated chat */}
        <div style={{ flex: '1', minWidth: '280px', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            backgroundColor: '#1a6fd4', borderRadius: '24px', padding: '24px',
            maxWidth: '360px', width: '100%', height: '420px',
            boxShadow: '0 24px 60px rgba(26,111,212,0.25)',
            display: 'flex', flexDirection: 'column',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              marginBottom: '20px', paddingBottom: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.2)', flexShrink: 0,
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                backgroundColor: 'rgba(255,255,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z" />
                </svg>
              </div>
              <div>
                <div style={{ color: 'white', fontSize: '13px', fontWeight: '600' }}>Wersute AI</div>
                <div style={{ fontSize: '11px', color: typing ? '#bbf7d0' : 'rgba(255,255,255,0.5)', transition: 'color 0.3s' }}>
                  {typing ? 'typing...' : 'online'}
                </div>
              </div>
              <div style={{
                marginLeft: 'auto', width: '8px', height: '8px',
                borderRadius: '50%', backgroundColor: '#4ade80', boxShadow: '0 0 6px #4ade80',
              }} />
            </div>

            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              justifyContent: 'flex-end', gap: '8px', overflow: 'hidden', marginBottom: '16px',
            }}>
              {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                  opacity: 0, animation: 'gentleFade 0.4s ease forwards',
                }}>
                  <div style={{
                    backgroundColor: msg.from === 'user' ? 'white' : 'rgba(255,255,255,0.18)',
                    color: msg.from === 'user' ? '#1a6fd4' : 'white',
                    padding: '9px 13px',
                    borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    fontSize: '13px', lineHeight: '1.5', maxWidth: '85%',
                    fontWeight: msg.from === 'user' ? '600' : '400',
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {typing && (
                <div style={{
                  display: 'flex', justifyContent: nextIsAi ? 'flex-start' : 'flex-end',
                  opacity: 0, animation: 'gentleFade 0.3s ease forwards',
                }}>
                  <div style={{
                    backgroundColor: 'rgba(255,255,255,0.18)', padding: '10px 14px',
                    borderRadius: '14px', display: 'flex', gap: '4px', alignItems: 'center',
                  }}>
                    {[0, 160, 320].map((delay) => (
                      <span key={delay} style={{
                        width: '5px', height: '5px', borderRadius: '50%',
                        backgroundColor: 'rgba(255,255,255,0.7)', display: 'inline-block',
                        animationName: 'softBounce',
                        animationDuration: '1.2s',
                        animationIterationCount: 'infinite',
                        animationTimingFunction: 'ease-in-out',
                        animationDelay: `${delay}ms`,
                      }} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{
              backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '12px', padding: '10px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px' }}>Describe your idea...</span>
              <div style={{
                backgroundColor: 'white', width: '26px', height: '26px',
                borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#1a6fd4">
                  <path d="M22 2L11 13M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ backgroundColor: '#f8fafc', padding: '80px 40px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
              How it Works
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
              From idea to live product in three simple steps
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {stepData.map((item, i) => (
              <div key={item.step}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  flex: '1', minWidth: '260px', maxWidth: '340px',
                  backgroundColor: 'white', borderRadius: '20px', padding: '36px 32px',
                  border: hoveredStep === i ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  position: 'relative',
                  boxShadow: hoveredStep === i ? '0 12px 40px rgba(26,111,212,0.12)' : '0 2px 16px rgba(0,0,0,0.04)',
                  transform: hoveredStep === i ? 'translateY(-4px)' : 'translateY(0)',
                  transition: 'all 0.25s ease', cursor: 'default',
                }}
              >
                <div style={{
                  position: 'absolute', top: '28px', right: '28px',
                  color: '#1a6fd4', fontSize: '11px', fontWeight: '800', letterSpacing: '0.1em', opacity: 0.3,
                }}>
                  {item.step}
                </div>
                <div style={{ fontSize: '36px', marginBottom: '20px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: '80px 40px', backgroundColor: '#1a6fd4' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 16px 0', color: 'white' }}>
              Everything You Need
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', maxWidth: '480px', margin: '0 auto' }}>
              Built for founders who want to move fast
            </p>
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {featureData.map((item, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  flex: '1', minWidth: '240px', maxWidth: '340px',
                  backgroundColor: hoveredFeature === i ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '16px', padding: '28px 24px',
                  border: hoveredFeature === i ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.15)',
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredFeature === i ? '0 12px 32px rgba(0,0,0,0.15)' : 'none',
                  transition: 'all 0.25s ease', cursor: 'default',
                  opacity: visibleFeatures.includes(i) ? 1 : 0,
                  animationName: visibleFeatures.includes(i) ? 'featureIn' : 'none',
                  animationDuration: '0.5s',
                  animationFillMode: 'forwards',
                  animationTimingFunction: 'ease',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  backgroundColor: hoveredFeature === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '16px', transition: 'background 0.25s',
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={featureIcons[i]} />
                  </svg>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'white', marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" style={{ padding: '80px 40px', backgroundColor: 'white' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', letterSpacing: '-0.02em', margin: '0 0 16px 0' }}>
              Our Vision
            </h2>
            <p style={{ color: '#64748b', fontSize: '17px', maxWidth: '560px', margin: '0 auto' }}>
              We believe every great idea deserves a chance to become a real product
            </p>
          </div>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {visionData.map((item, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredVision(i)}
                onMouseLeave={() => setHoveredVision(null)}
                style={{
                  flex: '1', minWidth: '260px', maxWidth: '340px',
                  backgroundColor: hoveredVision === i ? '#eff6ff' : '#f8fafc',
                  borderRadius: '20px', padding: '36px 32px',
                  border: hoveredVision === i ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  textAlign: 'center',
                  transform: hoveredVision === i ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: hoveredVision === i ? '0 12px 40px rgba(26,111,212,0.1)' : 'none',
                  transition: 'all 0.25s ease', cursor: 'default',
                }}
              >
                <div style={{ fontSize: '40px', marginBottom: '20px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#1a6fd4', marginBottom: '12px' }}>{item.title}</h3>
                <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ backgroundColor: '#0f172a', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: '800', color: 'white', letterSpacing: '-0.02em', margin: '0 0 20px 0' }}>
            Ready to build your startup?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', marginBottom: '40px' }}>
            Join founders who are turning ideas into products with Wersute.
          </p>
          <a href={userEmail ? '/chat' : '/login'} style={{ textDecoration: 'none' }}>
            <div
              onMouseEnter={(e) => hoverIn(e, 'translateY(-2px)', '0 0 60px rgba(26,111,212,0.6)')}
              onMouseLeave={(e) => hoverOut(e, '0 0 40px rgba(26,111,212,0.4)')}
              style={{
                backgroundColor: '#1a6fd4', color: 'white', padding: '16px 48px',
                borderRadius: '12px', fontSize: '17px', fontWeight: '700',
                display: 'inline-block', cursor: 'pointer',
                boxShadow: '0 0 40px rgba(26,111,212,0.4)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              {userEmail ? 'Continue Building' : 'Start Building — Free'}
            </div>
          </a>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', marginTop: '16px' }}>No credit card required</p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" style={{ backgroundColor: '#1a6fd4', padding: '80px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: '800', color: 'white', margin: '0 0 16px 0' }}>
            Contact Us
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '17px', marginBottom: '48px' }}>
            Have questions or need support? Get in touch.
          </p>
          <div style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {contactData.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>{item.icon}</span>
                <span style={{ color: 'white', fontSize: '15px', fontWeight: '500' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#0f172a', padding: '28px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Image src="/logo.png" alt="Wersute" width={28} height={28} style={{ borderRadius: '6px' }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px' }}>© 2025 Wersute. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <a href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', textDecoration: 'none' }}>Terms of Use</a>
        </div>
      </footer>

    </main>
  )
}
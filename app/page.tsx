'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

// Rotating phrases that complete "Ship your product..."
const headlines = [
  'without hiring a tech team.',
  'without losing equity.',
  'without the agency markup.',
  'and keep 100% of your IP.',
]

// Rotating eyebrow pill phrases
const eyebrowPhrases = [
  'AI-powered fractional CTO',
  'Built for non-technical founders',
]

const chatMessages = [
  { from: 'ai', text: "What's the product you want to build?" },
  { from: 'user', text: "A booking app for local tutors near my area." },
  { from: 'ai', text: "Got it. Will parents pay per session or subscribe monthly?" },
  { from: 'user', text: "Pay per session, with reviews after each one." },
  { from: 'ai', text: "Blueprint ready. Want me to start finding your developer?" },
]

// Dashboard stages (collapsed from 6 → 4 for clean hero animation)
const dashboardStages = [
  { label: 'Finding your developer' },
  { label: 'Developer assigned' },
  { label: 'Being built' },
  { label: 'Ready to ship 🚀' },
]

const steps = [
  {
    num: '01',
    title: 'Describe your idea',
    desc: 'Talk to our AI in plain language. It asks the right questions to scope your product — no tech jargon, no assumptions.',
  },
  {
    num: '02',
    title: 'Get your blueprint',
    desc: 'A detailed breakdown of features, tech stack, timeline, and accurate cost in INR. Reviewed before any developer touches it.',
  },
  {
    num: '03',
    title: 'Matched and built',
    desc: 'We hand-pick a vetted developer for your stack, manage the build end-to-end, and run everything — chat, milestones, payments — inside the platform.',
  },
  {
    num: '04',
    title: 'Launch',
    desc: 'Get a shipped product, full source code, and 100% IP ownership. You keep everything. We just handed it to you.',
  },
]

// Reordered: managed execution → IP → vetted devs → progress → AI scoping → blueprint
const features = [
  {
    title: 'Managed end-to-end',
    desc: 'Our team runs the build for you. Chat, milestones, deliverables, and payments all happen inside the platform — you never chase anyone.',
    icon: '🛡️',
  },
  {
    title: 'You own 100% IP',
    desc: 'Source code, designs, and product rights belong to you from day one. No licensing tricks, no shared ownership, no surprises.',
    icon: '🔐',
  },
  {
    title: 'Vetted developers',
    desc: 'Hand-picked engineers matched to your stack and budget. We vet them so you don\'t have to interview ten people to find one.',
    icon: '🤝',
  },
  {
    title: 'Live progress dashboard',
    desc: 'See exactly where your project stands at every stage — from matching to delivery — without scheduling a status call.',
    icon: '📊',
  },
  {
    title: 'AI-powered scoping',
    desc: 'AI that asks the right questions to define exactly what needs building — so the blueprint reflects your actual product, not a guess.',
    icon: '🎯',
  },
  {
    title: 'Honest pricing',
    desc: 'Cost estimates in INR based only on features you confirm. Fixed milestones, no surprise add-ons mid-build.',
    icon: '💰',
  },
]

const visionItems = [
  {
    label: 'Founder First',
    desc: 'You stay in control. We handle complexity — matching, project management, payments — so you can focus on your product and your users.',
  },
  {
    label: 'Built for India',
    desc: 'INR pricing, an Indian developer network, and full IP ownership under Indian law. No offshore games, no equity asks.',
  },
  {
    label: 'Speed to ship',
    desc: 'Idea to blueprint in one conversation. Blueprint to shipped product in weeks — not the six-month agency timeline.',
  },
]

const trustChips = [
  '100% IP yours',
  'Vetted developers',
  'Fixed milestones',
  'Managed end-to-end',
]

const CHAT_WIDTH = 650
// Animation phase durations (ms)
const CHAT_MSG_INTERVAL = 1200
const BLUEPRINT_BUTTON_DELAY = 1400
const DASHBOARD_STAGE_INTERVAL = 1800
const LOOP_RESET_DELAY = 2600

type AnimPhase = 'chat' | 'transition' | 'dashboard'

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headlineIdx, setHeadlineIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)

  // Eyebrow pill rotation
  const [eyebrowIdx, setEyebrowIdx] = useState(0)

  // Animation phase
  const [animPhase, setAnimPhase] = useState<AnimPhase>('chat')
  const [chatIdx, setChatIdx] = useState(0)
  const [chatVisible, setChatVisible] = useState<number[]>([])
  const [showBlueprintButton, setShowBlueprintButton] = useState(false)
  const [dashboardStageIdx, setDashboardStageIdx] = useState(-1) // -1 = none active yet

  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [barHeights, setBarHeights] = useState([0, 0, 0])
  const [isMobile, setIsMobile] = useState(false)
  const visionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ]

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Typewriter headline
  useEffect(() => {
    const target = headlines[headlineIdx]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayed.length < target.length) {
          setDisplayed(target.slice(0, displayed.length + 1))
        } else {
          setTimeout(() => setIsDeleting(true), 2400)
        }
      } else {
        if (displayed.length > 0) {
          setDisplayed(displayed.slice(0, -1))
        } else {
          setIsDeleting(false)
          setHeadlineIdx(p => (p + 1) % headlines.length)
        }
      }
    }, isDeleting ? 30 : 65)
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, headlineIdx])

  useEffect(() => {
    const i = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(i)
  }, [])

  // Eyebrow pill rotation — slow fade between two phrases
  useEffect(() => {
    const i = setInterval(() => {
      setEyebrowIdx(p => (p + 1) % eyebrowPhrases.length)
    }, 3800)
    return () => clearInterval(i)
  }, [])

  // CHAT PHASE: stream messages
  useEffect(() => {
    if (animPhase !== 'chat') return
    if (chatIdx >= chatMessages.length) {
      // After last chat msg, show the "View blueprint" button, then transition
      const t = setTimeout(() => setShowBlueprintButton(true), 600)
      const t2 = setTimeout(() => {
        setAnimPhase('transition')
      }, BLUEPRINT_BUTTON_DELAY + 600)
      return () => { clearTimeout(t); clearTimeout(t2) }
    }
    const t = setTimeout(() => {
      setChatVisible(p => [...p, chatIdx])
      setChatIdx(p => p + 1)
    }, chatIdx === 0 ? 700 : CHAT_MSG_INTERVAL)
    return () => clearTimeout(t)
  }, [chatIdx, animPhase])

  // TRANSITION PHASE: brief pause, then dashboard
  useEffect(() => {
    if (animPhase !== 'transition') return
    const t = setTimeout(() => {
      setAnimPhase('dashboard')
      setDashboardStageIdx(0)
    }, 700)
    return () => clearTimeout(t)
  }, [animPhase])

  // DASHBOARD PHASE: progress through stages, then loop
  useEffect(() => {
    if (animPhase !== 'dashboard') return
    if (dashboardStageIdx >= dashboardStages.length - 1) {
      // Hold on completed, then reset entire loop
      const t = setTimeout(() => {
        setAnimPhase('chat')
        setChatVisible([])
        setChatIdx(0)
        setShowBlueprintButton(false)
        setDashboardStageIdx(-1)
      }, LOOP_RESET_DELAY)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setDashboardStageIdx(p => p + 1)
    }, DASHBOARD_STAGE_INTERVAL)
    return () => clearTimeout(t)
  }, [dashboardStageIdx, animPhase])

  useEffect(() => {
    function handleScroll() {
      visionRefs.forEach((ref, i) => {
        if (!ref.current) return
        const rect = ref.current.getBoundingClientRect()
        const visible = Math.max(0, Math.min(window.innerHeight - rect.top, rect.height))
        const pct = Math.min(1, Math.max(0, visible / rect.height))
        setBarHeights(prev => { const n = [...prev]; n[i] = pct * 100; return n })
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  function smoothScroll(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  const navLinks = [
    { href: 'how-it-works', label: 'How it works' },
    { href: 'features', label: 'Features' },
    { href: 'vision', label: 'Vision' },
    { href: 'contact', label: 'Contact' },
  ]

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      color: '#0f172a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      overscrollBehavior: 'none',
    }}>

      <style dangerouslySetInnerHTML={{ __html: `
        html { scroll-behavior: smooth; }
        * { box-sizing: border-box; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
        @keyframes pulseBlue {
          0%, 100% { box-shadow: 0 0 0 0 rgba(26,111,212,0.5); }
          50% { box-shadow: 0 0 0 6px rgba(26,111,212,0); }
        }
        @keyframes eyebrowFade {
          0%, 45% { opacity: 1; transform: translateY(0); }
          50%, 55% { opacity: 0; transform: translateY(-4px); }
          60%, 100% { opacity: 1; transform: translateY(0); }
        }
        .chat-inner {
          width: 100%;
          aspect-ratio: 4/3;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 12px 60px rgba(0,0,0,0.12);
          display: flex;
          flex-direction: column;
        }
        @media (max-width: 768px) {
          .chat-inner {
            aspect-ratio: unset !important;
            height: 460px !important;
          }
        }
        .nav-desktop-links {
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .nav-desktop-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }
        .nav-mobile-btn {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .nav-desktop-links { display: none !important; }
          .nav-desktop-actions { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
        .trust-chips {
          display: flex;
          gap: 18px;
          flex-wrap: wrap;
          margin-top: 22px;
        }
        .trust-chip {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 12.5px;
          color: #64748b;
          font-weight: 500;
        }
        .trust-chip::before {
          content: '';
          width: 14px;
          height: 14px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%231a6fd4' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>");
          background-size: contain;
          background-repeat: no-repeat;
          flex-shrink: 0;
        }
        @media (max-width: 768px) {
          .trust-chips { gap: 12px 16px; }
          .trust-chip { font-size: 12px; }
        }
      `}} />

      {/* NAV */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <div style={{
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Wersute" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Wersute</span>
          </div>

          <div className="nav-desktop-links">
            {navLinks.map(item => (
              <a key={item.href} href={'#' + item.href}
                onClick={e => smoothScroll(e, item.href)}
                style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                {item.label}
              </a>
            ))}
          </div>

          <div className="nav-desktop-actions">
            {userEmail ? (
              <>
                <div
                  title={userEmail}
                  onClick={() => { window.location.href = '/projects' }}
                  style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    backgroundColor: '#1a6fd4', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: '12px', fontWeight: '700',
                    color: 'white', cursor: 'pointer',
                  }}>
                  {userEmail[0].toUpperCase()}
                </div>
                <a href="/chat" style={{
                  backgroundColor: '#1a6fd4', color: 'white', padding: '7px 16px',
                  borderRadius: '7px', fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                }}>Continue building</a>
                <button onClick={handleSignOut} style={{
                  background: 'none', border: '1px solid #e2e8f0', color: '#64748b',
                  padding: '7px 14px', borderRadius: '7px', fontSize: '13px', cursor: 'pointer',
                }}>Sign out</button>
              </>
            ) : (
              <>
                <a href="/login" style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                  Login
                </a>
                <a href="/login" style={{
                  backgroundColor: '#1a6fd4', color: 'white', padding: '7px 16px',
                  borderRadius: '7px', fontSize: '13px', fontWeight: '600', textDecoration: 'none',
                }}>Talk to your AI CTO</a>
              </>
            )}
          </div>

          <button
            className="nav-mobile-btn"
            onClick={() => setMenuOpen(o => !o)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round">
              {menuOpen
                ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
              }
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div style={{
            backgroundColor: 'white',
            borderTop: '1px solid #f1f5f9',
            padding: '8px 0 16px',
          }}>
            {navLinks.map(item => (
              <a
                key={item.href}
                href={'#' + item.href}
                onClick={e => smoothScroll(e, item.href)}
                style={{
                  display: 'block', color: '#374151', fontSize: '15px',
                  textDecoration: 'none', padding: '12px 24px',
                  borderBottom: '1px solid #f8fafc', fontWeight: '500',
                }}>
                {item.label}
              </a>
            ))}
            <div style={{ padding: '12px 24px 0' }}>
              <a href={userEmail ? '/chat' : '/login'} style={{
                display: 'block', backgroundColor: '#1a6fd4', color: 'white',
                padding: '12px', borderRadius: '8px', fontSize: '14px',
                fontWeight: '600', textDecoration: 'none', textAlign: 'center',
              }}>
                {userEmail ? 'Continue building' : 'Talk to your AI CTO'}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '60px',
        padding: isMobile ? '100px 24px 60px' : '80px 60px',
        background: 'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(26,111,212,0.07), transparent)',
        maxWidth: '1440px',
        margin: '0 auto',
      }}>
        {/* Left */}
        <div style={{ flex: '1', minWidth: '260px' }}>
          {/* Eyebrow pill — animated rotation */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            border: '1px solid #bfdbfe', borderRadius: '999px',
            padding: '5px 14px', marginBottom: '32px', backgroundColor: '#eff6ff',
            fontSize: '12px', color: '#1a6fd4', letterSpacing: '0.04em', fontWeight: '600',
            position: 'relative', overflow: 'hidden',
            minHeight: '24px',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a6fd4', display: 'inline-block', flexShrink: 0 }} />
            <span
              key={eyebrowIdx}
              style={{
                display: 'inline-block',
                animation: 'fadeUp 0.5s ease both',
                whiteSpace: 'nowrap',
              }}
            >
              {eyebrowPhrases[eyebrowIdx]}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 3.5vw, 56px)', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: '1.06',
            margin: '0 0 8px 0', color: '#0f172a',
          }}>
            Ship your product
          </h1>
          <h1 style={{
            fontSize: 'clamp(30px, 3.5vw, 56px)', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: '1.06',
            margin: '0 0 18px 0', color: '#1a6fd4',
            minHeight: 'clamp(38px, 4.5vw, 68px)',
          }}>
            {displayed}
            <span style={{
              display: 'inline-block', width: '3px',
              height: 'clamp(28px, 3.2vw, 50px)',
              backgroundColor: '#1a6fd4', marginLeft: '3px',
              verticalAlign: 'middle', borderRadius: '2px',
              opacity: cursorVisible ? 1 : 0, transition: 'opacity 0.1s',
            }} />
          </h1>

          {/* Manjula's framing line — sleek and small, sits under the headline */}
          <p style={{
            fontSize: 'clamp(13px, 1vw, 14px)',
            color: '#94a3b8',
            margin: '0 0 24px 0',
            fontWeight: '500',
            letterSpacing: '0.01em',
          }}>
            <span style={{ color: '#1a6fd4', fontWeight: '600' }}>Wersute</span> is your fractional CTO — AI plans it, vetted developers build it, we manage the whole thing.
          </p>

          <p style={{
            fontSize: 'clamp(14px, 1.2vw, 17px)', color: '#64748b',
            maxWidth: '440px', lineHeight: '1.7', margin: '0 0 32px 0',
          }}>
            Talk to our AI to scope your product. Get a consultant-grade blueprint.
            We match you with a vetted developer and run the entire build — chat, milestones, payments — inside the platform. You keep 100% IP.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={userEmail ? '/chat' : '/login'} style={{
              backgroundColor: '#1a6fd4', color: 'white', padding: '11px 26px',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none',
            }}>
              {userEmail ? 'Continue building' : 'Talk to your AI CTO'}
            </a>
            <a href="#how-it-works" onClick={e => smoothScroll(e, 'how-it-works')} style={{
              border: '1px solid #e2e8f0', color: '#64748b', padding: '11px 26px',
              borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none',
            }}>
              See how it works
            </a>
          </div>

          {/* Trust chips — sleek inline strip */}
          <div className="trust-chips">
            {trustChips.map(chip => (
              <span key={chip} className="trust-chip">{chip}</span>
            ))}
          </div>

          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '18px' }}>No credit card required</p>
        </div>

        {/* Right — animated chat → dashboard */}
        <div style={{ flexShrink: 0, width: '100%', maxWidth: isMobile ? '100%' : `${CHAT_WIDTH}px` }}>
          <div className="chat-inner">
            {/* Window chrome */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: '7px',
              backgroundColor: '#f8fafc', flexShrink: 0,
            }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#fca5a5' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#fde68a' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#86efac' }} />
              <span style={{ marginLeft: '8px', fontSize: '13px', color: '#94a3b8', flex: 1, textAlign: 'center', fontWeight: '500' }}>
                {animPhase === 'chat' || animPhase === 'transition' ? 'Wersute AI' : 'Project Dashboard'}
              </span>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
            </div>

            {/* === CHAT PHASE === */}
            {(animPhase === 'chat' || animPhase === 'transition') && (
              <>
                <div style={{
                  flex: 1, padding: '16px 20px',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', gap: '8px', overflow: 'hidden',
                }}>
                  <div style={{ flex: 1 }} />
                  {chatMessages.map((msg, i) => (
                    chatVisible.includes(i) && (
                      <div key={i} style={{
                        display: 'flex',
                        justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start',
                        animation: 'fadeUp 0.3s ease both', flexShrink: 0,
                      }}>
                        <div style={{
                          padding: '9px 14px', borderRadius: '10px', fontSize: '14px',
                          lineHeight: '1.5', maxWidth: '75%',
                          backgroundColor: msg.from === 'user' ? '#1a6fd4' : '#f1f5f9',
                          color: msg.from === 'user' ? 'white' : '#374151',
                        }}>
                          {msg.text}
                        </div>
                      </div>
                    )
                  ))}
                  {animPhase === 'chat' && chatIdx < chatMessages.length && chatIdx > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: chatMessages[chatIdx]?.from === 'user' ? 'flex-end' : 'flex-start',
                      flexShrink: 0,
                    }}>
                      <div style={{
                        padding: '10px 14px', borderRadius: '10px', backgroundColor: '#f1f5f9',
                        display: 'flex', gap: '4px', alignItems: 'center',
                      }}>
                        {[0, 1, 2].map(j => (
                          <span key={j} style={{
                            width: '5px', height: '5px', borderRadius: '50%',
                            backgroundColor: '#94a3b8', display: 'inline-block',
                            animationName: 'dot', animationDuration: '1.2s',
                            animationIterationCount: 'infinite', animationTimingFunction: 'ease',
                            animationDelay: `${j * 0.2}s`,
                          }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom area: input OR "View blueprint" button */}
                <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
                  {showBlueprintButton ? (
                    <button
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        backgroundColor: '#1a6fd4',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        animation: 'fadeUp 0.4s ease both, pulseBlue 1.6s ease-in-out infinite',
                      }}
                    >
                      <span>View blueprint &amp; start build</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </button>
                  ) : (
                    <div style={{
                      padding: '10px 14px', backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0', borderRadius: '8px',
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <span style={{ flex: 1, fontSize: '14px', color: '#94a3b8' }}>Describe your idea...</span>
                      <div style={{
                        width: '28px', height: '28px', borderRadius: '6px', backgroundColor: '#1a6fd4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                          <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* === DASHBOARD PHASE === */}
            {animPhase === 'dashboard' && (
              <div style={{
                flex: 1,
                padding: '20px 22px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
                animation: 'fadeIn 0.4s ease both',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <p style={{
                    fontSize: '10.5px',
                    color: '#94a3b8',
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    fontWeight: '600',
                    margin: 0,
                  }}>
                    Project status
                  </p>
                  <span style={{
                    fontSize: '11px',
                    color: '#1a6fd4',
                    fontWeight: '600',
                    backgroundColor: '#eff6ff',
                    padding: '3px 9px',
                    borderRadius: '999px',
                  }}>
                    Live
                  </span>
                </div>

                {/* Stages list */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  flex: 1,
                }}>
                  {dashboardStages.map((stage, i) => {
                    const isCompleted = i < dashboardStageIdx
                    const isCurrent = i === dashboardStageIdx
                    const isPending = i > dashboardStageIdx
                    return (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        opacity: isPending ? 0.45 : 1,
                        transition: 'opacity 0.4s ease',
                      }}>
                        <div style={{
                          width: '20px', height: '20px',
                          borderRadius: '50%',
                          backgroundColor: isCompleted ? '#1a6fd4' : isCurrent ? '#1a6fd4' : '#e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          animation: isCurrent ? 'pulseBlue 1.8s ease-in-out infinite' : 'none',
                          transition: 'background-color 0.4s ease',
                        }}>
                          {isCompleted && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span style={{
                          fontSize: '14px',
                          fontWeight: isCurrent ? '600' : '500',
                          color: isPending ? '#94a3b8' : isCurrent ? '#0f172a' : '#475569',
                          flex: 1,
                          transition: 'color 0.4s ease',
                        }}>
                          {stage.label}
                        </span>
                        {isCurrent && i !== dashboardStages.length - 1 && (
                          <span style={{
                            fontSize: '10.5px',
                            color: '#1a6fd4',
                            fontWeight: '600',
                            backgroundColor: '#eff6ff',
                            padding: '3px 8px',
                            borderRadius: '999px',
                            animation: 'fadeIn 0.3s ease both',
                          }}>
                            Current
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Developer card — appears when "Developer assigned" or beyond */}
                {dashboardStageIdx >= 1 && (
                  <div style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    backgroundColor: '#fafbfc',
                    animation: 'slideInRight 0.5s ease both',
                  }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1a6fd4 0%, #60a5fa 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '13px',
                      fontWeight: '700',
                      flexShrink: 0,
                    }}>
                      PS
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0f172a',
                        marginBottom: '2px',
                      }}>
                        Priya Sharma
                      </div>
                      <div style={{
                        fontSize: '11.5px',
                        color: '#64748b',
                      }}>
                        Full-stack · React + Node · 5+ yrs
                      </div>
                    </div>
                    <span style={{
                      fontSize: '10.5px',
                      color: '#15803d',
                      fontWeight: '600',
                      backgroundColor: '#dcfce7',
                      padding: '3px 9px',
                      borderRadius: '999px',
                      flexShrink: 0,
                    }}>
                      Assigned
                    </span>
                  </div>
                )}

                {/* "Ready to ship" celebration banner */}
                {dashboardStageIdx >= dashboardStages.length - 1 && (
                  <div style={{
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    backgroundColor: '#eff6ff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeUp 0.5s ease both',
                  }}>
                    <span style={{ fontSize: '20px' }}>🎉</span>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#0f172a',
                      }}>
                        Your product is ready to ship
                      </div>
                      <div style={{
                        fontSize: '11.5px',
                        color: '#64748b',
                        marginTop: '1px',
                      }}>
                        Source code &amp; 100% IP delivered.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — now 4 steps */}
      <section id="how-it-works" style={{ padding: isMobile ? '60px 24px' : '100px 60px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
            Process
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '64px', color: '#0f172a' }}>
            From idea to shipped product.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                paddingLeft: !isMobile && i > 0 ? '32px' : '0',
                paddingRight: !isMobile && i < steps.length - 1 ? '32px' : '0',
                borderRight: !isMobile && i < steps.length - 1 ? '1px solid #f1f5f9' : 'none',
                borderBottom: isMobile && i < steps.length - 1 ? '1px solid #f1f5f9' : 'none',
                paddingBottom: isMobile && i < steps.length - 1 ? '40px' : '0',
                paddingTop: isMobile && i > 0 ? '40px' : '0',
              }}>
                <div style={{
                  fontSize: '48px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1,
                  marginBottom: '22px',
                  background: 'linear-gradient(135deg, #1a6fd4 0%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14.5px', color: '#64748b', lineHeight: '1.65', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES — reordered, managed-execution leads */}
      <section id="features" style={{ padding: isMobile ? '60px 24px' : '100px 60px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
            What you get
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '56px', color: '#0f172a' }}>
            A real tech team, without hiring one.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {features.map((item, i) => {
              const isIP = i === 1
              return (
                <div key={i}
                  onMouseEnter={() => setHoveredFeature(i)}
                  onMouseLeave={() => setHoveredFeature(null)}
                  style={{
                    backgroundColor: 'white', borderRadius: '12px', padding: '28px 24px',
                    border: hoveredFeature === i ? '1px solid #bfdbfe' : isIP ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                    boxShadow: hoveredFeature === i
                      ? '0 8px 32px rgba(26,111,212,0.12)'
                      : isIP ? '0 4px 20px rgba(26,111,212,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
                    transform: hoveredFeature === i ? 'translateY(-3px)' : 'translateY(0)',
                    transition: 'all 0.2s ease', cursor: 'default',
                    position: 'relative',
                  }}
                >
                  {isIP && (
                    <span style={{
                      position: 'absolute',
                      top: '14px',
                      right: '14px',
                      fontSize: '10.5px',
                      fontWeight: '600',
                      color: '#1a6fd4',
                      backgroundColor: '#eff6ff',
                      padding: '3px 9px',
                      borderRadius: '999px',
                      letterSpacing: '0.04em',
                    }}>
                      Guarantee
                    </span>
                  )}
                  <div style={{
                    fontSize: '26px', marginBottom: '16px', width: '48px', height: '48px',
                    backgroundColor: hoveredFeature === i ? '#eff6ff' : isIP ? '#eff6ff' : '#f8fafc',
                    borderRadius: '12px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', transition: 'background 0.2s',
                  }}>
                    {item.icon}
                  </div>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                    {item.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.65', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* VISION */}
      <section id="vision" style={{ padding: isMobile ? '60px 24px' : '100px 60px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '80px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ flex: '1', minWidth: '260px' }}>
            <p style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '600' }}>
              Vision
            </p>
            <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: '700', letterSpacing: '-0.03em', color: '#0f172a', lineHeight: '1.2', margin: '0 0 24px 0' }}>
              Every great idea deserves a real shot at existing.
            </h2>
            <div style={{ width: '40px', height: '3px', backgroundColor: '#1a6fd4', borderRadius: '2px' }} />
          </div>
          <div style={{ flex: '1', minWidth: '260px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {visionItems.map((item, i) => (
              <div key={i} ref={visionRefs[i]} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{
                  width: '3px', height: '80px', backgroundColor: '#f1f5f9',
                  borderRadius: '2px', flexShrink: 0, marginTop: '4px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    backgroundColor: '#1a6fd4', borderRadius: '2px',
                    height: `${barHeights[i]}%`, transition: 'height 0.1s linear',
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', marginBottom: '8px', letterSpacing: '-0.01em' }}>
                    {item.label}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.65', margin: 0 }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — risk-reversal */}
      <section style={{ backgroundColor: '#1a6fd4', padding: isMobile ? '60px 24px' : '100px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700', letterSpacing: '-0.04em', color: 'white', margin: '0 0 20px 0', lineHeight: '1.1' }}>
            Talk to your AI CTO.<br />We handle the rest.
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.78)', margin: '0 0 36px 0', lineHeight: '1.6' }}>
            Managed build. Fixed milestones. Fixed price. 100% IP yours.
          </p>
          <a href={userEmail ? '/chat' : '/login'} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-block', backgroundColor: 'white', color: '#1a6fd4',
              padding: '13px 36px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            }}>
              {userEmail ? 'Continue building' : 'Talk to your AI CTO'}
            </div>
          </a>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginTop: '16px' }}>No credit card required</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contact" style={{
        padding: isMobile ? '40px 24px' : '48px 60px',
        borderTop: '1px solid #f1f5f9',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Image src="/logo.png" alt="Wersute" width={24} height={24} style={{ borderRadius: '5px' }} />
          <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Wersute</span>
          <span style={{ color: '#e2e8f0', margin: '0 8px' }}>|</span>
          <span style={{ fontSize: '13px', color: '#94a3b8' }}>© 2025 All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          {['info@wersute.com', '+91 9080063304', 'Bangalore, India'].map((item, i) => (
            <span key={i} style={{ fontSize: '13px', color: '#64748b' }}>{item}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {['Privacy Policy', 'Terms of Use'].map((item, i) => (
            <a key={i} href="#" style={{ fontSize: '13px', color: '#94a3b8', textDecoration: 'none' }}>{item}</a>
          ))}
        </div>
      </footer>

    </main>
  )
}
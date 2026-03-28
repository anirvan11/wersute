'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

const headlines = [
  'to be built.',
  'to launch fast.',
  'to find its users.',
  'to make an impact.',
]

const chatMessages = [
  { from: 'ai', text: 'What problem does your startup solve?' },
  { from: 'user', text: 'Meal delivery for elderly living alone.' },
  { from: 'ai', text: 'Will payments happen in-app or offline?' },
  { from: 'user', text: 'In-app, subscription model.' },
  { from: 'ai', text: 'Blueprint ready. Generating now...' },
]

const steps = [
  { num: '01', title: 'Describe your idea', desc: 'Tell our AI what you want to build in plain language. No technical knowledge needed — just explain the problem you want to solve.' },
  { num: '02', title: 'Receive your blueprint', desc: 'Get a detailed breakdown of your product — features, recommended tech stack, timeline, and accurate cost estimates in INR.' },
  { num: '03', title: 'We handle the rest', desc: 'We match you with the right developer and manage the entire build. Track progress live on your dashboard.' },
]

const features = [
  { title: 'Intelligent scoping', desc: 'AI that asks the right questions to define exactly what needs to be built — no assumptions.', icon: '🎯' },
  { title: 'Accurate pricing', desc: 'Cost estimates in INR based only on features you actually confirm. Budget and premium tiers.', icon: '💰' },
  { title: 'Structured blueprints', desc: 'Every blueprint includes stack, timeline, complexity score, and a full feature breakdown.', icon: '📐' },
  { title: 'Developer matching', desc: 'Matched to developers who fit your specific tech stack and budget requirements.', icon: '🤝' },
  { title: 'Progress tracking', desc: 'A live dashboard that shows exactly where your project stands at every stage.', icon: '📊' },
  { title: 'Managed execution', desc: 'Our team oversees delivery end-to-end so you never have to chase anyone.', icon: '🛡️' },
]

const visionItems = [
  { label: 'Founder First', desc: 'Every decision is made with the founder in mind. We remove complexity, not control.' },
  { label: 'Built for India', desc: 'INR pricing, an Indian developer network, and deep understanding of the local market.' },
  { label: 'Speed to market', desc: 'From idea to blueprint in one conversation. From blueprint to shipped product in weeks.' },
]

const CHAT_WIDTH = 650

export default function LandingPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [headlineIdx, setHeadlineIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [cursorVisible, setCursorVisible] = useState(true)
  const [chatIdx, setChatIdx] = useState(0)
  const [chatVisible, setChatVisible] = useState<number[]>([])
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
    }, isDeleting ? 30 : 75)
    return () => clearTimeout(timeout)
  }, [displayed, isDeleting, headlineIdx])

  useEffect(() => {
    const i = setInterval(() => setCursorVisible(v => !v), 530)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    if (chatIdx >= chatMessages.length) {
      const t = setTimeout(() => { setChatVisible([]); setChatIdx(0) }, 4000)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      setChatVisible(p => [...p, chatIdx])
      setChatIdx(p => p + 1)
    }, chatIdx === 0 ? 800 : 1200)
    return () => clearTimeout(t)
  }, [chatIdx])

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
        @keyframes dot {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
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
            height: 440px !important;
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
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <Image src="/logo.png" alt="Wersute" width={28} height={28} style={{ borderRadius: '6px' }} />
            <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>Wersute</span>
          </div>

          {/* Desktop center links */}
          <div className="nav-desktop-links">
            {navLinks.map(item => (
              <a key={item.href} href={'#' + item.href}
                onClick={e => smoothScroll(e, item.href)}
                style={{ color: '#64748b', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}>
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop right actions */}
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
                }}>Continue</a>
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
                }}>Get started</a>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
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

        {/* Mobile dropdown */}
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
                {userEmail ? 'Continue Building' : 'Get started'}
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
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            border: '1px solid #bfdbfe', borderRadius: '999px',
            padding: '5px 14px', marginBottom: '32px', backgroundColor: '#eff6ff',
            fontSize: '12px', color: '#1a6fd4', letterSpacing: '0.04em', fontWeight: '600',
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#1a6fd4', display: 'inline-block' }} />
            AI-powered startup execution
          </div>

          <h1 style={{
            fontSize: 'clamp(30px, 3.5vw, 56px)', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: '1.06',
            margin: '0 0 8px 0', color: '#0f172a',
          }}>
            Your idea deserves
          </h1>
          <h1 style={{
            fontSize: 'clamp(30px, 3.5vw, 56px)', fontWeight: '700',
            letterSpacing: '-0.04em', lineHeight: '1.06',
            margin: '0 0 28px 0', color: '#1a6fd4',
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

          <p style={{
            fontSize: 'clamp(14px, 1.2vw, 17px)', color: '#64748b',
            maxWidth: '380px', lineHeight: '1.7', margin: '0 0 36px 0',
          }}>
            Chat with our AI. Get a consultant-grade blueprint.
            We find the right developer and manage the entire build.
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <a href={userEmail ? '/chat' : '/login'} style={{
              backgroundColor: '#1a6fd4', color: 'white', padding: '11px 26px',
              borderRadius: '8px', fontSize: '14px', fontWeight: '600', textDecoration: 'none',
            }}>
              {userEmail ? 'Continue building' : 'Start for free'}
            </a>
            <a href="#how-it-works" onClick={e => smoothScroll(e, 'how-it-works')} style={{
              border: '1px solid #e2e8f0', color: '#64748b', padding: '11px 26px',
              borderRadius: '8px', fontSize: '14px', fontWeight: '500', textDecoration: 'none',
            }}>
              See how it works
            </a>
          </div>
          <p style={{ color: '#94a3b8', fontSize: '12px', marginTop: '14px' }}>No credit card required</p>
        </div>

        {/* Right — chat box */}
        <div style={{ flexShrink: 0, width: '100%', maxWidth: isMobile ? '100%' : `${CHAT_WIDTH}px` }}>
          <div className="chat-inner">
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: '7px',
              backgroundColor: '#f8fafc', flexShrink: 0,
            }}>
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#fca5a5' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#fde68a' }} />
              <div style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: '#86efac' }} />
              <span style={{ marginLeft: '8px', fontSize: '13px', color: '#94a3b8', flex: 1, textAlign: 'center', fontWeight: '500' }}>
                Wersute AI
              </span>
              <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#4ade80' }} />
            </div>

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
              {chatIdx < chatMessages.length && chatIdx > 0 && (
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

            <div style={{ padding: '0 16px 16px', flexShrink: 0 }}>
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
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" style={{ padding: isMobile ? '60px 24px' : '100px 60px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
            Process
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '64px', color: '#0f172a' }}>
            From idea to live product.
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          }}>
            {steps.map((step, i) => (
              <div key={i} style={{
                paddingLeft: !isMobile && i > 0 ? '48px' : '0',
                paddingRight: !isMobile && i < steps.length - 1 ? '48px' : '0',
                borderRight: !isMobile && i < steps.length - 1 ? '1px solid #f1f5f9' : 'none',
                borderBottom: isMobile && i < steps.length - 1 ? '1px solid #f1f5f9' : 'none',
                paddingBottom: isMobile && i < steps.length - 1 ? '40px' : '0',
                paddingTop: isMobile && i > 0 ? '40px' : '0',
              }}>
                <div style={{
                  fontSize: '52px', fontWeight: '800', letterSpacing: '-0.04em', lineHeight: 1,
                  marginBottom: '24px',
                  background: 'linear-gradient(135deg, #1a6fd4 0%, #60a5fa 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#0f172a', marginBottom: '12px', letterSpacing: '-0.02em' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '15px', color: '#64748b', lineHeight: '1.7', margin: 0 }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: isMobile ? '60px 24px' : '100px 60px', borderTop: '1px solid #f1f5f9', backgroundColor: '#fafafa' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', color: '#94a3b8', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px', fontWeight: '600' }}>
            Features
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: '700', letterSpacing: '-0.03em', marginBottom: '56px', color: '#0f172a' }}>
            Everything you need to ship.
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {features.map((item, i) => (
              <div key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  backgroundColor: 'white', borderRadius: '12px', padding: '28px 24px',
                  border: hoveredFeature === i ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  boxShadow: hoveredFeature === i ? '0 8px 32px rgba(26,111,212,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                  transform: hoveredFeature === i ? 'translateY(-3px)' : 'translateY(0)',
                  transition: 'all 0.2s ease', cursor: 'default',
                }}
              >
                <div style={{
                  fontSize: '26px', marginBottom: '16px', width: '48px', height: '48px',
                  backgroundColor: hoveredFeature === i ? '#eff6ff' : '#f8fafc',
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
            ))}
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
              Every great idea deserves a chance to exist.
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

     {/* CTA */}
      <section style={{ backgroundColor: '#1a6fd4', padding: isMobile ? '60px 24px' : '100px 60px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: '700', letterSpacing: '-0.04em', color: 'white', margin: '0 0 20px 0' }}>
            Ready to build?
          </h2>
          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.75)', margin: '0 0 40px 0', lineHeight: '1.6' }}>
            Start a conversation with our AI and get your blueprint in minutes.
          </p>
          <a href={userEmail ? '/chat' : '/login'} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-block', backgroundColor: 'white', color: '#1a6fd4',
              padding: '13px 36px', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
            }}>
              {userEmail ? 'Continue building' : 'Start for free'}
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
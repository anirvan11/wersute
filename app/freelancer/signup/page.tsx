'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const SKILLS_OPTIONS = [
  'React', 'Next.js', 'Node.js', 'TypeScript', 'Python', 'Django', 'Flutter',
  'React Native', 'PostgreSQL', 'MongoDB', 'AWS', 'Firebase', 'Supabase',
  'Figma', 'UI/UX Design', 'DevOps', 'Docker', 'GraphQL', 'REST APIs', 'iOS', 'Android'
]

export default function FreelancerSignup() {
  const router = useRouter()
  const [step, setStep] = useState<'auth' | 'profile'>('auth')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [profile, setProfile] = useState({
    name: '',
    tagline: '',
    bio: '',
    years_experience: '',
    hourly_rate: '',
    availability: 'available',
    skills: [] as string[],
    github_url: '',
    linkedin_url: '',
    portfolio_links: [{ label: '', url: '' }],
    photo_url: '',
  })

  useEffect(() => {
  async function check() {
    const params = new URLSearchParams(window.location.search)

    // Show error if redirected back from callback due to founder account
    if (params.get('error') === 'founder_account') {
      setError('This Google account is registered as a founder. Please use a different Google account.')
      return
    }

    if (params.get('step') === 'profile') {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setStep('profile')
        return
      }
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (userData?.role === 'founder' || userData?.role === 'admin') {
      router.replace('/chat')
      return
    }

    const { data: existing } = await supabase
      .from('freelancers')
      .select('id, status')
      .eq('user_id', session.user.id)
      .single()

    if (existing) {
      router.replace(
        existing.status === 'approved' ? '/freelancer/dashboard' : '/freelancer/pending'
      )
      return
    }

    setStep('profile')
  }
  check()
}, [])

  async function handleGoogleLogin() {
    setGoogleLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=freelancer`,
      },
    })
  }

  async function handleAuth() {
  setLoading(true)
  setError('')
  try {
    if (authMode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Authentication failed')

    // Check if this is a founder or admin account
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role === 'founder' || userData?.role === 'admin') {
      await supabase.auth.signOut()
      setError('This email is registered as a founder account. Please use a different email or go to the founder login.')
      return
    }

    // Check if freelancer profile already exists
    const { data: existing } = await supabase
      .from('freelancers')
      .select('id, status')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      router.replace(
        existing.status === 'approved' ? '/freelancer/dashboard' : '/freelancer/pending'
      )
      return
    }

    // New freelancer — go to profile step
    setStep('profile')
  } catch (e: any) {
    setError(e.message)
  } finally {
    setLoading(false)
  }
}

  function toggleSkill(skill: string) {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill],
    }))
  }

  function updatePortfolioLink(idx: number, field: 'label' | 'url', value: string) {
    setProfile(prev => {
      const links = [...prev.portfolio_links]
      links[idx] = { ...links[idx], [field]: value }
      return { ...prev, portfolio_links: links }
    })
  }

  async function handleProfileSubmit() {
    if (!profile.name.trim()) return setError('Name is required')
    if (!profile.tagline.trim()) return setError('Tagline is required')
    if (!profile.bio.trim()) return setError('Bio is required')
    if (profile.skills.length === 0) return setError('Select at least one skill')
    if (!profile.hourly_rate) return setError('Hourly rate is required')
    setLoading(true)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const portfolioLinks = profile.portfolio_links.filter(l => l.url.trim())
      const { error } = await supabase.from('freelancers').insert({
        user_id: user.id,
        name: profile.name.trim(),
        tagline: profile.tagline.trim(),
        bio: profile.bio.trim(),
        years_experience: parseInt(profile.years_experience) || 0,
        hourly_rate: parseInt(profile.hourly_rate) || 0,
        availability: profile.availability,
        skills: profile.skills,
        github_url: profile.github_url.trim() || null,
        linkedin_url: profile.linkedin_url.trim() || null,
        portfolio_links: portfolioLinks,
        photo_url: profile.photo_url.trim() || null,
        status: 'pending',
      })
      if (error) throw error
      router.push('/freelancer/pending')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%',
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    color: 'white',
    padding: '12px 16px',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  const labelStyle = {
    color: '#94a3b8',
    fontSize: '13px',
    marginBottom: '6px',
    display: 'block' as const,
    fontWeight: '500' as const,
  }

  const sectionStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #1e293b',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '16px',
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      <nav style={{
        padding: '0 24px', height: '56px', display: 'flex',
        alignItems: 'center', borderBottom: '1px solid #1e293b',
      }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>Wersute</span>
        <span style={{ color: '#334155', margin: '0 12px' }}>|</span>
        <span style={{ color: '#64748b', fontSize: '14px' }}>Developer Portal</span>
      </nav>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '8px' }}>
            {step === 'auth' ? 'Join as a Developer' : 'Complete your profile'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>
            {step === 'auth'
              ? 'Create your account to get started.'
              : 'Your profile is shown to founders when selecting a developer.'}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', padding: '12px 16px', borderRadius: '10px',
            fontSize: '14px', marginBottom: '16px',
          }}>
            {error}
          </div>
        )}

        {/* STEP 1 — Auth */}
        {step === 'auth' && (
          <div style={sectionStyle}>
            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              style={{
                width: '100%', backgroundColor: 'white', color: '#1f2937',
                padding: '12px', borderRadius: '12px', fontWeight: '600',
                fontSize: '15px', border: 'none', cursor: googleLoading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', opacity: googleLoading ? 0.7 : 1, marginBottom: '20px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {googleLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#1e293b' }} />
              <span style={{ color: '#475569', fontSize: '12px' }}>or</span>
              <div style={{ flex: 1, height: '1px', backgroundColor: '#1e293b' }} />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {(['signup', 'login'] as const).map(mode => (
                <button key={mode} onClick={() => setAuthMode(mode)} style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                  backgroundColor: authMode === mode ? '#1a6fd4' : '#1e293b',
                  color: authMode === mode ? 'white' : '#64748b',
                }}>
                  {mode === 'signup' ? 'Create account' : 'Log in'}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} type="email" placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Password</label>
              <input style={inputStyle} type="password" placeholder="Min 6 characters"
                value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button
              onClick={handleAuth}
              disabled={loading || !email || !password}
              style={{
                width: '100%', backgroundColor: loading ? '#334155' : '#1a6fd4',
                color: 'white', border: 'none', padding: '13px', borderRadius: '10px',
                fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Please wait...' : authMode === 'signup' ? 'Create account →' : 'Log in →'}
            </button>
          </div>
        )}

        {/* STEP 2 — Profile */}
        {step === 'profile' && (
          <>
            <div style={sectionStyle}>
              <h2 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Basic Info
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={labelStyle}>Full name *</label>
                  <input style={inputStyle} placeholder="John Doe" value={profile.name}
                    onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Photo URL</label>
                  <input style={inputStyle} placeholder="https://..." value={profile.photo_url}
                    onChange={e => setProfile(p => ({ ...p, photo_url: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>
                  Tagline * <span style={{ color: '#475569', fontWeight: '400' }}>(shown on your card)</span>
                </label>
                <input style={inputStyle} placeholder="Full-stack developer specialising in React & Node.js"
                  value={profile.tagline}
                  onChange={e => setProfile(p => ({ ...p, tagline: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>
                  Bio * <span style={{ color: '#475569', fontWeight: '400' }}>(tell founders about yourself)</span>
                </label>
                <textarea
                  style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' as const }}
                  placeholder="I'm a developer with X years of experience building..."
                  value={profile.bio}
                  onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                />
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Experience & Rate
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>Years of experience</label>
                  <input style={inputStyle} type="number" placeholder="5"
                    value={profile.years_experience}
                    onChange={e => setProfile(p => ({ ...p, years_experience: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Hourly rate (₹) *</label>
                  <input style={inputStyle} type="number" placeholder="1500"
                    value={profile.hourly_rate}
                    onChange={e => setProfile(p => ({ ...p, hourly_rate: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Availability</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }}
                    value={profile.availability}
                    onChange={e => setProfile(p => ({ ...p, availability: e.target.value }))}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Skills * <span style={{ color: '#475569', textTransform: 'none', letterSpacing: 0 }}>(select all that apply)</span>
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {SKILLS_OPTIONS.map(skill => {
                  const selected = profile.skills.includes(skill)
                  return (
                    <button key={skill} onClick={() => toggleSkill(skill)} style={{
                      padding: '7px 14px', borderRadius: '999px',
                      border: selected ? '1px solid #1a6fd4' : '1px solid #1e293b',
                      backgroundColor: selected ? 'rgba(26,111,212,0.15)' : '#0f172a',
                      color: selected ? '#60a5fa' : '#64748b',
                      fontSize: '13px', cursor: 'pointer',
                      fontWeight: selected ? '600' : '400',
                      transition: 'all 0.15s',
                    }}>
                      {skill}
                    </button>
                  )
                })}
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                Verification Links
              </h2>
              <p style={{ color: '#475569', fontSize: '13px', marginBottom: '20px' }}>
                Used to verify your identity. Founders only see a verified badge — not the actual links.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>GitHub profile URL</label>
                  <input style={inputStyle} placeholder="https://github.com/username"
                    value={profile.github_url}
                    onChange={e => setProfile(p => ({ ...p, github_url: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>LinkedIn profile URL</label>
                  <input style={inputStyle} placeholder="https://linkedin.com/in/username"
                    value={profile.linkedin_url}
                    onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={sectionStyle}>
              <h2 style={{ color: '#94a3b8', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
                Portfolio / Past Work
              </h2>
              {profile.portfolio_links.map((link, idx) => (
                <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                  <div>
                    {idx === 0 && <label style={labelStyle}>Label</label>}
                    <input style={inputStyle} placeholder="My SaaS project"
                      value={link.label}
                      onChange={e => updatePortfolioLink(idx, 'label', e.target.value)} />
                  </div>
                  <div>
                    {idx === 0 && <label style={labelStyle}>URL</label>}
                    <input style={inputStyle} placeholder="https://myproject.com"
                      value={link.url}
                      onChange={e => updatePortfolioLink(idx, 'url', e.target.value)} />
                  </div>
                  <button
                    onClick={() => setProfile(p => ({ ...p, portfolio_links: p.portfolio_links.filter((_, i) => i !== idx) }))}
                    style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '20px', paddingBottom: '8px' }}
                  >×</button>
                </div>
              ))}
              <button
                onClick={() => setProfile(p => ({ ...p, portfolio_links: [...p.portfolio_links, { label: '', url: '' }] }))}
                style={{ background: 'none', border: '1px dashed #334155', color: '#64748b', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', marginTop: '4px' }}
              >
                + Add another
              </button>
            </div>

            <button
              onClick={handleProfileSubmit}
              disabled={loading}
              style={{
                width: '100%', backgroundColor: loading ? '#334155' : '#1a6fd4',
                color: 'white', border: 'none', padding: '14px', borderRadius: '10px',
                fontSize: '15px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Submitting...' : 'Submit profile for review →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
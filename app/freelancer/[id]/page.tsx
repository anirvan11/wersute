import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'

export default async function FreelancerProfile({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: f } = await supabaseAdmin
    .from('freelancers')
    .select('*')
    .eq('id', id)
    .eq('status', 'approved')
    .single()

  if (!f) return notFound()

  const availabilityMap: Record<string, { color: string; bg: string; label: string }> = {
  available: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)', label: 'Available' },
  busy: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)', label: 'Busy' },
  unavailable: { color: '#f87171', bg: 'rgba(248,113,113,0.1)', label: 'Unavailable' },
}
const availabilityColor = availabilityMap[f.availability] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: f.availability }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      <nav style={{ padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #1e293b' }}>
        <span style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>Wersute</span>
      </nav>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Hero */}
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '16px',
          display: 'flex',
          gap: '24px',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}>
          {f.photo_url && (
            <img src={f.photo_url} alt={f.name}
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
          )}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '24px', fontWeight: '700', margin: 0 }}>{f.name}</h1>
              <span style={{
                fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '999px',
                backgroundColor: availabilityColor.bg, color: availabilityColor.color,
              }}>
                {availabilityColor.label}
              </span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '15px', marginBottom: '16px' }}>{f.tagline}</p>

            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div>
                <span style={{ color: '#475569', fontSize: '12px' }}>Experience</span>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{f.years_experience} years</div>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '12px' }}>Hourly rate</span>
                <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>₹{f.hourly_rate?.toLocaleString()}/hr</div>
              </div>
              <div>
                <span style={{ color: '#475569', fontSize: '12px' }}>Verified</span>
                <div style={{ display: 'flex', gap: '6px', marginTop: '2px' }}>
                  {f.github_url && (
                    <span style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '12px', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(74,222,128,0.2)' }}>
                      ✓ GitHub
                    </span>
                  )}
                  {f.linkedin_url && (
                    <span style={{ backgroundColor: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '12px', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(74,222,128,0.2)' }}>
                      ✓ LinkedIn
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>About</h2>
          <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.75' }}>{f.bio}</p>
        </div>

        {/* Skills */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Skills</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {f.skills?.map((s: string) => (
              <span key={s} style={{
                backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                color: '#93c5fd', padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
              }}>{s}</span>
            ))}
          </div>
        </div>

        {/* Portfolio */}
        {f.portfolio_links?.length > 0 && (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
            <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>Portfolio</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {f.portfolio_links.map((link: any, i: number) => (
                link.url && (
                  <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      backgroundColor: '#020817', border: '1px solid #1e293b', borderRadius: '10px',
                      padding: '12px 16px', textDecoration: 'none', transition: 'border-color 0.2s',
                    }}>
                    <span style={{ color: 'white', fontSize: '14px', fontWeight: '500' }}>{link.label || link.url}</span>
                    <span style={{ color: '#60a5fa', fontSize: '13px' }}>Visit →</span>
                  </a>
                )
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
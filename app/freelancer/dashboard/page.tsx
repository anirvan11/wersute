'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

const STATUS_LABELS: Record<string, string> = {
  MATCHING: 'Finding developer',
  READY_TO_SELECT: 'Awaiting selection',
  DEVELOPER_ASSIGNED: 'You are assigned',
  IN_DEVELOPMENT: 'In development',
  TESTING: 'In testing',
  COMPLETED: 'Completed',
}

const STATUS_COLORS: Record<string, { color: string; bg: string }> = {
  MATCHING: { color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
  READY_TO_SELECT: { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  DEVELOPER_ASSIGNED: { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
  IN_DEVELOPMENT: { color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
  TESTING: { color: '#fb923c', bg: 'rgba(251,146,60,0.1)' },
  COMPLETED: { color: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
}

export default function FreelancerDashboard() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [freelancer, setFreelancer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) { router.replace('/freelancer/signup'); return }

  const res = await fetch('/api/freelancer/projects', {
    headers: { 'x-user-id': session.user.id },
  })
  if (res.status === 401) { router.replace('/freelancer/signup'); return }
  if (res.status === 403) { router.replace('/freelancer/pending'); return }
  if (!res.ok) { setError('Failed to load projects'); setLoading(false); return }

  const data = await res.json()
  setProjects(data.projects || [])
  setFreelancer(data.freelancer)
  setLoading(false)
}
    load()
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/freelancer/signup')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      <nav style={{
        padding: '0 24px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1e293b', position: 'sticky',
        top: 0, backgroundColor: '#020817', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>Wersute</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Developer Dashboard</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {freelancer && (
            <span style={{ color: '#94a3b8', fontSize: '13px' }}>{freelancer.name}</span>
          )}
          <button onClick={handleSignOut} style={{
            background: 'none', border: '1px solid #1e293b', color: '#64748b',
            padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          }}>
            Sign out
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '6px' }}>My Projects</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {loading ? 'Loading...' : `${projects.length} assigned project${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#fca5a5', padding: '16px', borderRadius: '12px', marginBottom: '24px',
          }}>
            {error}
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div style={{
            backgroundColor: '#0f172a', border: '1px solid #1e293b',
            borderRadius: '16px', padding: '64px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>📭</div>
            <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '8px' }}>No projects yet</h3>
            <p style={{ color: '#475569', fontSize: '14px' }}>
              You'll see your assigned projects here once a founder selects you.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projects.map(project => {
            const b = project.blueprints?.structured_json
            const statusColor = STATUS_COLORS[project.status] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }
            return (
              <div key={project.id} style={{
                backgroundColor: '#0f172a', border: '1px solid #1e293b',
                borderRadius: '16px', padding: '24px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '6px' }}>
                      {project.name?.length > 60 ? project.name.slice(0, 60) + '...' : project.name}
                    </h3>
                    {b && (
                      <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6' }}>
                        {b.startup_summary?.slice(0, 140)}{b.startup_summary?.length > 140 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '4px 10px',
                    borderRadius: '999px', flexShrink: 0, whiteSpace: 'nowrap',
                    color: statusColor.color, backgroundColor: statusColor.bg,
                  }}>
                    {STATUS_LABELS[project.status] ?? project.status}
                  </span>
                </div>

                {b && (
                  <div style={{
                    backgroundColor: '#020817', borderRadius: '10px', padding: '16px',
                    border: '1px solid #1e293b', marginBottom: '16px',
                    display: 'flex', gap: '24px', flexWrap: 'wrap',
                  }}>
                    <div>
                      <span style={{ color: '#475569', fontSize: '12px' }}>Timeline</span>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>
                        {b.estimated_timeline_days} days
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#475569', fontSize: '12px' }}>Complexity</span>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginTop: '2px', textTransform: 'capitalize' }}>
                        {b.complexity_level}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: '#475569', fontSize: '12px' }}>Tech stack</span>
                      <div style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginTop: '2px' }}>
                        {b.suggested_tech_stack?.slice(0, 3).join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {b?.core_features && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ color: '#475569', fontSize: '12px', marginBottom: '8px' }}>Core features</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {b.core_features.slice(0, 5).map((f: string, i: number) => (
                        <span key={i} style={{
                          backgroundColor: '#1e293b', color: '#94a3b8',
                          padding: '4px 10px', borderRadius: '999px', fontSize: '12px',
                        }}>
                          {f.length > 40 ? f.slice(0, 40) + '...' : f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <button
                    onClick={() => router.push(`/freelancer/project/${project.id}`)}
                    style={{
                      backgroundColor: '#1a6fd4', color: 'white', border: 'none',
                      padding: '9px 20px', borderRadius: '8px', fontSize: '13px',
                      fontWeight: '600', cursor: 'pointer',
                    }}
                  >
                    View full brief →
                  </button>
                  <span style={{ color: '#334155', fontSize: '12px', fontFamily: 'monospace' }}>
                    {project.id.slice(0, 8)}...
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
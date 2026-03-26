'use client'
import { useState, useEffect } from 'react'

const STATUS_ORDER = [
  'MATCHING',
  'READY_TO_SELECT',
  'DEVELOPER_ASSIGNED',
  'IN_DEVELOPMENT',
  'TESTING',
  'COMPLETED',
]

const STATUS_COLOR_STYLES: Record<string, { color: string; backgroundColor: string }> = {
  MATCHING: { color: '#facc15', backgroundColor: 'rgba(250,204,21,0.1)' },
  READY_TO_SELECT: { color: '#34d399', backgroundColor: 'rgba(52,211,153,0.1)' },
  DEVELOPER_ASSIGNED: { color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)' },
  IN_DEVELOPMENT: { color: '#c084fc', backgroundColor: 'rgba(192,132,252,0.1)' },
  TESTING: { color: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)' },
  COMPLETED: { color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)' },
}

interface Freelancer {
  id: string
  name: string
  photo_url: string
  tagline: string
  skills: string[]
  portfolio_url: string
  hourly_rate: number
}

interface QuoteRow {
  freelancer_id: string
  quote_amount: string
  note: string
}

export default function AdminProjectList({
  projects,
  pendingFreelancers: initialPending,
}: {
  projects: any[]
  pendingFreelancers: any[]
}) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [projectList, setProjectList] = useState(projects)
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [pendingFreelancers, setPendingFreelancers] = useState(initialPending)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [quotes, setQuotes] = useState<Record<string, QuoteRow[]>>({})
  const [showAddFreelancer, setShowAddFreelancer] = useState(false)
  const [newFreelancer, setNewFreelancer] = useState({
    name: '', photo_url: '', tagline: '', skills: '', portfolio_url: '', hourly_rate: ''
  })
  const [savingFreelancer, setSavingFreelancer] = useState(false)
  const [assigningProject, setAssigningProject] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/freelancers?status=approved')
      .then(r => r.json())
      .then(d => setFreelancers(d.freelancers || []))
  }, [])

  async function handleFreelancerAction(freelancerId: string, action: 'approved' | 'rejected') {
    await fetch('/api/admin/approve-freelancer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ freelancerId, action }),
    })
    setPendingFreelancers(prev => prev.filter(f => f.id !== freelancerId))
    if (action === 'approved') {
      const approved = pendingFreelancers.find(f => f.id === freelancerId)
      if (approved) setFreelancers(prev => [{ ...approved, status: 'approved' }, ...prev])
    }
  }

  async function updateStatus(projectId: string, status: string) {
    setUpdating(projectId)
    try {
      await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, status }),
      })
      setProjectList(prev => prev.map(p => p.id === projectId ? { ...p, status } : p))
    } catch {
      alert('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  async function saveFreelancer() {
    setSavingFreelancer(true)
    try {
      const res = await fetch('/api/admin/freelancers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newFreelancer,
          hourly_rate: parseInt(newFreelancer.hourly_rate) || 0,
          skills: newFreelancer.skills.split(',').map(s => s.trim()).filter(Boolean),
        }),
      })
      const data = await res.json()
      setFreelancers(prev => [data.freelancer, ...prev])
      setNewFreelancer({ name: '', photo_url: '', tagline: '', skills: '', portfolio_url: '', hourly_rate: '' })
      setShowAddFreelancer(false)
    } catch {
      alert('Failed to save freelancer')
    } finally {
      setSavingFreelancer(false)
    }
  }

  async function deleteFreelancer(id: string) {
    if (!confirm('Delete this freelancer?')) return
    await fetch('/api/admin/freelancers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setFreelancers(prev => prev.filter(f => f.id !== id))
  }

  function addQuoteRow(projectId: string) {
    setQuotes(prev => ({
      ...prev,
      [projectId]: [...(prev[projectId] || []), { freelancer_id: '', quote_amount: '', note: '' }]
    }))
  }

  function updateQuoteRow(projectId: string, idx: number, field: string, value: string) {
    setQuotes(prev => {
      const rows = [...(prev[projectId] || [])]
      rows[idx] = { ...rows[idx], [field]: value }
      return { ...prev, [projectId]: rows }
    })
  }

  function removeQuoteRow(projectId: string, idx: number) {
    setQuotes(prev => {
      const rows = [...(prev[projectId] || [])]
      rows.splice(idx, 1)
      return { ...prev, [projectId]: rows }
    })
  }

  async function assignFreelancers(projectId: string) {
    const rows = quotes[projectId] || []
    if (rows.length === 0) return alert('Add at least one freelancer quote')
    if (rows.some(r => !r.freelancer_id || !r.quote_amount || isNaN(parseInt(r.quote_amount)))) {
      return alert('Please fill in all fields — make sure quote amount is a number')
    }
    setAssigningProject(projectId)
    try {
      const res = await fetch('/api/admin/assign-freelancers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          quotes: rows.map(r => ({
            freelancer_id: r.freelancer_id,
            quote_amount: parseInt(r.quote_amount),
            note: r.note || null,
          })),
        }),
      })
      if (!res.ok) throw new Error('Failed')
      setProjectList(prev => prev.map(p => p.id === projectId ? { ...p, status: 'READY_TO_SELECT' } : p))
      setExpandedProject(null)
      alert('Freelancers assigned! Founder has been notified by email.')
    } catch {
      alert('Failed to assign freelancers')
    } finally {
      setAssigningProject(null)
    }
  }

  const inputStyle = {
    backgroundColor: '#0f172a',
    border: '1px solid #334155',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    outline: 'none',
    width: '100%',
  }

  const labelStyle = {
    color: '#94a3b8',
    fontSize: '12px',
    marginBottom: '4px',
    display: 'block' as const,
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Pending Approvals */}
      {pendingFreelancers.length > 0 && (
        <div style={{
          backgroundColor: '#0f172a',
          border: '1px solid rgba(251,146,60,0.3)',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h2 style={{ color: '#fb923c', fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>
            ⏳ Pending Approvals ({pendingFreelancers.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {pendingFreelancers.map(f => (
              <div key={f.id} style={{
                backgroundColor: '#020817', borderRadius: '12px', padding: '16px',
                border: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap',
              }}>
                {f.photo_url && (
                  <img src={f.photo_url} alt={f.name}
                    style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                )}
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{f.name}</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '6px' }}>{f.tagline}</div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {f.skills?.slice(0, 5).map((s: string) => (
                      <span key={s} style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: '999px', fontSize: '11px' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0, flexWrap: 'wrap' }}>
                  <button
                    onClick={() => window.open(`/freelancer/${f.id}`, '_blank')}
                    style={{ background: 'none', border: '1px solid #334155', color: '#94a3b8', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    View profile
                  </button>
                  <button
                    onClick={() => handleFreelancerAction(f.id, 'rejected')}
                    style={{ background: 'none', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleFreelancerAction(f.id, 'approved')}
                    style={{ backgroundColor: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80', padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}
                  >
                    Approve ✓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Freelancer Pool */}
      <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
            Freelancer Pool ({freelancers.length})
          </h2>
          <button
            onClick={() => setShowAddFreelancer(v => !v)}
            style={{
              backgroundColor: '#1a6fd4', color: 'white', border: 'none',
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
              fontWeight: '600', cursor: 'pointer',
            }}
          >
            {showAddFreelancer ? 'Cancel' : '+ Add Manually'}
          </button>
        </div>

        {showAddFreelancer && (
          <div style={{ backgroundColor: '#020817', borderRadius: '12px', padding: '20px', marginBottom: '16px', border: '1px solid #1e293b' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              {[
                { label: 'Name *', key: 'name', placeholder: 'John Doe' },
                { label: 'Photo URL', key: 'photo_url', placeholder: 'https://...' },
                { label: 'Tagline', key: 'tagline', placeholder: 'Full-stack developer' },
                { label: 'Hourly Rate (₹)', key: 'hourly_rate', placeholder: '1500' },
                { label: 'Skills (comma separated)', key: 'skills', placeholder: 'React, Node.js' },
                { label: 'Portfolio URL', key: 'portfolio_url', placeholder: 'https://portfolio.com' },
              ].map(field => (
                <div key={field.key}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    style={inputStyle}
                    placeholder={field.placeholder}
                    value={(newFreelancer as any)[field.key]}
                    onChange={e => setNewFreelancer(prev => ({ ...prev, [field.key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
            <button
              onClick={saveFreelancer}
              disabled={savingFreelancer || !newFreelancer.name}
              style={{
                backgroundColor: savingFreelancer ? '#334155' : '#1a6fd4',
                color: 'white', border: 'none', padding: '10px 20px',
                borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                cursor: savingFreelancer ? 'not-allowed' : 'pointer',
              }}
            >
              {savingFreelancer ? 'Saving...' : 'Save Freelancer'}
            </button>
          </div>
        )}

        {freelancers.length === 0 ? (
          <p style={{ color: '#475569', fontSize: '14px' }}>No approved freelancers yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {freelancers.map(f => (
              <div key={f.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                backgroundColor: '#020817', borderRadius: '10px', padding: '12px 16px',
                border: '1px solid #1e293b',
              }}>
                {f.photo_url && (
                  <img src={f.photo_url} alt={f.name}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>{f.name}</div>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{f.tagline}</div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                    {f.skills?.map(s => (
                      <span key={s} style={{ backgroundColor: '#1e293b', color: '#94a3b8', padding: '2px 8px', borderRadius: '999px', fontSize: '11px' }}>{s}</span>
                    ))}
                  </div>
                </div>
                <div style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>
                  ₹{f.hourly_rate}/hr
                </div>
                <button
                  onClick={() => window.open(`/freelancer/${f.id}`, '_blank')}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '13px' }}
                >
                  View
                </button>
                <button
                  onClick={() => deleteFreelancer(f.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Projects */}
      <div>
        <h2 style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '16px' }}>
          All Projects
        </h2>
        {projectList.length === 0 ? (
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <p style={{ color: '#475569' }}>No projects yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {projectList.map((project) => (
              <div key={project.id} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>

                {/* Project header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                      {project.name?.length > 60 ? project.name.slice(0, 60) + '...' : project.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <p style={{ color: '#475569', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>
                        {project.id}
                      </p>
                      {project.founder_email ? (
                        <span style={{
                          color: '#60a5fa', fontSize: '12px',
                          backgroundColor: 'rgba(96,165,250,0.08)',
                          padding: '2px 8px', borderRadius: '999px',
                          border: '1px solid rgba(96,165,250,0.15)',
                        }}>
                          {project.founder_email}
                        </span>
                      ) : (
                        <span style={{ color: '#475569', fontSize: '12px', fontStyle: 'italic' }}>no email</span>
                      )}
                    </div>
                    {project.blueprints?.structured_json && (
                      <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
                        {project.blueprints.structured_json.startup_summary?.slice(0, 120)}
                        {project.blueprints.structured_json.startup_summary?.length > 120 ? '...' : ''}
                      </p>
                    )}
                  </div>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '4px 10px',
                    borderRadius: '999px', marginLeft: '16px', flexShrink: 0,
                    ...STATUS_COLOR_STYLES[project.status]
                  }}>
                    {project.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <select
                    value={project.status}
                    onChange={(e) => updateStatus(project.id, e.target.value)}
                    disabled={updating === project.id}
                    style={{
                      backgroundColor: '#1e293b', border: '1px solid #334155', color: 'white',
                      padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none',
                      cursor: 'pointer', opacity: updating === project.id ? 0.5 : 1,
                    }}
                  >
                    {STATUS_ORDER.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>

                  {updating === project.id && (
                    <span style={{ color: '#64748b', fontSize: '13px' }}>Updating...</span>
                  )}

                  {project.status === 'MATCHING' && (
                    <button
                      onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                      style={{
                        backgroundColor: 'rgba(52,211,153,0.1)', color: '#34d399',
                        border: '1px solid rgba(52,211,153,0.2)', padding: '8px 14px',
                        borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                      }}
                    >
                      {expandedProject === project.id ? 'Cancel' : '+ Assign Freelancers'}
                    </button>
                  )}

                  <button
                    onClick={() => window.open('/dashboard/' + project.id, '_blank')}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#60a5fa', fontSize: '13px', cursor: 'pointer' }}
                  >
                    View Dashboard →
                  </button>
                </div>

                {/* Assign freelancers panel */}
                {expandedProject === project.id && (
                  <div style={{ marginTop: '20px', backgroundColor: '#020817', borderRadius: '12px', padding: '20px', border: '1px solid #1e293b' }}>
                    <h4 style={{ color: 'white', fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
                      Assign freelancers with quotes
                    </h4>
                    {(quotes[project.id] || []).map((row, idx) => (
                      <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: '10px', marginBottom: '10px', alignItems: 'end' }}>
                        <div>
                          <label style={labelStyle}>Freelancer</label>
                          <select
                            value={row.freelancer_id}
                            onChange={e => updateQuoteRow(project.id, idx, 'freelancer_id', e.target.value)}
                            style={{ ...inputStyle }}
                          >
                            <option value="">Select freelancer...</option>
                            {freelancers.map(f => (
                              <option key={f.id} value={f.id}>{f.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={labelStyle}>Quote (₹)</label>
                          <input
                            style={inputStyle}
                            placeholder="150000"
                            value={row.quote_amount}
                            onChange={e => updateQuoteRow(project.id, idx, 'quote_amount', e.target.value)}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Note (optional)</label>
                          <input
                            style={inputStyle}
                            placeholder="Includes 3 months support"
                            value={row.note}
                            onChange={e => updateQuoteRow(project.id, idx, 'note', e.target.value)}
                          />
                        </div>
                        <button
                          onClick={() => removeQuoteRow(project.id, idx)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '18px', paddingBottom: '6px' }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                      <button
                        onClick={() => addQuoteRow(project.id)}
                        style={{ background: 'none', border: '1px dashed #334155', color: '#64748b', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}
                      >
                        + Add another
                      </button>
                      <button
                        onClick={() => assignFreelancers(project.id)}
                        disabled={assigningProject === project.id}
                        style={{
                          backgroundColor: assigningProject === project.id ? '#334155' : '#1a6fd4',
                          color: 'white', border: 'none', padding: '8px 20px',
                          borderRadius: '8px', fontSize: '13px', fontWeight: '600',
                          cursor: assigningProject === project.id ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {assigningProject === project.id ? 'Sending...' : 'Send to Founder →'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
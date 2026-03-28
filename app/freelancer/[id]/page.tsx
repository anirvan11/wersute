'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const STATUS_ORDER = [
  'MATCHING',
  'READY_TO_SELECT',
  'DEVELOPER_ASSIGNED',
  'IN_DEVELOPMENT',
  'TESTING',
  'COMPLETED',
]

const STATUS_LABELS: Record<string, string> = {
  MATCHING: 'Finding developer',
  READY_TO_SELECT: 'Awaiting selection',
  DEVELOPER_ASSIGNED: 'Developer assigned',
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

export default function FreelancerProjectPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [project, setProject] = useState<any>(null)
  const [founderEmail, setFounderEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.replace('/freelancer/signup'); return }

      const res = await fetch(`/api/freelancer/project/${id}`)
      if (res.status === 401) { router.replace('/freelancer/signup'); return }
      if (res.status === 403) { router.replace('/freelancer/dashboard'); return }
      if (res.status === 404) { setError('Project not found'); setLoading(false); return }
      if (!res.ok) { setError('Failed to load project'); setLoading(false); return }

      const data = await res.json()
      setProject(data.project)
      setFounderEmail(data.founderEmail)
      setLoading(false)
    }
    load()
  }, [id])

  async function downloadPdf() {
    if (!project) return
    setDownloadingPdf(true)
    try {
      const b = project.blueprints?.structured_json
      if (!b) throw new Error('No blueprint data')

      // Dynamically import jsPDF
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      const pageWidth = doc.internal.pageSize.getWidth()
      const margin = 20
      const maxWidth = pageWidth - margin * 2
      let y = 20

      function addText(text: string, size: number, bold = false, color = [15, 23, 42] as [number, number, number]) {
        doc.setFontSize(size)
        doc.setFont('helvetica', bold ? 'bold' : 'normal')
        doc.setTextColor(...color)
        const lines = doc.splitTextToSize(text, maxWidth)
        if (y + lines.length * size * 0.4 > 270) {
          doc.addPage()
          y = 20
        }
        doc.text(lines, margin, y)
        y += lines.length * size * 0.45 + 2
      }

      function addDivider() {
        doc.setDrawColor(226, 232, 240)
        doc.line(margin, y, pageWidth - margin, y)
        y += 8
      }

      function addSection(title: string) {
        y += 4
        addText(title, 9, true, [100, 116, 139])
        y += 2
      }

      // Header
      addText('Wersute — Project Blueprint', 10, false, [100, 116, 139])
      y += 4
      addText(project.name, 20, true)
      y += 2
      addText(`Status: ${STATUS_LABELS[project.status] ?? project.status}`, 10, false, [100, 116, 139])
      y += 6
      addDivider()

      // Summary
      addSection('STARTUP SUMMARY')
      addText(b.startup_summary, 11)
      y += 4

      // Problem
      addSection('PROBLEM STATEMENT')
      addText(b.problem_statement, 11)
      y += 4

      // Target users
      addSection('TARGET USERS')
      addText(b.target_users, 11)
      y += 4

      addDivider()

      // Features
      addSection('CORE FEATURES')
      b.core_features?.forEach((f: string, i: number) => {
        addText(`${i + 1}. ${f}`, 11)
      })
      y += 4

      addDivider()

      // Tech stack
      addSection('SUGGESTED TECH STACK')
      addText(b.suggested_tech_stack?.join(', '), 11)
      y += 4

      // Stats
      addDivider()
      addSection('PROJECT DETAILS')
      addText(`Complexity: ${b.complexity_level}`, 11)
      addText(`Timeline: ${b.estimated_timeline_days} days`, 11)
      if (b.estimated_cost_range?.budget) {
        addText(
          `Budget Estimate: ₹${(b.estimated_cost_range.budget.min / 100000).toFixed(1)}L – ₹${(b.estimated_cost_range.budget.max / 100000).toFixed(1)}L`,
          11
        )
        addText(
          `Premium Estimate: ₹${(b.estimated_cost_range.premium.min / 100000).toFixed(1)}L – ₹${(b.estimated_cost_range.premium.max / 100000).toFixed(1)}L`,
          11
        )
      }

      // Footer
      y += 8
      addDivider()
      addText(`Generated by Wersute · ${new Date().toLocaleDateString('en-IN')}`, 9, false, [148, 163, 184])

      doc.save(`${project.name?.slice(0, 40) ?? 'blueprint'}.pdf`)
    } catch (e) {
      console.error('PDF error:', e)
      alert('PDF generation failed. Please try again.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#475569' }}>Loading project...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#020817', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>{error}</p>
          <button onClick={() => router.push('/freelancer/dashboard')}
            style={{ color: '#60a5fa', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px' }}>
            ← Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  const b = project?.blueprints?.structured_json
  const statusIdx = STATUS_ORDER.indexOf(project.status)
  const statusColor = STATUS_COLORS[project.status] ?? { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      {/* Nav */}
      <nav style={{
        padding: '0 24px', height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', borderBottom: '1px solid #1e293b',
        position: 'sticky', top: 0, backgroundColor: '#020817', zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>Wersute</span>
          <span style={{ color: '#334155' }}>|</span>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Project Brief</span>
        </div>
        <button onClick={() => router.push('/freelancer/dashboard')}
          style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '14px', cursor: 'pointer' }}>
          ← Back to dashboard
        </button>
      </nav>

      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', marginBottom: '8px', lineHeight: '1.3' }}>
              {project.name}
            </h1>
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '4px 12px', borderRadius: '999px',
              color: statusColor.color, backgroundColor: statusColor.bg,
            }}>
              {STATUS_LABELS[project.status] ?? project.status}
            </span>
          </div>
          <button
            onClick={downloadPdf}
            disabled={downloadingPdf}
            style={{
              backgroundColor: downloadingPdf ? '#334155' : '#1e293b',
              color: downloadingPdf ? '#64748b' : 'white',
              border: '1px solid #334155', padding: '10px 20px', borderRadius: '10px',
              fontSize: '13px', fontWeight: '600', cursor: downloadingPdf ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
            }}
          >
            {downloadingPdf ? 'Generating...' : '⬇ Download PDF'}
          </button>
        </div>

        {/* Status timeline */}
        <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
          <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '20px' }}>
            Project Timeline
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {STATUS_ORDER.map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '14px', height: '14px', borderRadius: '50%', flexShrink: 0,
                  backgroundColor: i < statusIdx ? '#22c55e' : i === statusIdx ? '#3b82f6' : '#1e293b',
                  boxShadow: i === statusIdx ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{
                  fontSize: '14px', flex: 1,
                  color: i === statusIdx ? 'white' : i < statusIdx ? '#64748b' : '#334155',
                  fontWeight: i === statusIdx ? '600' : '400',
                }}>
                  {STATUS_LABELS[s]}
                </span>
                {i < statusIdx && <span style={{ color: '#22c55e', fontSize: '12px' }}>✓</span>}
                {i === statusIdx && (
                  <span style={{ color: '#60a5fa', fontSize: '11px', backgroundColor: 'rgba(96,165,250,0.1)', padding: '2px 8px', borderRadius: '999px' }}>
                    Current
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Blueprint */}
        {b && (
          <>
            {/* Summary */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Startup Summary
              </h2>
              <p style={{ color: '#cbd5e1', fontSize: '15px', lineHeight: '1.75' }}>{b.startup_summary}</p>
            </div>

            {/* Problem + Users */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Problem Statement
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>{b.problem_statement}</p>
              </div>
              <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px' }}>
                <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Target Users
                </h2>
                <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.7' }}>{b.target_users}</p>
              </div>
            </div>

            {/* Core features */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Core Features
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {b.core_features?.map((f: string, i: number) => (
                  <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <span style={{
                      color: '#1a6fd4', fontWeight: '700', fontSize: '13px',
                      backgroundColor: 'rgba(26,111,212,0.1)', width: '28px', height: '28px',
                      borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', lineHeight: '1.65', margin: 0, paddingTop: '4px' }}>{f}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tech stack */}
            <div style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <h2 style={{ color: '#64748b', fontSize: '11px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Suggested Tech Stack
              </h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {b.suggested_tech_stack?.map((t: string) => (
                  <span key={t} style={{
                    backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)',
                    color: '#93c5fd', padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
                  }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' }}>
              {[
                { label: 'Complexity', value: b.complexity_level, capitalize: true },
                { label: 'Timeline', value: `${b.estimated_timeline_days} days` },
                {
                  label: 'Budget estimate',
                  value: b.estimated_cost_range?.budget
                    ? `₹${(b.estimated_cost_range.budget.min / 100000).toFixed(1)}L – ₹${(b.estimated_cost_range.budget.max / 100000).toFixed(1)}L`
                    : '—'
                },
              ].map(stat => (
                <div key={stat.label} style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                  <p style={{ color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{stat.label}</p>
                  <p style={{ color: 'white', fontWeight: '600', fontSize: '15px', textTransform: stat.capitalize ? 'capitalize' : 'none' }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Premium estimate */}
            {b.estimated_cost_range?.premium && (
              <div style={{ backgroundColor: '#0f172a', border: '1px solid rgba(59,130,246,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '4px' }}>Premium tier estimate</p>
                  <p style={{ color: 'white', fontWeight: '600', fontSize: '16px' }}>
                    ₹{(b.estimated_cost_range.premium.min / 100000).toFixed(1)}L – ₹{(b.estimated_cost_range.premium.max / 100000).toFixed(1)}L
                  </p>
                </div>
                <span style={{ color: '#60a5fa', fontSize: '12px' }}>Boutique agency rate</span>
              </div>
            )}
          </>
        )}

        {/* Chat placeholder */}
        <div style={{ backgroundColor: '#0f172a', border: '1px dashed #334155', borderRadius: '16px', padding: '40px 24px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
          <h3 style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
            Founder Chat
          </h3>
          <p style={{ color: '#475569', fontSize: '14px', marginBottom: '16px' }}>
            Direct messaging with the founder will be available here soon.
          </p>
          {founderEmail && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: '#020817', border: '1px solid #1e293b',
              padding: '8px 16px', borderRadius: '8px',
            }}>
              <span style={{ color: '#475569', fontSize: '13px' }}>Founder:</span>
              <span style={{ color: '#94a3b8', fontSize: '13px' }}>{founderEmail}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'

const STATUS_ORDER = [
  'MATCHING',
  'DEVELOPER_ASSIGNED',
  'IN_DEVELOPMENT',
  'TESTING',
  'COMPLETED',
]

const STATUS_COLORS: Record<string, string> = {
  MATCHING: 'text-yellow-400 bg-yellow-400/10',
  DEVELOPER_ASSIGNED: 'text-blue-400 bg-blue-400/10',
  IN_DEVELOPMENT: 'text-purple-400 bg-purple-400/10',
  TESTING: 'text-orange-400 bg-orange-400/10',
  COMPLETED: 'text-green-400 bg-green-400/10',
}

const STATUS_COLOR_STYLES: Record<string, { color: string; backgroundColor: string }> = {
  MATCHING: { color: '#facc15', backgroundColor: 'rgba(250,204,21,0.1)' },
  DEVELOPER_ASSIGNED: { color: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.1)' },
  IN_DEVELOPMENT: { color: '#c084fc', backgroundColor: 'rgba(192,132,252,0.1)' },
  TESTING: { color: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)' },
  COMPLETED: { color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)' },
}

export default function AdminProjectList({ projects }: { projects: any[] }) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [projectList, setProjectList] = useState(projects)

  async function updateStatus(projectId: string, status: string) {
    setUpdating(projectId)
    try {
      await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, status }),
      })
      setProjectList((prev) =>
        prev.map((p) => (p.id === projectId ? { ...p, status } : p))
      )
    } catch {
      alert('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  if (projectList.length === 0) {
    return (
      <div style={{
        backgroundColor: '#0f172a',
        border: '1px solid #1e293b',
        borderRadius: '16px',
        padding: '48px',
        textAlign: 'center'
      }}>
        <p style={{ color: '#475569' }}>No projects yet.</p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {projectList.map((project) => (
        <div key={project.id} style={{
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ color: 'white', fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>
                {project.name}
              </h3>
              <p style={{ color: '#475569', fontSize: '12px', fontFamily: 'monospace', marginBottom: '8px' }}>
                {project.id}
              </p>
              {project.blueprints?.structured_json && (
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
                  {project.blueprints.structured_json.startup_summary}
                </p>
              )}
            </div>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '4px 10px',
              borderRadius: '999px',
              marginLeft: '16px',
              flexShrink: 0,
              ...STATUS_COLOR_STYLES[project.status]
            }}>
              {project.status}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={project.status}
              onChange={(e) => updateStatus(project.id, e.target.value)}
              disabled={updating === project.id}
              style={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '13px',
                outline: 'none',
                cursor: 'pointer',
                opacity: updating === project.id ? 0.5 : 1,
              }}
            >
              {STATUS_ORDER.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {updating === project.id && (
              <span style={{ color: '#64748b', fontSize: '13px' }}>Updating...</span>
            )}
            <button
              onClick={() => window.open('/dashboard/' + project.id, '_blank')}
              style={{
                marginLeft: 'auto',
                background: 'none',
                border: 'none',
                color: '#60a5fa',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '0',
              }}
            >
              View Dashboard
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
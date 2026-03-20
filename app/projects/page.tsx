'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/ui/Navbar'
import { useRouter } from 'next/navigation'

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadProjects() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data } = await supabase
        .from('projects')
        .select('*, blueprints(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setProjects(data || [])
      setLoading(false)
    }
    loadProjects()
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>My Projects</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>
          {loading ? 'Loading...' : `${projects.length} projects`}
        </p>

        {!loading && projects.length === 0 && (
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '48px',
            textAlign: 'center'
          }}>
            <p style={{ color: '#475569', marginBottom: '16px' }}>No projects yet.</p>
            <a href="/chat" style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '10px 24px',
              borderRadius: '10px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Start a new project
            </a>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {projects.map((project) => (
            <a key={project.id} href={`/dashboard/${project.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '16px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <h3 style={{ color: 'white', fontWeight: '600', marginBottom: '6px', fontSize: '16px' }}>
                      {project.name}
                    </h3>
                    <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.5' }}>
                      {project.blueprints?.structured_json?.problem_statement}
                    </p>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(59,130,246,0.1)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59,130,246,0.2)',
                    whiteSpace: 'nowrap',
                    marginLeft: '16px',
                    flexShrink: 0,
                  }}>
                    {project.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
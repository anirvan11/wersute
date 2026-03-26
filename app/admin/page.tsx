'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import AdminProjectList from '@/components/dashboard/AdminProjectList'
import Navbar from '@/components/ui/Navbar'

export default function AdminPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [pendingFreelancers, setPendingFreelancers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    async function checkAndLoad() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }

      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userData?.role !== 'admin') {
        window.location.href = '/'
        return
      }

      setAuthorized(true)

      const [projectsRes, pendingRes] = await Promise.all([
        fetch('/api/admin/projects'),
        fetch('/api/admin/freelancers?status=pending'),
      ])

      const projectsData = await projectsRes.json()
      const pendingData = await pendingRes.json()

      setProjects(projectsData.projects || [])
      setPendingFreelancers(pendingData.freelancers || [])
      setLoading(false)
    }
    checkAndLoad()
  }, [])

  if (!authorized) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#020817',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: '#475569' }}>Checking access...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>Admin Panel</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>
          {loading ? 'Loading...' : `${projects.length} projects · ${pendingFreelancers.length} pending approvals`}
        </p>
        {!loading && (
          <AdminProjectList
            projects={projects}
            pendingFreelancers={pendingFreelancers}
          />
        )}
      </div>
    </div>
  )
}
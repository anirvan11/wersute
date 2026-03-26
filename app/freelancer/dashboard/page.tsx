'use client'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function FreelancerDashboard() {
  const router = useRouter()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.replace('/freelancer/signup')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#020817', color: 'white' }}>
      <nav style={{
        padding: '0 24px', height: '56px', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid #1e293b',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '18px', fontWeight: '700', color: '#60a5fa' }}>Wersute</span>
          <span style={{ color: '#334155', margin: '0 4px' }}>|</span>
          <span style={{ color: '#64748b', fontSize: '14px' }}>Developer Dashboard</span>
        </div>
        <button
          onClick={handleSignOut}
          style={{
            background: 'none', border: '1px solid #1e293b', color: '#64748b',
            padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          }}
        >
          Sign out
        </button>
      </nav>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🛠️</div>
        <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '12px' }}>
          Developer Dashboard
        </h1>
        <p style={{ color: '#64748b', fontSize: '15px' }}>
          Coming soon — your assigned projects will appear here.
        </p>
      </div>
    </div>
  )
}
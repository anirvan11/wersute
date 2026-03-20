'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function StartBuildButton({
  blueprintId,
  projectName
}: {
  blueprintId: string
  projectName: string
}) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleStartBuild() {
    setLoading(true)
    try {
      // Get current user if logged in
      const { data: { user } } = await supabase.auth.getUser()

      const res = await fetch('/api/project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blueprintId,
          projectName,
          userId: user?.id ?? null,
        }),
      })
      const data = await res.json()
      if (data.projectId) {
        // If not logged in, redirect to login with return URL
        if (!user) {
          router.push(`/login?next=/dashboard/${data.projectId}`)
        } else {
          router.push(`/dashboard/${data.projectId}`)
        }
      }
    } catch {
      alert('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-lg font-semibold mb-2">Ready to build?</h2>
      <p className="text-slate-400 text-sm mb-6">
        Our team will review your blueprint, match you with the right developer, and manage the entire build.
      </p>
      <button
        onClick={handleStartBuild}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50
                   disabled:cursor-not-allowed text-white py-4 rounded-xl
                   text-lg font-bold transition-colors"
      >
        {loading ? 'Creating your project...' : 'Start Build →'}
      </button>
    </div>
  )
}
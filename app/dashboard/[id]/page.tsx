export const revalidate = 0

import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import SignOutButton from '@/components/ui/SignOutButton'
import FreelancerSelector from '@/components/dashboard/FreelancerSelector'

const STATUS_LABELS: Record<string, string> = {
  MATCHING: 'Finding your developer',
  READY_TO_SELECT: 'Choose your developer',
  DEVELOPER_ASSIGNED: 'Developer assigned',
  IN_DEVELOPMENT: 'Being built',
  TESTING: 'In testing',
  COMPLETED: 'Completed! 🎉',
}

const STATUS_ORDER = [
  'MATCHING',
  'READY_TO_SELECT',
  'DEVELOPER_ASSIGNED',
  'IN_DEVELOPMENT',
  'TESTING',
  'COMPLETED',
]

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('*, blueprints(*)')
    .eq('id', id)
    .single()

  if (!project) return notFound()

  // Fetch quotes + freelancers if READY_TO_SELECT
  let quotes: any[] = []
  if (project.status === 'READY_TO_SELECT') {
    const { data } = await supabaseAdmin
      .from('project_quotes')
      .select('*, freelancers(*)')
      .eq('project_id', id)
    quotes = data || []
  }

  // Fetch selected freelancer if assigned
  let selectedFreelancer = null
  if (project.selected_freelancer_id) {
    const { data } = await supabaseAdmin
      .from('freelancers')
      .select('*')
      .eq('id', project.selected_freelancer_id)
      .single()
    selectedFreelancer = data
  }

  const statusIdx = STATUS_ORDER.indexOf(project.status)
  const b = project.blueprints?.structured_json

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
        <span className="text-xl font-bold text-blue-400">Wersute</span>
        <span className="text-slate-400 text-sm">Founder Dashboard</span>
        <SignOutButton />
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">{project.name}</h1>
          {b && <p className="text-slate-400">{b.startup_summary}</p>}
        </div>

        {/* Status Timeline */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
            Project Status
          </h2>
          <div className="space-y-5">
            {STATUS_ORDER.map((s, i) => (
              <div key={s} className="flex items-center gap-4">
                <div className={`w-4 h-4 rounded-full flex-shrink-0 transition-all ${
                  i < statusIdx ? 'bg-green-500' : i === statusIdx ? 'bg-blue-500 ring-4 ring-blue-500/20' : 'bg-slate-700'
                }`} />
                <span className={`text-sm flex-1 ${i === statusIdx ? 'text-white font-semibold' : 'text-slate-500'}`}>
                  {STATUS_LABELS[s]}
                </span>
                {i === statusIdx && (
                  <span className="text-blue-400 text-xs bg-blue-400/10 px-2 py-1 rounded-full">Current</span>
                )}
                {i < statusIdx && <span className="text-green-400 text-xs">✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* MATCHING — waiting message */}
        {project.status === 'MATCHING' && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6 text-center">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-white font-semibold text-lg mb-2">Finding the right developers for you</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
              Our team is reviewing your blueprint and identifying developers who are the best fit for your project. We'll notify you by email as soon as your matches are ready.
            </p>
          </div>
        )}

        {/* READY_TO_SELECT — freelancer cards */}
        {project.status === 'READY_TO_SELECT' && quotes.length > 0 && (
          <FreelancerSelector projectId={id} quotes={quotes} />
        )}

        {/* DEVELOPER_ASSIGNED and beyond — show selected dev */}
        {selectedFreelancer && project.status !== 'READY_TO_SELECT' && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800 mb-6">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Your Developer
            </h2>
            <div className="flex items-center gap-4">
              {selectedFreelancer.photo_url && (
                <img
                  src={selectedFreelancer.photo_url}
                  alt={selectedFreelancer.name}
                  className="w-14 h-14 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">{selectedFreelancer.name}</h3>
                <p className="text-slate-400 text-sm">{selectedFreelancer.tagline}</p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {selectedFreelancer.skills?.map((s: string) => (
                    <span key={s} className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {selectedFreelancer.portfolio_url && (<a
                
                  href={selectedFreelancer.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 text-sm hover:underline"
                >
                  Portfolio →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Blueprint Summary */}
        {b && (
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Blueprint Summary
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">{b.problem_statement}</p>
            <div className="flex gap-6 text-sm flex-wrap">
              <div>
                <span className="text-slate-500">Timeline</span>
                <span className="text-white ml-2">{b.estimated_timeline_days} days</span>
              </div>
              <div>
                <span className="text-slate-500">Complexity</span>
                <span className="text-white ml-2 capitalize">{b.complexity_level}</span>
              </div>
              <div>
                <span className="text-slate-500">Est. Cost</span>
                <span className="text-white ml-2">
                  {b.estimated_cost_range.budget
                    ? '₹' + (b.estimated_cost_range.budget.min / 100000).toFixed(1) + 'L – ₹' + (b.estimated_cost_range.budget.max / 100000).toFixed(1) + 'L'
                    : '₹' + (b.estimated_cost_range.min / 100000).toFixed(1) + 'L – ₹' + (b.estimated_cost_range.max / 100000).toFixed(1) + 'L'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
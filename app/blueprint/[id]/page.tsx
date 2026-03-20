import { supabaseAdmin } from '@/lib/supabase-admin'
import { notFound } from 'next/navigation'
import StartBuildButton from '@/components/blueprint/StartBuildButton'

export default async function BlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: blueprint } = await supabaseAdmin
    .from('blueprints')
    .select('*')
    .eq('id', id)
    .single()

  if (!blueprint) return notFound()

  const b = blueprint.structured_json

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10">
          <span className="text-blue-400 text-sm font-medium uppercase tracking-widest">
            Your Blueprint
          </span>
          <h1 className="text-4xl font-bold mt-3 leading-tight">{b.startup_summary}</h1>
        </div>

        <div className="space-y-5">

          {/* Problem */}
          <Section title="Problem Statement" content={b.problem_statement} />

          {/* Target Users */}
          <Section title="Target Users" content={b.target_users} />

          {/* Core Features */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Core Features
            </h2>
            <ul className="space-y-3">
              {b.core_features.map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-blue-400 font-bold mt-0.5">0{i + 1}</span>
                  <span className="text-slate-200">{f}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Suggested Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {b.suggested_tech_stack.map((t: string) => (
                <span
                  key={t}
                  className="bg-blue-500/10 border border-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Complexity + Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Complexity" value={b.complexity_level} />
            <Stat label="Timeline" value={b.estimated_timeline_days + ' days'} />
          </div>

          {/* Cost Estimate */}
          <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">
              Cost Estimate
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Budget Tier</p>
                <p className="text-white font-semibold text-lg">
                  {b.estimated_cost_range.budget
                    ? '₹' + (b.estimated_cost_range.budget.min / 100000).toFixed(1) + 'L – ₹' + (b.estimated_cost_range.budget.max / 100000).toFixed(1) + 'L'
                    : '₹' + (b.estimated_cost_range.min / 100000).toFixed(1) + 'L – ₹' + (b.estimated_cost_range.max / 100000).toFixed(1) + 'L'
                  }
                </p>
                <p className="text-slate-500 text-xs mt-1">Indian freelancers</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4 border border-blue-500/20">
                <p className="text-blue-400 text-xs uppercase tracking-wider mb-2">Premium Tier</p>
                <p className="text-white font-semibold text-lg">
                  {b.estimated_cost_range.premium
                    ? '₹' + (b.estimated_cost_range.premium.min / 100000).toFixed(1) + 'L – ₹' + (b.estimated_cost_range.premium.max / 100000).toFixed(1) + 'L'
                    : 'N/A'
                  }
                </p>
                <p className="text-slate-500 text-xs mt-1">Boutique agencies</p>
              </div>
            </div>
          </div>

        </div>

        {/* CTA */}
<div className="mt-10">
  <StartBuildButton 
    blueprintId={id} 
    projectName={b.startup_summary.split('.')[0].slice(0, 60)}
  />
</div>

      </div>
    </div>
  )
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-slate-900 rounded-xl p-6 border border-slate-800">
      <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-3">
        {title}
      </h2>
      <p className="text-slate-200 leading-relaxed">{content}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-center">
      <p className="text-slate-500 text-xs uppercase tracking-widest mb-2">{label}</p>
      <p className="text-white font-semibold capitalize">{value}</p>
    </div>
  )
}
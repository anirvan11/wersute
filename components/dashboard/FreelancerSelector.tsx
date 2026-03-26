'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FreelancerSelector({ projectId, quotes }: { projectId: string; quotes: any[] }) {
  const router = useRouter()
  const [selecting, setSelecting] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)

  async function selectFreelancer(freelancerId: string) {
    if (!confirm('Confirm this developer for your project?')) return
    setSelecting(freelancerId)
    try {
      const res = await fetch('/api/admin/select-freelancer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, freelancerId }),
      })
      if (!res.ok) throw new Error('Failed')
      setSelected(freelancerId)
      router.refresh()
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      setSelecting(null)
    }
  }

  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        backgroundColor: 'rgba(52,211,153,0.05)',
        border: '1px solid rgba(52,211,153,0.2)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '20px' }}>🎉</span>
        <div>
          <p style={{ color: '#34d399', fontWeight: '600', fontSize: '14px', margin: 0 }}>
            Your matches are ready!
          </p>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '2px 0 0' }}>
            Review the developers below and select the one that's right for you.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {quotes.map((quote) => {
          const f = quote.freelancers
          const isSelecting = selecting === f.id
          const isSelected = selected === f.id
          return (
            <div key={quote.id} style={{
              backgroundColor: '#0f172a',
              border: isSelected ? '1px solid #34d399' : '1px solid #1e293b',
              borderRadius: '16px',
              padding: '20px 24px',
              transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {f.photo_url && (
                  <img
                    src={f.photo_url}
                    alt={f.name}
                    style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <h3 style={{ color: 'white', fontWeight: '600', fontSize: '16px', margin: '0 0 4px' }}>{f.name}</h3>
                      <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>{f.tagline}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ color: 'white', fontWeight: '700', fontSize: '20px' }}>
                        ₹{(quote.quote_amount / 100000).toFixed(1)}L
                      </div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>project quote</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                    {f.skills?.map((s: string) => (
                      <span key={s} style={{
                        backgroundColor: 'rgba(59,130,246,0.1)',
                        border: '1px solid rgba(59,130,246,0.2)',
                        color: '#93c5fd',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                      }}>{s}</span>
                    ))}
                  </div>

                  {quote.note && (
                    <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '10px', fontStyle: 'italic' }}>
                      "{quote.note}"
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                    <button
                      onClick={() => selectFreelancer(f.id)}
                      disabled={!!selecting || !!selected}
                      style={{
                        backgroundColor: isSelected ? '#34d399' : '#1a6fd4',
                        color: 'white',
                        border: 'none',
                        padding: '10px 24px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: selecting || selected ? 'not-allowed' : 'pointer',
                        opacity: selecting && !isSelecting ? 0.5 : 1,
                        transition: 'all 0.2s',
                      }}
                    >
                      {isSelecting ? 'Confirming...' : isSelected ? '✓ Selected' : 'Select this developer'}
                    </button>
                    {f.portfolio_url && ( <a
                      
                        href={f.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#60a5fa', fontSize: '13px', textDecoration: 'none' }}
                      >
                        View portfolio →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
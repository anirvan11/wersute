'use client'
import { useState } from 'react'
import ChatPanel from '@/components/chat/ChatPanel'

interface Freelancer {
  id: string
  name: string
}

interface Props {
  projectId: string
  projectName: string
  freelancers: Freelancer[]
  currentUserId: string
  status: string
}

export default function FounderChat({ projectId, projectName, freelancers, currentUserId, status }: Props) {
  const [chatOpen, setChatOpen] = useState(false)
  const [selectedFreelancer, setSelectedFreelancer] = useState<Freelancer | null>(
    freelancers.length === 1 ? freelancers[0] : null
  )

  if (freelancers.length === 0) return null

  return (
    <>
      {freelancers.length === 1 ? (
        <button
          onClick={() => setChatOpen(true)}
          style={{
            width: '100%', backgroundColor: '#1a6fd4', color: 'white',
            border: 'none', padding: '14px', borderRadius: '12px',
            fontSize: '15px', fontWeight: '600', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '8px', marginBottom: '16px',
          }}
        >
          💬 Message {freelancers[0].name}
        </button>
      ) : (
        <div style={{ marginBottom: '16px' }}>
          <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '10px' }}>
            Message a developer:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {freelancers.map(f => (
              <button
                key={f.id}
                onClick={() => { setSelectedFreelancer(f); setChatOpen(true) }}
                style={{
                  width: '100%', backgroundColor: '#0f172a', color: 'white',
                  border: '1px solid #1e293b', padding: '12px 16px', borderRadius: '10px',
                  fontSize: '14px', fontWeight: '500', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left',
                }}
              >
                💬 Message {f.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {chatOpen && selectedFreelancer && (
        <ChatPanel
          projectId={projectId}
          projectName={projectName}
          freelancerId={selectedFreelancer.id}
          freelancerName={selectedFreelancer.name}
          currentUserId={currentUserId}
          currentUserRole="founder"
          onClose={() => setChatOpen(false)}
        />
      )}
    </>
  )
}
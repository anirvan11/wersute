'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Message {
  id: string
  content: string
  sender_id: string
  sender_role: 'founder' | 'freelancer'
  freelancer_id: string
  project_id: string
  created_at: string
}
interface ChatPanelProps {
  projectId: string
  projectName: string
  freelancerId: string
  freelancerName: string
  currentUserId: string
  currentUserRole: 'founder' | 'freelancer'
  onClose: () => void
}

export default function ChatPanel({
  projectId,
  projectName,
  freelancerId,
  freelancerName,
  currentUserId,
  currentUserRole,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }, [])

  // Load initial messages
  useEffect(() => {
    async function loadMessages() {
      const res = await fetch(
        `/api/messages?projectId=${projectId}&freelancerId=${freelancerId}`,
        { headers: { 'x-user-id': currentUserId } }
      )
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
      setLoading(false)
      scrollToBottom()
    }
    loadMessages()
  }, [projectId, freelancerId, currentUserId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${projectId}:${freelancerId}:${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message
          if (newMsg.project_id !== projectId) return
          if (newMsg.freelancer_id !== freelancerId) return
          setMessages(prev => {
            if (prev.find(m => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
          scrollToBottom()
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [projectId, freelancerId, scrollToBottom])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [loading])

  async function sendMessage() {
    if (!input.trim() || sending) return
    const content = input.trim()
    setInput('')
    setSending(true)

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUserId,
        },
        body: JSON.stringify({
          projectId,
          freelancerId,
          content,
          senderRole: currentUserRole,
        }),
      })
    } catch (e) {
      console.error('Send failed:', e)
      setInput(content) // restore on failure
    } finally {
      setSending(false)
      inputRef.current?.focus()
    }
  }

  const otherName = currentUserRole === 'founder' ? freelancerName : 'Founder'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 40, backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '420px',
        backgroundColor: '#0f172a',
        borderLeft: '1px solid #1e293b',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        animation: 'slideIn 0.2s ease',
      }}>
        <style>{`
          @keyframes slideIn {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex', alignItems: 'center', gap: '12px',
          flexShrink: 0,
        }}>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '20px', flexShrink: 0, padding: '0' }}
          >
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: 'white', fontWeight: '600', fontSize: '15px' }}>{otherName}</div>
            <div style={{ color: '#475569', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {projectName}
            </div>
          </div>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80', flexShrink: 0 }} />
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '16px',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          {loading && (
            <div style={{ textAlign: 'center', color: '#475569', fontSize: '14px', marginTop: '32px' }}>
              Loading messages...
            </div>
          )}

          {!loading && messages.length === 0 && (
            <div style={{ textAlign: 'center', marginTop: '48px' }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}>👋</div>
              <p style={{ color: '#475569', fontSize: '14px' }}>
                No messages yet. Say hello!
              </p>
            </div>
          )}

          {messages.map((msg) => {
            const isMe = msg.sender_id === currentUserId
            return (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
              }}>
                <div style={{
                  maxWidth: '78%',
                  padding: '10px 14px',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  backgroundColor: isMe ? '#1a6fd4' : '#1e293b',
                  color: 'white',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  wordBreak: 'break-word',
                }}>
                  {msg.content}
                  <div style={{
                    fontSize: '11px',
                    color: isMe ? 'rgba(255,255,255,0.5)' : '#475569',
                    marginTop: '4px',
                    textAlign: 'right',
                  }}>
                    {new Date(msg.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid #1e293b',
          flexShrink: 0,
        }}>
          <div style={{
            display: 'flex', gap: '8px', alignItems: 'center',
            backgroundColor: '#1e293b', borderRadius: '24px',
            padding: '6px 6px 6px 16px', border: '1px solid #334155',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Message..."
              style={{
                flex: 1, background: 'none', border: 'none', color: 'white',
                fontSize: '15px', outline: 'none', minWidth: 0,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={sending || !input.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                backgroundColor: input.trim() && !sending ? '#1a6fd4' : '#334155',
                color: 'white', cursor: input.trim() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'background-color 0.2s',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
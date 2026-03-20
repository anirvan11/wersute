'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navbar from '@/components/ui/Navbar'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const STAGES = [
  'DISCOVERY',
  'CLARIFICATION',
  'FEATURE_STRUCTURING',
  'VALIDATION',
  'BLUEPRINT_GENERATION',
]

const STAGE_LABELS: Record<string, string> = {
  DISCOVERY: 'Discovery',
  CLARIFICATION: 'Clarification',
  FEATURE_STRUCTURING: 'Features',
  VALIDATION: 'Validation',
  BLUEPRINT_GENERATION: 'Blueprint',
}

export default function ChatWindow() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Wersute AI advisor. Tell me about your startup idea — what problem are you trying to solve?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [stage, setStage] = useState('DISCOVERY')
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        window.location.href = '/login'
        return
      }
      setUserId(session.user.id)
    }
    checkAuth()
  }, [])

  async function sendMessage() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, conversationId, userId }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      setConversationId(data.conversationId)
      setStage(data.stage)

      if (data.stage === 'BLUEPRINT_GENERATION' && !generatingBlueprint) {
        generateBlueprint(data.conversationId)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, something went wrong. Please try again.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function generateBlueprint(convId: string) {
    setGeneratingBlueprint(true)
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '⚙️ Generating your blueprint now — this takes about 10 seconds...' },
    ])

    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId }),
      })
      const data = await res.json()
      if (data.blueprintId) {
        router.push(`/blueprint/${data.blueprintId}`)
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Blueprint generation failed. Please try again.' },
      ])
      setGeneratingBlueprint(false)
    }
  }

  const stageIdx = STAGES.indexOf(stage)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      backgroundColor: '#020817',
      overflow: 'hidden',
    }}>

      {/* Navbar */}
      <Navbar />

      {/* Stage progress bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 20px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#475569',
          fontSize: '12px',
          marginRight: '8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}>
          {STAGE_LABELS[stage]}
        </span>
        {STAGES.map((s, i) => (
          <div key={s} style={{
            flex: 1,
            height: '3px',
            borderRadius: '999px',
            backgroundColor: i <= stageIdx ? '#3b82f6' : '#1e293b',
            transition: 'background-color 0.3s'
          }} />
        ))}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        WebkitOverflowScrolling: 'touch',
      }}>
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              backgroundColor: m.role === 'user' ? '#2563eb' : '#1e293b',
              color: m.role === 'user' ? 'white' : '#e2e8f0',
              fontSize: '15px',
              lineHeight: '1.6',
              wordBreak: 'break-word',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              backgroundColor: '#1e293b',
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              {[0, 150, 300].map((delay) => (
                <span key={delay} style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#475569',
                  display: 'inline-block',
                  animation: 'bounce 1s infinite',
                  animationDelay: `${delay}ms`
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Type your message..."
            disabled={loading || generatingBlueprint}
            style={{
              flex: 1,
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              color: 'white',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '16px',
              outline: 'none',
              opacity: loading || generatingBlueprint ? 0.5 : 1,
              minWidth: 0,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || generatingBlueprint || !input.trim()}
            style={{
              backgroundColor: '#2563eb',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '15px',
              border: 'none',
              cursor: loading || generatingBlueprint || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: loading || generatingBlueprint || !input.trim() ? 0.5 : 1,
              flexShrink: 0,
              whiteSpace: 'nowrap',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
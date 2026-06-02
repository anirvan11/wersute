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

// Phrases that mean "Wari is ready to generate" even if the FSM stage hasn't flipped yet
const GENERATE_TRIGGERS = [
  'generating your blueprint now',
  'i have everything i need',
]

export default function ChatWindow() {
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Wersute AI advisor. Tell me about your startup idea — what problem are you trying to solve?",
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [generatingBlueprint, setGeneratingBlueprint] = useState(false)
  const [generationFailed, setGenerationFailed] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [stage, setStage] = useState('DISCOVERY')
  const [userId, setUserId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, generatingBlueprint])

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/login')
        return
      }
      setUserId(session.user.id)
      setAuthChecked(true)
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!loading && authChecked && !generatingBlueprint) {
      inputRef.current?.focus()
    }
  }, [loading, authChecked, generatingBlueprint])

  async function sendMessage() {
    if (!input.trim() || loading || generatingBlueprint) return
    const userMsg = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 50)

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

      // Trigger generation if the stage flipped OR Wari signalled it in the message text.
      const text = (data.message || '').toLowerCase()
      const phraseTriggered = GENERATE_TRIGGERS.some((p) => text.includes(p))
      const shouldGenerate = data.stage === 'BLUEPRINT_GENERATION' || phraseTriggered

      if (shouldGenerate && !generatingBlueprint) {
        // small delay so the user reads Wari's confirmation line before the loader takes over
        setTimeout(() => generateBlueprint(data.conversationId), 600)
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
    if (!convId) return
    setGenerationFailed(false)
    setGeneratingBlueprint(true)

    // Client-side timeout so we never hang forever. 75s gives the 60s server function headroom.
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 75000)

    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: convId }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      if (!res.ok) throw new Error('Generation failed')
      const data = await res.json()

      if (data.blueprintId) {
        router.push(`/blueprint/${data.blueprintId}`)
      } else {
        throw new Error('No blueprint returned')
      }
    } catch {
      clearTimeout(timeout)
      setGeneratingBlueprint(false)
      setGenerationFailed(true)
    }
  }

  if (!authChecked) {
    return (
      <div style={{
        height: '100dvh',
        backgroundColor: '#020817',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ color: '#475569', fontSize: '14px' }}>Loading...</div>
      </div>
    )
  }

  const stageIdx = STAGES.indexOf(stage)

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      backgroundColor: '#020817',
      overflow: 'hidden',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    }}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: -400px 0; }
          100% { background-position: 400px 0; }
        }
      `}</style>

      <Navbar />

      {/* Stage progress bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        backgroundColor: '#0f172a',
        borderBottom: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <span style={{
          color: '#475569',
          fontSize: '11px',
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
      <div
        ref={messagesRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '78%',
              padding: '10px 14px',
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              backgroundColor: m.role === 'user' ? '#2563eb' : '#1e293b',
              color: m.role === 'user' ? 'white' : '#e2e8f0',
              fontSize: '15px',
              lineHeight: '1.55',
              wordBreak: 'break-word',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}>
              {m.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '18px 18px 18px 4px',
              backgroundColor: '#1e293b',
              display: 'flex',
              gap: '5px',
              alignItems: 'center'
            }}>
              {[0, 150, 300].map((delay) => (
                <span key={delay} style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  backgroundColor: '#475569',
                  display: 'inline-block',
                  animation: 'bounce 1.2s infinite ease-in-out',
                  animationDelay: `${delay}ms`
                }} />
              ))}
            </div>
          </div>
        )}

        {/* Blueprint generation loader — animated, replaces the static text bubble */}
        {generatingBlueprint && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              padding: '28px 32px',
              borderRadius: '20px',
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              maxWidth: '320px',
              width: '100%',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: '3px solid #1e293b',
                borderTopColor: '#3b82f6',
                animation: 'spin 0.8s linear infinite',
              }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ color: 'white', fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
                  Building your blueprint
                </div>
                <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                  Wari is scoping features, stack, and costs. This takes 15–30 seconds.
                </div>
              </div>
              {/* shimmer skeleton lines */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {['90%', '75%', '85%'].map((w, i) => (
                  <div key={i} style={{
                    height: '8px',
                    width: w,
                    borderRadius: '999px',
                    background: 'linear-gradient(90deg, #1e293b 25%, #2d3b52 50%, #1e293b 75%)',
                    backgroundSize: '400px 100%',
                    animation: 'shimmer 1.4s infinite linear',
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generation failed — retry without losing the conversation */}
        {generationFailed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              padding: '20px 24px',
              borderRadius: '16px',
              backgroundColor: '#0f172a',
              border: '1px solid rgba(239,68,68,0.3)',
              maxWidth: '320px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#f87171', fontSize: '14px', fontWeight: 600 }}>
                Blueprint generation timed out
              </div>
              <div style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.5 }}>
                Your conversation is saved. This sometimes happens under load — just try again.
              </div>
              <button
                onClick={() => conversationId && generateBlueprint(conversationId)}
                style={{
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry generation
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} style={{ height: '4px' }} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        backgroundColor: '#0f172a',
        borderTop: '1px solid #1e293b',
        flexShrink: 0,
      }}>
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage() }}
          autoComplete="off"
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            backgroundColor: '#1e293b',
            borderRadius: '24px',
            padding: '6px 6px 6px 16px',
            border: '1px solid #334155',
          }}
        >
          <input type="password" style={{ display: 'none' }} autoComplete="new-password" readOnly />
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCorrect="on"
            autoCapitalize="sentences"
            spellCheck={true}
            data-form-type="other"
            data-lpignore="true"
            placeholder={generatingBlueprint ? 'Generating blueprint…' : 'Message...'}
            disabled={loading || generatingBlueprint}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              minWidth: 0,
              opacity: loading || generatingBlueprint ? 0.5 : 1,
            }}
          />
          <button
            type="submit"
            disabled={loading || generatingBlueprint || !input.trim()}
            style={{
              backgroundColor: input.trim() && !loading && !generatingBlueprint ? '#2563eb' : '#1e3a5f',
              color: 'white',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              cursor: input.trim() && !loading && !generatingBlueprint ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'background-color 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M22 2L11 13" />
              <path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  )
}
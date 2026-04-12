import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { BottomNav } from '../../components/ui/BottomNav'
import { getMockRole } from '../../lib/mockAuth'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const SUGGESTED_QUESTIONS = [
  "What are the most urgent things to do this week?",
  "Which vendors still need to be confirmed?",
  "Am I on track with my budget?",
  "What payments are coming up in the next 30 days?",
  "Is my catering budget reasonable for my guest count?",
  "How much time do I have before I need to book my mehendi artist?",
]

export default function PlanningAssistant() {
  const { weddingId } = useParams<{ weddingId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const accessLevel = getMockRole()

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [coupleNames, setCoupleNames] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!weddingId) return
    supabase
      .from('weddings')
      .select('couple_name_1, couple_name_2')
      .eq('id', weddingId)
      .single()
      .then(({ data }) => {
        if (data) setCoupleNames(`${data.couple_name_1} & ${data.couple_name_2}`)
      })
  }, [weddingId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (messageOverride?: string) => {
    const userMessage = (messageOverride ?? input).trim()
    if (!userMessage || isLoading) return

    setInput('')
    setIsLoading(true)

    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }])

    try {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          weddingId,
          userMessage,
          conversationHistory: messages.slice(-6).map(m => ({
            role: m.role,
            content: m.content
          }))
        }
      })

      if (error || !data?.message) {
        throw new Error(data?.error ?? error?.message ?? 'Request failed')
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }])

    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date()
      }])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleChipClick = (question: string) => {
    handleSend(question)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(`/wedding/${weddingId}`)}
          className="text-gray-500 min-h-[44px] min-w-[44px] flex items-center justify-center -ml-2"
        >
          ←
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-medium text-gray-900">Ask Madhu</h1>
          {coupleNames && (
            <p className="text-sm text-gray-500 truncate">{coupleNames}</p>
          )}
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="text-sm text-gray-500 min-h-[44px] px-2 flex items-center"
          >
            New chat
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-[140px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center pt-8 pb-4">
            <div className="w-16 h-16 bg-vivaah-50 border border-vivaah-200 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🪷</span>
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-1">Hi, I'm Madhu ✦</h2>
            <p className="text-[15px] text-gray-500 text-center mb-6">
              I know your full plan — vendors, budget, timeline, events. Ask me anything.
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {SUGGESTED_QUESTIONS.map(q => (
                <button
                  key={q}
                  onClick={() => handleChipClick(q)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 hover:bg-vivaah-50 hover:border-vivaah-200 transition-colors text-left min-h-[44px]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => (
              <div key={i}>
                {msg.role === 'user' ? (
                  <div className="flex justify-end mb-3">
                    <div className="bg-vivaah-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                      <p className="text-[15px]">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-start mb-3 gap-2">
                    <div className="w-8 h-8 rounded-full bg-vivaah-50 border border-vivaah-200 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-sm">🪷</span>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                      <p className="text-[15px] text-gray-900 whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start mb-3 gap-2">
                <div className="w-8 h-8 rounded-full bg-vivaah-50 border border-vivaah-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🪷</span>
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3">
                  <div className="flex gap-1 items-center">
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input bar — fixed above bottom nav */}
      <div className="fixed bottom-[56px] left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 z-40 max-w-md mx-auto">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Ask about your wedding plan..."
            className="flex-1 h-11 border border-gray-300 rounded-xl px-3 text-[15px] focus:border-vivaah-600 focus:ring-0 outline-none bg-white"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="bg-vivaah-600 text-white h-11 w-11 rounded-xl flex items-center justify-center min-h-[44px] min-w-[44px] disabled:opacity-50"
          >
            ↑
          </button>
        </div>
      </div>

      <BottomNav
        weddingId={weddingId ?? ''}
        currentAccessLevel={accessLevel}
        currentPath={location.pathname}
      />
    </div>
  )
}

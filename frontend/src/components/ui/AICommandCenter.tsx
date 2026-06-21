'use client'

import { useState, useRef, useCallback } from 'react'
import { api } from '@/lib/api'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

export default function AICommandCenter() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: Message = { id: Date.now(), role: 'user', content: text }
    setMessages((m) => [...m, userMsg])
    setInput('')
    setSending(true)

    try {
      const reply = await api.post('/api/ai/chat', {
        messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
      })
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', content: reply.content }])
    } catch {
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, I could not reach the AI service. Please try again.' }])
    } finally {
      setSending(false)
    }

    // Scroll to bottom
    setTimeout(() => chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' }), 100)
  }, [input, sending, messages])

  return (
    <div className="max-w-3xl">
      <div ref={chatRef} className="h-64 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-body-sm text-charcoal-400">
            Ask the AI: &ldquo;What taxes are due this month?&rdquo;
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-lg ${
                m.role === 'user'
                  ? 'bg-primary-off text-secondary ml-8'
                  : 'bg-charcoal-50 text-secondary mr-8'
              }`}
            >
              <div className="text-body-sm">{m.content}</div>
            </div>
          ))
        )}
        {sending && (
          <div className="flex items-center gap-2 text-caption text-charcoal-500 pl-1">
            <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Thinking...
          </div>
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask a question, e.g. Forecast next quarter cash flow"
          disabled={sending}
          className="flex-1 px-4 py-3 rounded-lg border border-charcoal-200 bg-white text-secondary text-body-sm placeholder:text-charcoal-400 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent disabled:opacity-50"
        />
        <button
          onClick={send}
          disabled={sending || !input.trim()}
          className="px-5 py-3 bg-accent text-white rounded-lg text-body-sm font-medium hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Ask
        </button>
      </div>
    </div>
  )
}

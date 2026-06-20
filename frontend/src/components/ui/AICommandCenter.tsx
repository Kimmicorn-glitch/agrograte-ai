'use client'

import { useState } from 'react'

export default function AICommandCenter() {
  const [messages, setMessages] = useState<{ id: number; role: string; text: string }[]>([])
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    setMessages((m) => [...m, { id: Date.now(), role: 'user', text: input }])
    setInput('')
    // placeholder: hook to backend AI service
    setTimeout(() => {
      setMessages((m) => [...m, { id: Date.now() + 1, role: 'assistant', text: 'Simulated AI response — connect your AI backend.' }])
    }, 600)
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-elevated max-w-3xl">
      <div className="h-64 overflow-y-auto p-2 space-y-3">
        {messages.length === 0 ? (
          <div className="text-body-sm text-secondary/60">Ask the AI: "What taxes are due?"</div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className={`p-3 rounded-lg ${m.role === 'user' ? 'bg-primary-off text-secondary' : 'bg-charcoal-50 text-secondary'}`}>
              <div className="text-sm">{m.text}</div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex gap-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask a question, e.g. Forecast next quarter cash flow" className="flex-1 px-4 py-3 rounded-lg border border-gray-200 bg-white text-secondary" />
        <button onClick={send} className="px-4 py-3 bg-accent text-white rounded-lg">Ask</button>
      </div>
    </div>
  )
}

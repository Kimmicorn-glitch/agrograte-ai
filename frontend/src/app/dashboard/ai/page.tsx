'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { staggerContainer, fadeInUp, chatMessage } from '@/lib/motion'
import { SUGGESTED_QUERIES } from '@/lib/constants'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const welcome: Message = {
  id: 'welcome',
  role: 'assistant',
  content: "Good morning. I'm your AI financial analyst. I have real-time access to your banking data, compliance status, and financial history. How can I help you today?",
  timestamp: new Date(),
}

export default function AICommandCenter() {
  const [messages, setMessages] = useState<Message[]>([welcome])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typing])

  const send = async (q: string) => {
    if (!q.trim()) return
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: 'user', content: q, timestamp: new Date() }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: generate(q), timestamp: new Date() }])
      setTyping(false)
    }, 1000)
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="h-[calc(100vh-6rem)] flex flex-col">
      <motion.div variants={fadeInUp} className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-accent-subtle flex items-center justify-center">
          <Sparkles size={16} className="text-accent" />
        </div>
        <div>
          <h1 className="text-display-sm text-secondary">AI Command Center</h1>
          <p className="text-body-md text-charcoal-500">Ask anything about your financial data</p>
        </div>
      </motion.div>

      <div className="flex-1 card flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <motion.div key={msg.id} variants={chatMessage} initial="hidden" animate="visible" className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-accent-subtle text-accent' : 'bg-charcoal-100 text-charcoal-600'}`}>
                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
              </div>
              <div className={`max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-charcoal-50 text-charcoal-800' : 'bg-accent text-white'}`}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {typing && (
            <motion.div variants={chatMessage} initial="hidden" animate="visible" className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-accent-subtle flex items-center justify-center shrink-0"><Bot size={16} className="text-accent" /></div>
              <div className="bg-charcoal-50 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-charcoal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}
          {messages.length === 1 && !typing && (
            <div className="mt-6">
              <p className="text-caption text-charcoal-400 mb-3 font-medium">Suggested queries</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUERIES.map((q) => (
                  <button key={q} onClick={() => send(q)} className="px-3 py-1.5 text-sm text-charcoal-600 bg-charcoal-50 hover:bg-charcoal-100 rounded-lg border border-charcoal-200 transition-all hover:border-charcoal-300">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div className="border-t border-charcoal-100 p-4 md:px-6">
          <form onSubmit={(e) => { e.preventDefault(); send(input) }} className="flex gap-3">
            <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your finances..." className="input flex-1" />
            <button type="submit" disabled={!input.trim() || typing} className="btn-primary px-5 disabled:opacity-40">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  )
}

function generate(q: string): string {
  const l = q.toLowerCase()
  if (l.includes('tax') && l.includes('due')) {
    return "Based on your current financial data, here's your tax position:\n\n**Estimated Tax Liability:** R 384,200\n**Provision Made:** R 320,000\n**Shortfall:** R 64,200\n\n**Upcoming Deadlines:**\n- Provisional Tax (1st half): 31 Aug 2025\n- VAT201 (Bi-monthly): 25 Jul 2025\n- EMP201 (Monthly): 07 Jul 2025\n\nWould you like me to create a tax provisioning plan?"
  }
  if (l.includes('deductible') || l.includes('expense')) {
    return "Here are your deductible expenses for May 2025:\n\n| Category | Amount | Deductible |\n|----------|--------|------------|\n| Office Rent | R 45,000 | 100% |\n| Software & SaaS | R 12,847 | 100% |\n| Professional Fees | R 28,500 | 100% |\n| Travel & Meals | R 8,230 | 80% |\n| Equipment | R 156,000 | Section 12C |\n\n**Total Deductible:** R 242,277\n**Potential Tax Saving:** R 67,838"
  }
  if (l.includes('forecast') || l.includes('cash flow') || l.includes('next quarter')) {
    return "**Q3 2025 Cash Flow Forecast:**\n\n**Projected Inflows:** R 2,850,000\n- Client payments: R 2,100,000\n- VAT refunds: R 45,000\n- Other income: R 705,000\n\n**Projected Outflows:** R 1,920,000\n- Payroll: R 680,000\n- Operating expenses: R 420,000\n- Tax payments: R 384,200\n- Capex: R 435,800\n\n**Net Position:** +R 930,000\n**End of Quarter Balance:** R 3,777,530\n\nConfidence: 87% (based on historical patterns)"
  }
  if (l.includes('vat') || l.includes('exposure')) {
    return "**VAT Exposure Analysis:**\n\n**Current VAT Due:** R 92,450\n**VAT Period:** May-Jun 2025\n**Filing Deadline:** 25 Jul 2025\n\n**Breakdown:**\n- Output VAT (15%): R 285,000\n- Input VAT claimed: -R 192,550\n- Net VAT Payable: R 92,450\n\n**Risk Assessment:** Low\n- All invoices verified\n- SARS e-Filing credentials active\n- 3 previous filings on time\n\nWould you like me to prepare the VAT201 return?"
  }
  return "Thank you for your question. I'm analyzing your financial data to provide the most accurate insight.\n\nHere's what I can see:\n- **Cash Position:** R 2,847,530 (healthy liquidity)\n- **Recent Trend:** Positive cash flow over last 30 days\n- **Compliance Status:** All SARS filings up to date\n\nCould you provide more specific details? For example, you could ask about:\n- Specific transaction categories\n- Month-over-month comparisons\n- Compliance deadlines\n- Investment opportunities"
}

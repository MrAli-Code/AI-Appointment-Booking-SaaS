'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from './locale-provider'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader } from './ui/card'
import { MessageSquare, Send, X, Bot, User, Sparkles, Zap, Clock, ChevronDown } from 'lucide-react'
import { apiFetch } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const quickReplies = [
  '📅 رزرو قرار',
  '👀 مشاهده رزروها',
  '❌ لغو رزرو',
  '🔄 تغییر زمان',
  '💬 صحبت با اپراتور',
]

export function ChatWidget() {
  const { t, locale, dir } = useLocale()
  const isRtl = dir === 'rtl'
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('chat.start') }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`session_${Date.now()}`)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)

    try {
      const data = await apiFetch<{ response: string; intent: string; actions: string[] }>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId.current,
          message: msg,
          tenant_id: 'demo',
          locale,
        }),
      })
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.' }])
    }
    setLoading(false)
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-2xl btn-gradient shadow-2xl shadow-violet-500/40 hover:shadow-violet-500/60 transition-all duration-300 hover:scale-110 pulse-glow"
        size="icon"
      >
        <div className="relative">
          <MessageSquare className="h-7 w-7" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
          </span>
        </div>
      </Button>
    )
  }

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 glass-card rounded-2xl px-5 py-3 cursor-pointer flex items-center gap-3 shadow-2xl" onClick={() => setMinimized(false)}>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-sm">{t('chat.title')}</p>
          <p className="text-xs text-green-500">آنلاین</p>
        </div>
        <ChevronDown className="h-5 w-5 text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 z-50 flex w-[22rem] flex-col shadow-2xl border-0 rounded-2xl overflow-hidden" dir={dir}>
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">{t('chat.title')}</p>
              <div className="flex items-center gap-1.5">
                <span className="flex h-2 w-2 rounded-full bg-green-300">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-green-300 opacity-75" />
                </span>
                <p className="text-xs text-white/80">آنلاین</p>
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => setMinimized(true)}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10 rounded-lg" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4" style={{ maxHeight: '350px', minHeight: '300px' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={cn(
              'flex gap-2 chat-message-enter',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            <div className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl shrink-0 shadow-sm',
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-500 to-purple-600'
                : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700'
            )}>
              {msg.role === 'user'
                ? <User className="h-4 w-4 text-white" />
                : <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              }
            </div>
            <div className={cn(
              'rounded-2xl px-4 py-3 text-sm leading-relaxed max-w-[80%] shadow-sm',
              msg.role === 'user'
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white rounded-tr-md'
                : msg.role === 'system'
                  ? 'bg-muted text-muted-foreground text-xs text-center w-full'
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-tl-md'
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
              <Bot className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex gap-1.5 py-2 px-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <span className="typing-dot h-2 w-2 rounded-full bg-violet-500" />
              <span className="typing-dot h-2 w-2 rounded-full bg-violet-500" />
              <span className="typing-dot h-2 w-2 rounded-full bg-violet-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Zap className="h-3 w-3 text-violet-500" />
            پاسخ‌های سریع:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => handleSend(reply)}
                className="text-xs px-3 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/30 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="border-t p-4 bg-gradient-to-r from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
        <div className="flex gap-2">
          <Input
            placeholder={t('chat.placeholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
            className="rounded-xl border-2 py-6 px-4"
          />
          <Button
            size="icon"
            onClick={() => handleSend()}
            disabled={loading}
            className="h-12 w-12 rounded-xl btn-gradient shadow-lg shrink-0"
          >
            {loading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}

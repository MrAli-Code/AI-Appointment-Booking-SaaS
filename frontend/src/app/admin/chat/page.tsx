'use client'

import { useLocale } from '@/components/locale-provider'
import { ChatWidget } from '@/components/chat-widget'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, Sparkles, MessageSquare, Zap, Globe } from 'lucide-react'

export default function AdminChatPage() {
  const { t, locale } = useLocale()

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text-primary">اپراتور هوشمند</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">چت با دستیار هوشمند رزرو</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        {[
          { icon: Bot, label: 'دستیار ۲۴/۷', desc: 'پاسخگویی در هر ساعت از شبانه‌روز', gradient: 'from-violet-500 to-purple-600' },
          { icon: Zap, label: 'پاسخ هوشمند', desc: 'تشخیص دقیق نیاز مشتری با هوش مصنوعی', gradient: 'from-blue-500 to-cyan-600' },
          { icon: Globe, label: 'دو زبانه', desc: 'پشتیبانی از فارسی و انگلیسی', gradient: 'from-emerald-500 to-teal-600' },
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-xl rounded-2xl overflow-hidden card-hover">
            <CardContent className="p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg mb-4`}>
                <item.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-1">{item.label}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden min-h-[400px]">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="gradient-text-primary">پنل گفتگو</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-12">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30">
              <Bot className="h-10 w-10 text-violet-500" />
            </div>
            <p className="text-xl text-muted-foreground mb-2">دستیار هوشمند آماده پاسخگویی است</p>
            <p className="text-sm text-muted-foreground">روی دکمه چت در گوشه پایین سمت راست کلیک کنید</p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-violet-500">
              <Sparkles className="h-4 w-4" />
              <span>قدرت گرفته از هوش مصنوعی</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ChatWidget />
    </div>
  )
}

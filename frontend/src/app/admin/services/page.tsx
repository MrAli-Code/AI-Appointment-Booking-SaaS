'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/components/locale-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Briefcase, Plus, Clock, DollarSign, Sparkles, Tag, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/utils'

interface Service {
  id: string
  name: string
  name_fa: string | null
  duration_minutes: number
  price: number
  currency: string
  category: string | null
  color: string
}

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
]

export default function AdminServices() {
  const { t, locale } = useLocale()
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    apiFetch<Service[]>('/admin/services').then(setServices).catch(console.error)
  }, [])

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text-primary">{t('nav.services')}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">مدیریت خدمات و سرویس‌ها</p>
        </div>
        <Button className="btn-gradient rounded-xl px-6 py-6 gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          {t('services.add')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((s, i) => (
          <div key={s.id} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden card-hover group">
              <div className={`h-2 bg-gradient-to-r ${gradients[i % gradients.length]}`} />
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${gradients[i % gradients.length]} shadow-lg transition-transform group-hover:scale-110`}>
                      <Briefcase className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <p className="text-lg font-bold group-hover:text-primary transition-colors">
                        {locale === 'fa' && s.name_fa ? s.name_fa : s.name}
                      </p>
                      {s.category && (
                        <div className="flex items-center gap-1 mt-1">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{s.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-card shadow-sm">
                      <Clock className="h-4 w-4 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t('services.duration')}</p>
                      <p className="font-semibold">{s.duration_minutes}</p>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-border" />
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-card shadow-sm">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{t('services.price')}</p>
                      <p className="font-bold text-lg bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                        ${s.price}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30">
              <Briefcase className="h-10 w-10 text-violet-500" />
            </div>
            <p className="text-xl text-muted-foreground mb-6">هنوز سرویسی ثبت نشده است</p>
            <Button className="btn-gradient rounded-xl px-8 py-6 gap-2">
              <Plus className="h-5 w-5" />
              {t('services.add')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

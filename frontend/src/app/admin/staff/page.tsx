'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/components/locale-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Plus, Mail, Phone, Star, CalendarDays, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/utils'

interface Staff {
  id: string
  name: string
  email: string | null
  phone: string | null
  role: string | null
  color: string
  is_active: boolean
}

const avatarGradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-indigo-500 to-violet-600',
]

export default function AdminStaff() {
  const { t, locale } = useLocale()
  const [staff, setStaff] = useState<Staff[]>([])

  useEffect(() => {
    apiFetch<Staff[]>('/admin/staff').then(setStaff).catch(console.error)
  }, [])

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text-primary">{t('nav.staff')}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">مدیریت تیم و کارکنان</p>
        </div>
        <Button className="btn-gradient rounded-xl px-6 py-6 gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          {t('staff.add')}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {staff.map((s, i) => (
          <div key={s.id} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden card-hover group">
              <div className="relative">
                <div className={`h-24 bg-gradient-to-r ${avatarGradients[i % avatarGradients.length]} opacity-90`} />
                <div className="absolute -bottom-10 left-6">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br ${avatarGradients[i % avatarGradients.length]} text-white text-3xl font-bold shadow-xl border-4 border-white dark:border-card ring-2 ring-white/50`}>
                    {s.name.charAt(0)}
                  </div>
                </div>
                <div className="absolute top-4 right-4">
                  <Badge variant={s.is_active ? 'success' : 'secondary'} className="rounded-full px-3 py-1 shadow-lg backdrop-blur">
                    {s.is_active ? 'فعال' : 'غیرفعال'}
                  </Badge>
                </div>
              </div>
              <CardContent className="pt-14 pb-6 px-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xl font-bold group-hover:text-primary transition-colors">{s.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <Star className="h-3.5 w-3.5" />
                      {s.role || 'کارمند'}
                    </p>
                  </div>
                  <div className="space-y-2 pt-2 border-t">
                    {s.email && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 dark:bg-violet-950/30">
                          <Mail className="h-4 w-4 text-violet-500" />
                        </div>
                        {s.email}
                      </div>
                    )}
                    {s.phone && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
                          <Phone className="h-4 w-4 text-emerald-500" />
                        </div>
                        {s.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/30">
                        <CalendarDays className="h-4 w-4 text-blue-500" />
                      </div>
                      امروز فعال
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
        {staff.length === 0 && (
          <div className="col-span-full text-center py-16">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-950/30 dark:to-purple-950/30">
              <Users className="h-10 w-10 text-violet-500" />
            </div>
            <p className="text-xl text-muted-foreground mb-6">هنوز کارمندی ثبت نشده است</p>
            <Button className="btn-gradient rounded-xl px-8 py-6 gap-2">
              <Plus className="h-5 w-5" />
              {t('staff.add')}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

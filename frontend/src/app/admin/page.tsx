'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/components/locale-provider'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CalendarDays, DollarSign, Users, Briefcase, TrendingUp, Clock, ArrowRight, Sparkles, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/utils'

interface DashboardData {
  total_bookings: number
  today_bookings: number
  upcoming_bookings: number
  total_revenue: number
  active_staff: number
  active_services: number
}

const statCards = (t: (k: string) => string) => [
  { key: 'total', label: t('dashboard.total_bookings'), icon: CalendarDays, gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
  { key: 'today', label: t('dashboard.today_bookings'), icon: Clock, gradient: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/25' },
  { key: 'upcoming', label: t('dashboard.upcoming'), icon: TrendingUp, gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
  { key: 'revenue', label: t('dashboard.revenue'), icon: DollarSign, gradient: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25' },
  { key: 'staff', label: t('dashboard.active_staff'), icon: Users, gradient: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-500/25' },
  { key: 'services', label: t('dashboard.active_services'), icon: Briefcase, gradient: 'from-indigo-500 to-violet-600', shadow: 'shadow-indigo-500/25' },
]

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-rose-500 to-pink-600',
]

export default function AdminDashboard() {
  const { t, locale, dir } = useLocale()
  const isRtl = dir === 'rtl'
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<DashboardData>('/admin/dashboard')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const cardValues: Record<string, string | number> = {
    total: data?.total_bookings ?? 0,
    today: data?.today_bookings ?? 0,
    upcoming: data?.upcoming_bookings ?? 0,
    revenue: `$${data?.total_revenue?.toFixed(2) ?? '0.00'}`,
    staff: data?.active_staff ?? 0,
    services: data?.active_services ?? 0,
  }

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text-primary">{t('dashboard.welcome')}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">{t('app.tagline')}</p>
        </div>
        <div className="flex gap-3">
          <Button className="btn-gradient rounded-xl px-6 py-6 gap-2 shadow-lg">
            <Plus className="h-5 w-5" />
            رزرو جدید
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statCards(t).map((stat, i) => (
          <div key={stat.key} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden card-hover">
              <div className="relative p-6">
                <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10">
                  <div className={`w-full h-full bg-gradient-to-br ${stat.gradient} rounded-full`} />
                </div>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    {loading ? (
                      <div className="h-9 w-24 shimmer rounded-lg" />
                    ) : (
                      <p className="text-3xl font-bold">{cardValues[stat.key]}</p>
                    )}
                  </div>
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} shadow-lg ${stat.shadow}`}>
                    <stat.icon className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                <span className="gradient-text-primary">فعالیت‌های اخیر</span>
              </h3>
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                {t('dashboard.view_all')}
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'سارا محمدی', service: 'کوتاهی مو', time: '۲۵ دقیقه پیش', status: 'تایید شده', color: 'emerald' },
                { name: 'علی رضایی', service: 'رنگ مو', time: '۱ ساعت پیش', status: 'در انتظار', color: 'amber' },
                { name: 'مریم احمدی', service: 'مانیکور', time: '۳ ساعت پیش', status: 'تکمیل شده', color: 'blue' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-${item.color}-500 to-${item.color}-600 text-white font-bold text-sm`}>
                      {item.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.service} • {item.time}</p>
                    </div>
                  </div>
                  <Badge variant={item.status === 'تایید شده' ? 'success' : item.status === 'در انتظار' ? 'warning' : 'default'}>
                    {item.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">
                <span className="gradient-text-primary">اقدامات سریع</span>
              </h3>
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <div className="grid gap-3">
              {[
                { icon: CalendarDays, label: 'رزرو جدید', desc: 'ایجاد رزرو دستی', gradient: 'from-violet-500 to-purple-600' },
                { icon: Users, label: 'افزودن کارمند', desc: 'عضویت تیم جدید', gradient: 'from-emerald-500 to-teal-600' },
                { icon: Briefcase, label: 'سرویس جدید', desc: 'افزودن خدمات جدید', gradient: 'from-blue-500 to-cyan-600' },
              ].map((item, i) => (
                <button
                  key={i}
                  className="group flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-300 hover:border-violet-200 hover:shadow-lg dark:hover:border-violet-800 card-hover"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} shadow-lg transition-transform group-hover:scale-110`}>
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <ArrowRight className={cn("h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors", isRtl && "rotate-180")} />
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/components/locale-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, CalendarDays, DollarSign, ArrowUp, ArrowDown, BarChart3, Sparkles, Target } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/utils'

interface AnalyticsData {
  period_days: number
  data: { date: string; bookings: number; revenue: number }[]
}

export default function AdminAnalytics() {
  const { t, dir } = useLocale()
  const isRtl = dir === 'rtl'
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    apiFetch<AnalyticsData>('/admin/analytics?days=30')
      .then(setAnalytics)
      .catch(console.error)
  }, [])

  const total = analytics?.data?.reduce(
    (acc, d) => ({ bookings: acc.bookings + d.bookings, revenue: acc.revenue + d.revenue }),
    { bookings: 0, revenue: 0 }
  ) || { bookings: 0, revenue: 0 }

  const avgPerDay = analytics?.data?.length ? Math.round(total.bookings / analytics.data.length) : 0
  const avgRevenuePerDay = analytics?.data?.length ? total.revenue / analytics.data.length : 0

  const lastTwo = analytics?.data?.slice(-2) || []
  const bookingTrend = lastTwo.length === 2 ? lastTwo[1].bookings - lastTwo[0].bookings : 0

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text-primary">{t('nav.analytics')}</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">نمای کلی عملکرد کسب و کار</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {[
          { icon: CalendarDays, label: 'کل رزروها (۳۰ روز)', value: total.bookings, trend: `+${bookingTrend}`, gradient: 'from-violet-500 to-purple-600', positive: true },
          { icon: DollarSign, label: 'درآمد کل (۳۰ روز)', value: `$${total.revenue.toFixed(2)}`, trend: `$${avgRevenuePerDay.toFixed(0)}/day`, gradient: 'from-emerald-500 to-teal-600', positive: true },
          { icon: Target, label: 'میانگین روزانه', value: avgPerDay, trend: `${avgRevenuePerDay.toFixed(0)} bookings`, gradient: 'from-blue-500 to-cyan-600', positive: true },
          { icon: TrendingUp, label: 'نرخ رشد', value: `${bookingTrend > 0 ? '+' : ''}${bookingTrend}`, trend: 'نسبت به دیروز', gradient: 'from-rose-500 to-pink-600', positive: bookingTrend >= 0 },
        ].map((stat, i) => (
          <div key={i} className="animate-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <Card className="border-0 shadow-xl rounded-2xl overflow-hidden card-hover">
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <Badge variant={stat.positive ? 'success' : 'destructive'} className="rounded-full">
                    <span className="flex items-center gap-1">
                      {stat.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                      {stat.trend}
                    </span>
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden md:col-span-2">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          <CardHeader className="bg-gradient-to-r from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="gradient-text-primary">رزروها و درآمد روزانه</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {analytics?.data?.length ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-muted-foreground pb-2 border-b">
                  <span>تاریخ</span>
                  <div className="flex gap-8">
                    <span>رزروها</span>
                    <span>درآمد</span>
                  </div>
                </div>
                {analytics.data.slice(-14).reverse().map((d, i) => (
                  <div key={d.date} className={cn(
                    "flex items-center justify-between py-3 px-4 rounded-xl transition-colors",
                    "hover:bg-gradient-to-r hover:from-violet-50/50 hover:to-purple-50/50 dark:hover:from-violet-950/20 dark:hover:to-purple-950/20",
                    "animate-in"
                  )} style={{ animationDelay: `${i * 0.05}s` }}>
                    <span className="text-sm font-medium">{d.date}</span>
                    <div className="flex gap-8 items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-500" />
                        <span className="text-sm font-semibold">{d.bookings}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-sm font-semibold">${d.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                <p className="text-lg text-muted-foreground">داده‌ای برای نمایش وجود ندارد</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

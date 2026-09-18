'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/components/locale-provider'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, Search, Plus, Filter, MoreHorizontal, Clock, User, Phone, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiFetch } from '@/lib/utils'
import { Input } from '@/components/ui/input'

interface Booking {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  start_time: string
  end_time: string
  status: string
  source: string
}

const statusConfig: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'default' | 'secondary', label: string }> = {
  pending: { variant: 'warning', label: 'در انتظار' },
  confirmed: { variant: 'success', label: 'تایید شده' },
  cancelled: { variant: 'destructive', label: 'لغو شده' },
  completed: { variant: 'default', label: 'تکمیل شده' },
}

export default function AdminBookings() {
  const { t, locale, dir } = useLocale()
  const isRtl = dir === 'rtl'
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch<Booking[]>('/admin/bookings')
      .then(setBookings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8 animate-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">
            <span className="gradient-text-primary">{t('nav.bookings')}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-lg">مدیریت تمام قرار ملاقات‌ها</p>
        </div>
        <Button className="btn-gradient rounded-xl px-6 py-6 gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          رزرو جدید
        </Button>
      </div>

      <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
        <div className="h-1.5 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
        <CardHeader className="bg-gradient-to-r from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10 pb-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
                isRtl ? "right-3" : "left-3"
              )} />
              <Input className={cn("rounded-xl border-2 py-6", isRtl ? "pr-10" : "pl-10")} placeholder="جستجوی رزروها..." />
            </div>
            <Button variant="outline" className="gap-2 rounded-xl py-6 border-2">
              <Filter className="h-4 w-4" />
              فیلتر
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-16 shimmer rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className={cn("py-4 px-6 text-sm font-semibold text-muted-foreground", isRtl ? "text-right" : "text-left")}>مشتری</th>
                    <th className={cn("py-4 px-6 text-sm font-semibold text-muted-foreground", isRtl ? "text-right" : "text-left")}>تاریخ و ساعت</th>
                    <th className={cn("py-4 px-6 text-sm font-semibold text-muted-foreground", isRtl ? "text-right" : "text-left")}>وضعیت</th>
                    <th className={cn("py-4 px-6 text-sm font-semibold text-muted-foreground", isRtl ? "text-right" : "text-left")}>منبع</th>
                    <th className={cn("py-4 px-6 text-sm font-semibold text-muted-foreground", isRtl ? "text-right" : "text-left")}>عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => {
                    const statusInfo = statusConfig[b.status] || { variant: 'default' as const, label: b.status }
                    return (
                      <tr key={b.id} className={cn(
                        "border-b last:border-0 transition-colors hover:bg-muted/30",
                        "animate-in"
                      )} style={{ animationDelay: `${i * 0.05}s` }}>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg">
                              {b.customer_name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{b.customer_name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" />
                                {b.customer_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{new Date(b.start_time).toLocaleDateString('fa-IR')}</p>
                              <p className="text-xs text-muted-foreground">{new Date(b.start_time).toLocaleTimeString('fa-IR')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <Badge variant={statusInfo.variant} className="rounded-full px-3 py-1">
                            {statusInfo.label}
                          </Badge>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">{b.source}</span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/30 hover:text-violet-600">
                              ویرایش
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600">
                              حذف
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-16 text-center">
                        <Calendar className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
                        <p className="text-lg text-muted-foreground">هیچ رزروی یافت نشد</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

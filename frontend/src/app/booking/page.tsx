'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useLocale } from '@/components/locale-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, ArrowRight, ArrowLeft, Clock, DollarSign, Sparkles, Bot, ChevronRight, ChevronLeft, Star } from 'lucide-react'
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

interface Slot {
  start: string
  end: string
  staff_id: string | null
  staff_name: string | null
  date: string
  time: string
}

const gradients = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-pink-600',
  'from-rose-500 to-red-600',
]

export default function BookingPage() {
  const { t, locale, dir } = useLocale()
  const isRtl = dir === 'rtl'
  const [step, setStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    apiFetch<Service[]>('/tenants/booking-services?tenant_id=demo')
      .then(setServices)
      .catch(() => setServices([]))
  }, [])

  const handleServiceSelect = async (service: Service) => {
    setSelectedService(service)
    setLoading(true)
    try {
      const data = await apiFetch<Slot[]>(`/bookings/slots?tenant_id=demo&service_id=${service.id}`)
      setSlots(data)
      setStep(2)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!selectedService || !selectedSlot) return
    setLoading(true)
    try {
      await apiFetch('/bookings/', {
        method: 'POST',
        body: JSON.stringify({
          service_id: selectedService.id,
          staff_id: selectedSlot.staff_id,
          start_time: selectedSlot.start,
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          notes: formData.notes,
          locale,
        }),
      })
      setSuccess(true)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/20">
        <Card className="w-full max-w-md text-center border-0 shadow-2xl rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
          <CardContent className="p-10">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-500/30">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3 text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('booking.success')}
            </h2>
            <p className="text-muted-foreground text-lg mb-8">{t('booking.success_desc')}</p>
            <div className="space-y-3">
              {selectedService && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{locale === 'fa' && selectedService.name_fa ? selectedService.name_fa : selectedService.name}</span>
                </div>
              )}
              {selectedSlot && (
                <p className="text-sm text-muted-foreground">
                  <Clock className="inline h-4 w-4 mr-1" />
                  {selectedSlot.date} - {selectedSlot.time}
                </p>
              )}
            </div>
            <Link href="/">
              <Button className="mt-8 btn-gradient w-full">
                <ArrowRight className={cn("h-4 w-4 mr-2", isRtl && "rotate-180")} />
                {t('home.cta')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/20" dir={dir}>
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <Link href="/" className="mb-8 flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg transition-transform group-hover:scale-110">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.name')}
            </span>
          </Link>

          <div className="mb-10">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: t('booking.select_service'), icon: Sparkles },
                { num: 2, label: t('booking.select_time'), icon: Clock },
                { num: 3, label: t('booking.your_info'), icon: Star },
              ].map((s, i) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold transition-all duration-500 shadow-lg',
                    step >= s.num
                      ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30 scale-110'
                      : 'bg-white dark:bg-card text-muted-foreground border-2 border-muted'
                  )}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <div className="hidden sm:block">
                    <p className={cn(
                      'text-sm font-medium transition-colors',
                      step >= s.num ? 'text-primary' : 'text-muted-foreground'
                    )}>
                      {s.label}
                    </p>
                  </div>
                  {i < 2 && (
                    <div className={cn(
                      'h-1 w-12 sm:w-20 rounded-full transition-colors duration-500',
                      step > s.num ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-muted'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
            <CardHeader className="bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-950/20 dark:to-purple-950/20 pb-6">
              <CardTitle className="text-2xl font-bold">
                <span className="gradient-text-primary">
                  {step === 1 ? t('booking.select_service') : step === 2 ? t('booking.select_time') : t('booking.your_info')}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {step === 1 && (
                <div className="grid gap-4">
                  {services.map((service, i) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="group relative flex items-center justify-between rounded-2xl border-2 p-5 text-left transition-all duration-300 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 dark:hover:border-violet-800 dark:hover:shadow-violet-900/20 card-hover"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-50/50 to-transparent dark:from-violet-950/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="relative flex items-center gap-4">
                        <div className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br shadow-lg transition-transform group-hover:scale-110',
                          gradients[i % gradients.length]
                        )}>
                          <Sparkles className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-lg font-bold group-hover:text-primary transition-colors">
                            {locale === 'fa' && service.name_fa ? service.name_fa : service.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{service.duration_minutes} دقیقه</span>
                            {service.category && (
                              <Badge variant="secondary" className="text-xs">{service.category}</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="relative text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                          ${service.price}
                        </p>
                        <p className="text-xs text-muted-foreground">{service.currency}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div>
                  {selectedService && (
                    <div className="mb-6 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold">{locale === 'fa' && selectedService.name_fa ? selectedService.name_fa : selectedService.name}</p>
                        <p className="text-sm text-muted-foreground">{selectedService.duration_minutes} دقیقه - ${selectedService.price}</p>
                      </div>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    {slots.map((slot, i) => (
                      <button
                        key={i}
                        onClick={() => { setSelectedSlot(slot); setStep(3) }}
                        className="group relative rounded-2xl border-2 p-4 text-center transition-all duration-300 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100 dark:hover:border-violet-800 card-hover"
                      >
                        <p className="text-lg font-bold group-hover:text-primary transition-colors">{slot.time}</p>
                        <p className="text-xs text-muted-foreground mt-1">{slot.staff_name || 'هر کارمند'}</p>
                      </button>
                    ))}
                    {slots.length === 0 && !loading && (
                      <div className="col-span-full text-center py-12">
                        <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">هیچ زمان خالی‌ای یافت نشد</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-5">
                  {selectedSlot && (
                    <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-4 mb-6">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                        <Clock className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">{selectedSlot.date}</p>
                        <p className="text-sm text-emerald-600 dark:text-emerald-500">ساعت {selectedSlot.time}</p>
                      </div>
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t('booking.name')}</label>
                      <Input
                        placeholder={t('booking.name')}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="rounded-xl border-2 py-6 px-4"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t('booking.email')}</label>
                      <Input
                        placeholder={t('booking.email')}
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="rounded-xl border-2 py-6 px-4"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t('booking.phone')}</label>
                      <Input
                        placeholder={t('booking.phone')}
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="rounded-xl border-2 py-6 px-4"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1.5 block">{t('booking.notes')}</label>
                      <Input
                        placeholder={t('booking.notes')}
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="rounded-xl border-2 py-6 px-4"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1 rounded-xl py-6 border-2"
                      onClick={() => setStep(2)}
                    >
                      <ChevronRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
                      {t('common.cancel')}
                    </Button>
                    <Button
                      size="lg"
                      className="flex-1 rounded-xl py-6 btn-gradient"
                      onClick={handleConfirm}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {t('common.loading')}
                        </span>
                      ) : t('booking.confirm')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Bot className="h-4 w-4 text-violet-500" />
              <span>قدرت گرفته از هوش مصنوعی - {t('app.name')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

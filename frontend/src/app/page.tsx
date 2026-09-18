'use client'

import Link from 'next/link'
import { useLocale } from '@/components/locale-provider'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Calendar, Sparkles, CreditCard, ArrowRight, Bot, Shield, Zap, Star } from 'lucide-react'

export default function HomePage() {
  const { t, dir } = useLocale()
  const isRtl = dir === 'rtl'

  return (
    <div className="min-h-screen overflow-hidden" dir={dir}>
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg transition-transform group-hover:scale-110">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.name')}
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/booking">
              <Button className="btn-gradient gap-2">
                {t('home.cta')}
                <ArrowRight className={cn("h-4 w-4", isRtl && "rotate-180")} />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-background dark:to-purple-950/20" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-violet-300/30 rounded-full blur-3xl floating" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300/30 rounded-full blur-3xl floating" style={{ animationDelay: '-3s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-pink-300/20 rounded-full blur-3xl floating" style={{ animationDelay: '-1.5s' }} />

        <div className="container relative mx-auto px-4 py-24">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 dark:bg-violet-950/30 px-5 py-2 text-sm shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-semibold">
                AI-Powered Smart Scheduling
              </span>
            </div>

            <h1 className="mb-6 text-6xl font-bold tracking-tight sm:text-7xl lg:text-8xl">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                {t('home.title')}
              </span>
            </h1>

            <p className="mb-12 text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {t('home.subtitle')}
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/booking">
                <Button size="lg" className="btn-gradient gap-3 px-8 py-6 text-lg rounded-2xl">
                  {t('home.cta')}
                  <ArrowRight className={cn("h-5 w-5", isRtl && "rotate-180")} />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="gap-3 px-8 py-6 text-lg rounded-2xl border-2">
                <Bot className="h-5 w-5" />
                {t('home.learn')}
              </Button>
            </div>

            <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-violet-500" />
                <span>Instant Booking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="gradient-text-primary">Smart Features</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Everything you need to manage appointments effortlessly
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { icon: Bot, title: 'AI Receptionist', desc: '24/7 intelligent booking assistant powered by AI that never sleeps',
                gradient: 'from-violet-500 to-purple-600', shadow: 'shadow-violet-500/25' },
              { icon: Calendar, title: 'Smart Scheduling', desc: 'Real-time availability with intelligent conflict prevention',
                gradient: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-500/25' },
              { icon: CreditCard, title: 'Built-in Payments', desc: 'Integrated payment processing with automatic webhooks',
                gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/25' },
            ].map((feature, i) => (
              <div key={i} className="group relative card-hover animate-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-white/30 dark:from-white/5 dark:to-white/0 rounded-2xl" />
                <div className="relative rounded-2xl border bg-card/50 backdrop-blur p-8 h-full">
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.shadow} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 border-t bg-gradient-to-br from-violet-50/50 to-purple-50/50 dark:from-violet-950/10 dark:to-purple-950/10">
        <div className="container mx-auto px-4 text-center">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-4xl font-bold mb-6">
              Ready to <span className="gradient-text-primary">Transform</span> Your Booking?
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Join thousands of businesses using AI-powered scheduling
            </p>
            <Link href="/booking">
              <Button size="lg" className="btn-gradient gap-3 px-10 py-7 text-lg rounded-2xl">
                <Calendar className="h-5 w-5" />
                {t('home.cta')}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t py-10 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-purple-600">
              <Calendar className="h-3 w-3 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{t('app.name')}</span>
          </div>
          <p>&copy; 2024 {t('app.name')}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}



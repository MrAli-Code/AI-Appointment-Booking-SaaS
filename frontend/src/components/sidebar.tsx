'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from './locale-provider'
import { useTheme } from './theme-provider'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Users, Briefcase, BarChart3,
  Settings, MessageSquare, LogOut, Sun, Moon, ChevronLeft, ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from './ui/button'

const menuItems = (t: (k: string) => string) => [
  { href: '/admin', icon: LayoutDashboard, label: t('nav.dashboard'), color: 'from-violet-500 to-purple-600' },
  { href: '/admin/bookings', icon: Calendar, label: t('nav.bookings'), color: 'from-blue-500 to-cyan-600' },
  { href: '/admin/staff', icon: Users, label: t('nav.staff'), color: 'from-emerald-500 to-teal-600' },
  { href: '/admin/services', icon: Briefcase, label: t('nav.services'), color: 'from-orange-500 to-pink-600' },
  { href: '/admin/analytics', icon: BarChart3, label: t('nav.analytics'), color: 'from-rose-500 to-red-600' },
  { href: '/admin/settings', icon: Settings, label: t('nav.settings'), color: 'from-slate-500 to-gray-600' },
  { href: '/admin/chat', icon: MessageSquare, label: t('nav.chat'), color: 'from-indigo-500 to-purple-600' },
]

export function Sidebar() {
  const pathname = usePathname()
  const { t, locale, setLocale, dir } = useLocale()
  const { theme, setTheme } = useTheme()
  const isRtl = dir === 'rtl'

  return (
    <aside className={cn(
      "fixed top-0 z-40 h-screen w-64 border-r bg-card shadow-xl",
      isRtl ? "right-0 border-l" : "left-0"
    )}>
      <div className="flex h-full flex-col">
        <div className="relative flex h-20 items-center gap-3 overflow-hidden border-b px-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700 shadow-lg">
            <Calendar className="h-5 w-5 text-white" />
          </div>
          <div className="relative">
            <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {t('app.name')}
            </span>
            <p className="text-[10px] font-medium text-muted-foreground tracking-wider uppercase">{t('app.tagline')}</p>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto p-4">
          {menuItems(t).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300',
                  isRtl ? 'flex-row-reverse' : ''
                )}
                style={{ direction: isRtl ? 'rtl' : 'ltr' }}
              >
                {isActive && (
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 shadow-sm" />
                )}
                <div className={cn(
                  'relative flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-300',
                  isActive
                    ? `bg-gradient-to-br ${item.color} text-white shadow-lg`
                    : 'bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground'
                )}>
                  <item.icon className={cn('h-4.5 w-4.5', isActive && 'animate-in')} />
                </div>
                <span className={cn(
                  'relative font-medium',
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground group-hover:text-foreground'
                )}>
                  {item.label}
                </span>
                {isActive && (
                  <div className={cn(
                    "absolute top-1/2 -translate-y-1/2 h-8 w-1 rounded-full bg-gradient-to-b from-violet-500 to-purple-600",
                    isRtl ? "left-0" : "right-0"
                  )} />
                )}
              </Link>
            )
          })}
        </div>

        <div className="border-t p-4 space-y-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-3 rounded-xl py-6",
              isRtl ? "flex-row-reverse" : ""
            )}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </div>
            <span>{theme === 'dark' ? t('theme.light') : t('theme.dark')}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-3 rounded-xl py-6",
              isRtl ? "flex-row-reverse" : ""
            )}
            onClick={() => setLocale(locale === 'en' ? 'fa' : 'en')}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-blue-500 text-white text-sm">
              {locale === 'en' ? 'فا' : 'EN'}
            </div>
            <span>{locale === 'en' ? t('locale.fa') : t('locale.en')}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-3 rounded-xl py-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30",
              isRtl ? "flex-row-reverse" : ""
            )}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-400 to-rose-500 text-white">
              <LogOut className="h-4 w-4" />
            </div>
            <span>{t('nav.logout')}</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}

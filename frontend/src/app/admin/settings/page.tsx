'use client'

import { useLocale } from '@/components/locale-provider'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/components/theme-provider'
import { Save, Globe, Sun, Moon, Bell, Shield, Palette, Building2, Clock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function AdminSettings() {
  const { t, locale, setLocale } = useLocale()
  const { theme, setTheme } = useTheme()

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-4xl font-bold">
          <span className="gradient-text-primary">{t('nav.settings')}</span>
        </h1>
        <p className="text-muted-foreground mt-1 text-lg">مدیریت تنظیمات کسب و کار</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-violet-500 to-purple-600" />
          <CardHeader className="bg-gradient-to-r from-violet-50/30 to-purple-50/30 dark:from-violet-950/10 dark:to-purple-950/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Globe className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-primary">{t('settings.locale')}</span>
            </CardTitle>
            <CardDescription>انتخاب زبان پیش‌فرض سیستم</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <button
                onClick={() => setLocale('en')}
                className={cn(
                  'flex-1 rounded-2xl border-2 p-6 text-center transition-all duration-300 card-hover',
                  locale === 'en'
                    ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 shadow-lg shadow-violet-100 dark:shadow-violet-900/20'
                    : 'hover:border-violet-200 hover:shadow-md'
                )}
              >
                <span className="text-4xl block mb-2">🇬🇧</span>
                <p className="font-bold text-lg">English</p>
                <p className="text-xs text-muted-foreground mt-1">زبان انگلیسی</p>
              </button>
              <button
                onClick={() => setLocale('fa')}
                className={cn(
                  'flex-1 rounded-2xl border-2 p-6 text-center transition-all duration-300 card-hover',
                  locale === 'fa'
                    ? 'border-violet-300 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 shadow-lg shadow-violet-100 dark:shadow-violet-900/20'
                    : 'hover:border-violet-200 hover:shadow-md'
                )}
              >
                <span className="text-4xl block mb-2">🇮🇷</span>
                <p className="font-bold text-lg">فارسی</p>
                <p className="text-xs text-muted-foreground mt-1">Persian (Farsi)</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-amber-500 to-orange-600" />
          <CardHeader className="bg-gradient-to-r from-amber-50/30 to-orange-50/30 dark:from-amber-950/10 dark:to-orange-950/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <Palette className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-primary">قالب</span>
            </CardTitle>
            <CardDescription>شخصی‌سازی ظاهر سیستم</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('light')}
                className={cn(
                  'flex-1 rounded-2xl border-2 p-6 text-center transition-all duration-300 card-hover',
                  theme === 'light'
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg shadow-amber-100 dark:shadow-amber-900/20'
                    : 'hover:border-amber-200 hover:shadow-md'
                )}
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
                  <Sun className="h-7 w-7 text-white" />
                </div>
                <p className="font-bold text-lg">{t('theme.light')}</p>
                <p className="text-xs text-muted-foreground mt-1">روشن</p>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={cn(
                  'flex-1 rounded-2xl border-2 p-6 text-center transition-all duration-300 card-hover',
                  theme === 'dark'
                    ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 shadow-lg shadow-amber-100 dark:shadow-amber-900/20'
                    : 'hover:border-amber-200 hover:shadow-md'
                )}
              >
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 shadow-lg">
                  <Moon className="h-7 w-7 text-white" />
                </div>
                <p className="font-bold text-lg">{t('theme.dark')}</p>
                <p className="text-xs text-muted-foreground mt-1">تاریک</p>
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-0 shadow-xl rounded-2xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-teal-500" />
          <CardHeader className="bg-gradient-to-r from-blue-50/30 to-cyan-50/30 dark:from-blue-950/10 dark:to-cyan-950/10">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="gradient-text-primary">{t('settings.business')}</span>
            </CardTitle>
            <CardDescription>به‌روزرسانی اطلاعات کسب و کار</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-violet-500" />
                  نام کسب و کار
                </label>
                <Input placeholder="نام کسب و کار شما" className="rounded-xl border-2 py-6 px-4" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  ایمیل کسب و کار
                </label>
                <Input placeholder="info@business.com" type="email" className="rounded-xl border-2 py-6 px-4" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  تلفن
                </label>
                <Input placeholder="+۱ (۵۵۵) ۰۰۰-۰۰۰۰" className="rounded-xl border-2 py-6 px-4" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  منطقه زمانی
                </label>
                <Input placeholder="Asia/Tehran" className="rounded-xl border-2 py-6 px-4" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button className="btn-gradient rounded-xl px-8 py-6 gap-2 shadow-lg">
                <Save className="h-5 w-5" />
                ذخیره تنظیمات
              </Button>
              <Button variant="outline" className="rounded-xl px-8 py-6 border-2">
                انصراف
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

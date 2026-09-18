'use client'

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { t as translate, getDir } from '@/i18n'

type Locale = 'en' | 'fa'

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (l: Locale) => void
  t: (key: string, params?: Record<string, string | number>) => string
  dir: 'ltr' | 'rtl'
}>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
  dir: 'ltr',
})

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('locale') as Locale | null
    if (stored === 'fa' || stored === 'en') {
      setLocaleState(stored)
      document.documentElement.lang = stored
      document.documentElement.dir = getDir(stored)
    }
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    document.documentElement.lang = l
    document.documentElement.dir = getDir(l)
    localStorage.setItem('locale', l)
  }, [])

  const dir = getDir(locale)

  const tFn = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(key, locale, params),
    [locale]
  )

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: tFn, dir }}>
      {children}
    </LocaleContext.Provider>
  )
}

export const useLocale = () => useContext(LocaleContext)

import en from './en.json'
import fa from './fa.json'

type TranslationValue = string | { [key: string]: TranslationValue }

const translations: Record<string, Record<string, TranslationValue>> = {
  en,
  fa,
}

export function t(key: string, locale: string = 'en', params?: Record<string, string | number>): string {
  const keys = key.split('.')
  let value: TranslationValue | undefined = translations[locale]

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = (value as Record<string, TranslationValue>)[k]
    } else {
      value = undefined
      break
    }
  }

  let result = (value as string) || key
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(`{${k}}`, String(v))
    })
  }
  return result
}

export function getDir(locale: string): 'ltr' | 'rtl' {
  return locale === 'fa' ? 'rtl' : 'ltr'
}

import type { Metadata } from 'next'
import { Inter, Vazirmatn } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { LocaleProvider } from '@/components/locale-provider'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const vazirmatn = Vazirmatn({ subsets: ['arabic'], variable: '--font-vazir' })

export const metadata: Metadata = {
  title: 'AI Booking SaaS - سامانه رزرو هوشمند',
  description: 'AI-Powered Appointment Booking Platform | پلتفرم رزرو قرار ملاقات با هوش مصنوعی',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className={`${inter.variable} ${vazirmatn.variable} font-sans`}>
        <ThemeProvider>
          <LocaleProvider>
            {children}
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

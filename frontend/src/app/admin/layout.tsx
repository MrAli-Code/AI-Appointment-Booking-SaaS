'use client'

import { Sidebar } from '@/components/sidebar'
import { useLocale } from '@/components/locale-provider'
import { cn } from '@/lib/utils'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { dir } = useLocale()
  const isRtl = dir === 'rtl'

  return (
    <div className="flex min-h-screen" dir={dir}>
      <Sidebar />
      <main className={cn("flex-1 bg-gradient-to-br from-background via-background to-primary/5 p-8",
        isRtl ? "mr-64" : "ml-64"
      )}>
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}

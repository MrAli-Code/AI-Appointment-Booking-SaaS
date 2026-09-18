import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api/v1'

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || 'Request failed')
  }

  return res.json()
}

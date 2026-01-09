import { NextRequest, NextResponse } from 'next/server'
import { clearRefreshCookie } from '@/lib/services/auth/cookies'

export async function POST(_req: NextRequest) {
  try {
    const res = clearRefreshCookie()
    // Keep body consistent
    res.headers.set('Content-Type', 'application/json')
    return res
  } catch (e: any) {
    console.error('❌ [API] Logout error:', e?.message)
    return NextResponse.json({ message: 'Logout failed' }, { status: 500 })
  }
}

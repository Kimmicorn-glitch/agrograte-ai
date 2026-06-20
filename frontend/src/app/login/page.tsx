'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-5 h-5 border-2 border-[#C1121F]/30 border-t-[#C1121F] rounded-full animate-spin" />
        <p className="text-sm text-[#495057]">Redirecting...</p>
      </div>
    </div>
  )
}

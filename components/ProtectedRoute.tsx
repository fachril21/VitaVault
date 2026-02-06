'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
    children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { ready, authenticated } = usePrivy()
    const router = useRouter()

    useEffect(() => {
        if (ready && !authenticated) {
            router.push('/')
        }
    }, [ready, authenticated, router])

    if (!ready) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        )
    }

    if (!authenticated) {
        return null
    }

    return <>{children}</>
}

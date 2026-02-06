'use client'

import { usePrivy } from '@privy-io/react-auth'
import { Bell } from 'lucide-react'

interface AppHeaderProps {
    title?: string
}

export function AppHeader({ title = 'VitalVault' }: AppHeaderProps) {
    const { user } = usePrivy()

    // Get user initials for avatar
    const email = user?.email?.address || user?.google?.email || ''
    const initials = email
        ? email.charAt(0).toUpperCase()
        : 'U'

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 pt-[env(safe-area-inset-top)]">
            <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
                {/* Left - Avatar */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
                        {initials}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-400">Welcome back</span>
                        <span className="text-sm font-semibold text-gray-900 leading-tight">{title}</span>
                    </div>
                </div>

                {/* Right - Actions */}
                <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <Bell className="h-5 w-5 text-gray-600" />
                    {/* Notification dot */}
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                </button>
            </div>
        </header>
    )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, FolderOpen, User, Scan } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/records', label: 'Records', icon: FolderOpen },
    { href: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation() {
    const pathname = usePathname()

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-200/50 pb-[env(safe-area-inset-bottom)]">
            <div className="flex items-center justify-around h-16 max-w-lg mx-auto relative">
                {/* Left Nav Items */}
                <Link
                    href="/dashboard"
                    className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive('/dashboard') ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <Home className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium">Home</span>
                </Link>

                <Link
                    href="/records"
                    className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive('/records') ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <FolderOpen className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium">Records</span>
                </Link>

                {/* Center FAB - Scan Button */}
                <Link
                    href="/scan"
                    className="absolute left-1/2 -translate-x-1/2 -top-6 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all"
                >
                    <Scan className="h-6 w-6" />
                </Link>

                {/* Spacer for FAB */}
                <div className="w-16" />

                {/* Right Nav Items */}
                <Link
                    href="/profile"
                    className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isActive('/profile') ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
                        }`}
                >
                    <User className="h-5 w-5" />
                    <span className="text-[10px] mt-1 font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    )
}

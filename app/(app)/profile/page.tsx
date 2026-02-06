'use client'

import { usePrivy } from '@privy-io/react-auth'
import { User, Wallet, Shield, Bell, LogOut, ChevronRight, Settings } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const { user, logout, exportWallet } = usePrivy()

    const email = user?.email?.address || user?.google?.email || ''
    const walletAddress = user?.wallet?.address
    const initials = email ? email.charAt(0).toUpperCase() : 'U'

    const menuItems = [
        {
            icon: User,
            label: 'Account Settings',
            href: '/profile/settings',
            color: 'text-blue-600 bg-blue-100'
        },
        {
            icon: Shield,
            label: 'Security & Privacy',
            href: '/profile/security',
            color: 'text-emerald-600 bg-emerald-100'
        },
        {
            icon: Bell,
            label: 'Notifications',
            href: '/profile/notifications',
            color: 'text-amber-600 bg-amber-100'
        },
    ]

    return (
        <div className="pb-8">
            {/* Profile Header */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                    {initials}
                </div>
                <h1 className="text-lg font-bold text-gray-900">{email || 'User'}</h1>
                <p className="text-sm text-gray-500 mt-1">VitalVault Member</p>
            </div>

            {/* Wallet Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-sm">Embedded Wallet</h3>
                        <p className="text-xs text-gray-500">Used for encryption</p>
                    </div>
                </div>
                {walletAddress && (
                    <>
                        <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                            <p className="text-xs text-gray-600 font-mono break-all">
                                {walletAddress}
                            </p>
                        </div>
                        <button
                            onClick={() => exportWallet()}
                            className="text-xs text-emerald-600 font-medium hover:underline"
                        >
                            Export Wallet →
                        </button>
                    </>
                )}
            </div>

            {/* Menu Items */}
            <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 mb-6">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 p-4 active:bg-gray-50 transition-colors"
                    >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.color}`}>
                            <item.icon className="h-4 w-4" />
                        </div>
                        <span className="flex-1 font-medium text-gray-900 text-sm">{item.label}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </Link>
                ))}
            </div>

            {/* Network Info */}
            <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Encryption Network</span>
                    <span className="text-amber-600 font-medium">datil-test</span>
                </div>
                <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-500">Storage</span>
                    <span className="text-emerald-600 font-medium">IPFS/Pinata</span>
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={logout}
                className="w-full flex items-center justify-center gap-2 text-red-600 font-medium py-3 rounded-xl bg-red-50 hover:bg-red-100 active:scale-[0.98] transition-all"
            >
                <LogOut className="h-4 w-4" />
                Sign Out
            </button>
        </div>
    )
}

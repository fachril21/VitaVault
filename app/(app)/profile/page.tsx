'use client'

import { useState } from 'react'
import { usePrivy, useCreateWallet } from '@privy-io/react-auth'
import { User, Wallet, Shield, Bell, LogOut, ChevronRight, ExternalLink, Loader2, Unplug } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
    const { user, logout, exportWallet, linkWallet, unlinkWallet } = usePrivy()
    const { createWallet } = useCreateWallet()
    const [creatingWallet, setCreatingWallet] = useState(false)
    const [disconnecting, setDisconnecting] = useState(false)

    const email = user?.email?.address || user?.google?.email || ''
    const walletAddress = user?.wallet?.address
    const initials = email ? email.charAt(0).toUpperCase() : 'U'

    const handleCreateWallet = async () => {
        setCreatingWallet(true)
        try {
            await createWallet()
            toast.success('Wallet created successfully!')
        } catch (err) {
            console.error('Failed to create wallet:', err)
            toast.error('Failed to create wallet')
        } finally {
            setCreatingWallet(false)
        }
    }

    const handleDisconnectWallet = async () => {
        if (!walletAddress) return
        setDisconnecting(true)
        try {
            await unlinkWallet(walletAddress)
            toast.success('Wallet disconnected')
        } catch (err) {
            console.error('Failed to disconnect wallet:', err)
            toast.error('Failed to disconnect wallet')
        } finally {
            setDisconnecting(false)
        }
    }

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
                        <p className="text-xs text-gray-500">
                            {walletAddress ? 'Connected · Used for encryption' : 'Not connected'}
                        </p>
                    </div>
                </div>
                {walletAddress ? (
                    <>
                        <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
                            <p className="text-xs text-gray-600 font-mono break-all">
                                {walletAddress}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => exportWallet()}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-emerald-600 font-medium py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" />
                                Export
                            </button>
                            <button
                                onClick={handleDisconnectWallet}
                                disabled={disconnecting}
                                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-red-600 font-medium py-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                            >
                                {disconnecting ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    <Unplug className="h-3 w-3" />
                                )}
                                Disconnect
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreateWallet}
                            disabled={creatingWallet}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-blue-600 font-medium py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                            {creatingWallet ? (
                                <><Loader2 className="h-3 w-3 animate-spin" /> Creating...</>
                            ) : (
                                <><Wallet className="h-3 w-3" /> Create Wallet</>
                            )}
                        </button>
                        <button
                            onClick={() => linkWallet()}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs text-purple-600 font-medium py-2 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                            <ExternalLink className="h-3 w-3" />
                            Link Existing
                        </button>
                    </div>
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

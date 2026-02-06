'use client'

import { usePrivy } from '@privy-io/react-auth'
import { User, Wallet, Shield, Bell } from 'lucide-react'

export default function SettingsPage() {
    const { user, exportWallet } = usePrivy()

    const walletAddress = user?.wallet?.address

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-500 mb-8">
                Manage your account and encryption settings
            </p>

            <div className="space-y-6">
                {/* Profile Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-gray-900">Profile</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <p className="text-gray-900">
                                {user?.email?.address || user?.google?.email || 'Not connected'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User ID
                            </label>
                            <p className="text-sm text-gray-500 font-mono">
                                {user?.id || 'Loading...'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Wallet Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Wallet className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-gray-900">Embedded Wallet</h2>
                    </div>

                    <p className="text-sm text-gray-500 mb-4">
                        Your embedded wallet is used for Lit Protocol encryption. Only you can decrypt your medical records.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Wallet Address
                            </label>
                            <p className="text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded break-all">
                                {walletAddress || 'No wallet connected'}
                            </p>
                        </div>

                        {walletAddress && (
                            <button
                                onClick={() => exportWallet()}
                                className="text-sm text-emerald-600 hover:underline"
                            >
                                Export Wallet →
                            </button>
                        )}
                    </div>
                </div>

                {/* Security Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-gray-900">Security</h2>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">Encryption Network</p>
                                <p className="text-sm text-gray-500">Lit Protocol testnet</p>
                            </div>
                            <span className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                datil-test
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-medium text-gray-900">IPFS Storage</p>
                                <p className="text-sm text-gray-500">Pinata free tier</p>
                            </div>
                            <span className="text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Notifications Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="h-5 w-5 text-emerald-600" />
                        <h2 className="font-semibold text-gray-900">Notifications</h2>
                    </div>

                    <p className="text-sm text-gray-500">
                        Coming soon: Get notified when someone accesses your shared records.
                    </p>
                </div>
            </div>
        </div>
    )
}

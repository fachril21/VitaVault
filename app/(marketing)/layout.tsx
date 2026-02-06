'use client'

import Link from 'next/link'
import { usePrivy } from '@privy-io/react-auth'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { ready, authenticated, login } = usePrivy()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top Navigation */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <nav className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl">🏥</span>
                            <span className="font-bold text-xl text-gray-900">VitalVault</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            <Link href="#features" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                                Features
                            </Link>
                            <Link href="#security" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                                Security
                            </Link>
                            <Link href="#about" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
                                About
                            </Link>
                        </div>

                        {/* CTA Button */}
                        <div className="hidden md:flex items-center gap-4">
                            {ready && authenticated ? (
                                <Link
                                    href="/dashboard"
                                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <button
                                    onClick={login}
                                    disabled={!ready}
                                    className="bg-emerald-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                >
                                    Get Started
                                </button>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden py-4 border-t border-gray-100">
                            <div className="flex flex-col gap-3">
                                <Link
                                    href="#features"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    Features
                                </Link>
                                <Link
                                    href="#security"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    Security
                                </Link>
                                <Link
                                    href="#about"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                                >
                                    About
                                </Link>
                                <div className="px-4 pt-2">
                                    {ready && authenticated ? (
                                        <Link
                                            href="/dashboard"
                                            className="block w-full text-center bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
                                        >
                                            Go to Dashboard
                                        </Link>
                                    ) : (
                                        <button
                                            onClick={login}
                                            disabled={!ready}
                                            className="w-full bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50"
                                        >
                                            Get Started
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🏥</span>
                                <span className="font-bold text-xl">VitalVault</span>
                            </div>
                            <p className="text-gray-400 text-sm max-w-md">
                                Your medical records, encrypted and decentralized.
                                Privacy-first health data management powered by cutting-edge technology.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#features" className="hover:text-white transition-colors">Features</Link></li>
                                <li><Link href="#security" className="hover:text-white transition-colors">Security</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><Link href="#about" className="hover:text-white transition-colors">About</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} VitalVault. Your data, your control.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

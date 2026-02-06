'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield, Lock, Globe, QrCode, Loader2, FileHeart, Sparkles, Check } from 'lucide-react'

export default function Home() {
    const { ready, authenticated, login } = usePrivy()
    const router = useRouter()

    useEffect(() => {
        if (ready && authenticated) {
            router.push('/dashboard')
        }
    }, [ready, authenticated, router])

    const features = [
        {
            icon: <Sparkles className="h-6 w-6 text-emerald-500" />,
            title: "AI-Powered Scanning",
            description: "Gemini AI extracts structured data from your medical documents automatically"
        },
        {
            icon: <Lock className="h-6 w-6 text-emerald-500" />,
            title: "Client-Side Encryption",
            description: "Your data is encrypted before leaving your device using Lit Protocol"
        },
        {
            icon: <Globe className="h-6 w-6 text-emerald-500" />,
            title: "Decentralized Storage",
            description: "Store encrypted records on IPFS via Pinata - you own your data"
        },
        {
            icon: <QrCode className="h-6 w-6 text-emerald-500" />,
            title: "Share via QR Code",
            description: "Securely share records with expiring access links"
        }
    ]

    const benefits = [
        "Free tier includes 100 records",
        "No credit card required",
        "HIPAA-compliant encryption",
        "Works offline as PWA"
    ]

    return (
        <>
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-emerald-50 via-white to-teal-50">
                <div className="container mx-auto px-4 py-16 md:py-24">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Logo */}
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-4xl mb-8 shadow-lg shadow-emerald-500/25">
                            <FileHeart className="h-10 w-10" />
                        </div>

                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                            Your Medical Records,{' '}
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                Secured Forever
                            </span>
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-2xl mx-auto">
                            Encrypted, Decentralized & Always Accessible
                        </p>

                        <p className="text-gray-500 mb-10 max-w-xl mx-auto">
                            Take control of your health data. Scan, encrypt, and securely store your medical records with zero-knowledge privacy.
                        </p>

                        {/* CTA Button */}
                        <button
                            onClick={login}
                            disabled={!ready}
                            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {!ready ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Loading...
                                </>
                            ) : (
                                'Get Started — Free'
                            )}
                        </button>

                        {/* Benefits */}
                        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-gray-500">
                            {benefits.map((benefit, idx) => (
                                <span key={idx} className="flex items-center gap-1.5">
                                    <Check className="h-4 w-4 text-emerald-500" />
                                    {benefit}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything You Need
                        </h2>
                        <p className="text-gray-500 max-w-2xl mx-auto">
                            Powerful features to keep your health records secure, accessible, and under your control.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gray-50 rounded-2xl p-6 hover:bg-white hover:shadow-lg hover:shadow-gray-100 transition-all border border-transparent hover:border-gray-100"
                            >
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-100 mb-4">
                                    {feature.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-sm text-gray-500">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Security Section */}
            <section id="security" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <Shield className="h-12 w-12 text-emerald-500 mx-auto mb-6" />
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Privacy-First Architecture
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
                            Built with privacy-first technologies. Your data is encrypted on your device before it ever leaves,
                            and stored on decentralized networks where only you hold the keys.
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 text-sm">
                            {['Lit Protocol', 'IPFS/Pinata', 'Gemini AI', 'End-to-End Encryption'].map((tech, idx) => (
                                <span key={idx} className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                                    {tech}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section id="about" className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Ready to Take Control?
                    </h2>
                    <p className="text-emerald-100 mb-8 max-w-xl mx-auto">
                        Join thousands of users who trust VitalVault with their most sensitive health data.
                    </p>
                    <button
                        onClick={login}
                        disabled={!ready}
                        className="inline-flex items-center justify-center gap-2 bg-white text-emerald-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-50 transition-all disabled:opacity-50"
                    >
                        {!ready ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            'Start Free Today'
                        )}
                    </button>
                </div>
            </section>
        </>
    )
}

'use client'

import { usePrivy } from '@privy-io/react-auth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Shield, Lock, Globe, QrCode, Loader2 } from 'lucide-react'

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
      icon: <Shield className="h-6 w-6 text-emerald-500" />,
      title: "AI-Powered Scanning",
      description: "Gemini AI extracts structured data from your medical documents"
    },
    {
      icon: <Lock className="h-6 w-6 text-emerald-500" />,
      title: "Client-Side Encryption",
      description: "Your data is encrypted before leaving your device"
    },
    {
      icon: <Globe className="h-6 w-6 text-emerald-500" />,
      title: "Decentralized Storage",
      description: "Store encrypted records on IPFS - you own your data"
    },
    {
      icon: <QrCode className="h-6 w-6 text-emerald-500" />,
      title: "Share via QR Code",
      description: "Securely share records with expiring access links"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-500 text-white text-4xl mb-8 shadow-lg">
            🏥
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
            VitalVault
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Your Medical Records, <span className="text-emerald-600 font-semibold">Encrypted</span> & <span className="text-emerald-600 font-semibold">Decentralized</span>
          </p>

          <p className="text-gray-500 mb-10 max-w-xl mx-auto">
            Take control of your health data. Scan, encrypt, and securely store your medical records with zero-knowledge privacy.
          </p>

          {/* CTA Button */}
          <button
            onClick={login}
            disabled={!ready}
            className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-emerald-700 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
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

          <p className="text-sm text-gray-400 mt-4">
            No credit card required. Free tier includes 100 records.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-emerald-50 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-400 mb-4">Built with privacy-first technologies</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Lit Protocol
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              IPFS/Pinata
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              Gemini AI
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
              End-to-End Encryption
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-400">
        <p>© 2024 VitalVault. Your data, your control.</p>
      </footer>
    </div>
  )
}

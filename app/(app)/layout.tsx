import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AppHeader } from '@/components/app/AppHeader'
import { BottomNavigation } from '@/components/app/BottomNavigation'
import type { Metadata, Viewport } from 'next'

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
}

export const metadata: Metadata = {
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'VitalVault',
    },
    formatDetection: {
        telephone: false,
    },
}

export default function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ProtectedRoute>
            <div className="min-h-screen min-h-[100dvh] bg-gray-50">
                {/* Fixed Header */}
                <AppHeader />

                {/* Scrollable Main Content */}
                <main
                    className="min-h-screen pt-[calc(3.5rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))]"
                >
                    <div className="max-w-lg mx-auto px-4 py-4">
                        {children}
                    </div>
                </main>

                {/* Fixed Bottom Navigation */}
                <BottomNavigation />
            </div>
        </ProtectedRoute>
    )
}

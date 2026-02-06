'use client'

import { PrivyProvider } from '@privy-io/react-auth'

interface ProvidersProps {
    children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <PrivyProvider
            appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
            config={{
                loginMethods: ['google', 'email'],
                appearance: {
                    theme: 'light',
                    accentColor: '#10b981',
                    logo: '/logo.png',
                },
            }}
        >
            {children}
        </PrivyProvider>
    )
}

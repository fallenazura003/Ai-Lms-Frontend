// components/AppWrapper.tsx
'use client';

import { ReactNode } from 'react';
import { useAutoLogout } from '@/hooks/useAutoLogout';
import { Toaster } from 'sonner';

export default function AppWrapper({ children }: { children: ReactNode }) {
    useAutoLogout();

    return (
        <>
            {children}
            <Toaster position="top-right" richColors />
        </>
    );
}

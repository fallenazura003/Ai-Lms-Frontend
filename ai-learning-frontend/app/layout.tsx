// app/layout.tsx
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/store/auth';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'AI Learning Platform',
    description: 'Nền tảng học tập hiện đại với AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <AuthProvider>
            {children}
            <Toaster />
        </AuthProvider>
        </body>
        </html>
    );
}

// app/layout.tsx
import '@/styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/store/auth';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
            <div className="flex flex-col min-h-screen">
                {/*<Header />*/}
                <main className="flex-grow">
                    {children}
                </main>
                {/*<Footer />*/}
            </div>
        </AuthProvider>
        </body>
        </html>
    );
}

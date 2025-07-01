'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main className="flex-1 px-4 md:px-8 lg:px-20 py-8">
                <div className="max-w-5xl mx-auto w-full">
                    {children}
                </div>
            </main>

            {/*<Footer />*/}
        </div>
    );
}

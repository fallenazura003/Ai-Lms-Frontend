'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main >
                <div >
                    {children}
                </div>
            </main>

            {/*<Footer />*/}
        </div>
    );
}

// app/(dashboard)/layout.tsx
'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Sidebar from "@/components/SideBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 px-4 md:px-8 lg:px-16 pt-6 pb-24 overflow-y-auto">
                    {children}
                </main>
            </div>
            <Footer />
        </div>
    );
}

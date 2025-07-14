'use client';

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {Toaster} from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main >
                <div >
                    {children}
                    <Toaster position="top-right" richColors />
                </div>
            </main>

            {/*<Footer />*/}
        </div>
    );
}

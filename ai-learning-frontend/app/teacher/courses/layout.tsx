'use client';

import Header from "@/components/Header";
import {Toaster} from "sonner";
import AppWrapper from "@/components/AppWrapper";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Header />

            <main >
                <div >
                    <AppWrapper>{children}</AppWrapper>
                    <Toaster position="top-right" richColors />
                </div>
            </main>

            {/*<Footer />*/}
        </div>
    );
}

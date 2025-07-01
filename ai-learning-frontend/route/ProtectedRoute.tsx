'use client';

import { useAuth } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ProtectedRoute({
                                           children,
                                           allowedRoles,
                                       }: {
    children: React.ReactNode;
    allowedRoles: string[];
}) {
    const { token, role, status } = useAuth();
    const router = useRouter();
    const [isReady, setIsReady] = useState(false); // chờ zustand khởi tạo

    useEffect(() => {
        // Chờ 1 tick để đảm bảo zustand đã load state từ localStorage/sessionStorage
        const timeout = setTimeout(() => setIsReady(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (isReady) {
            if (!token || !allowedRoles.includes(role || '') || status !== 'ACTIVE') {
                router.replace('/');
            }
        }
    }, [isReady, token, role, status]);

    // Show loading hoặc null trong lúc đợi xác minh
    if (!isReady) return <div>Loading...</div>;

    return <>{children}</>;
}

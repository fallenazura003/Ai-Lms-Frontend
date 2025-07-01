// app/admin/layout.tsx
'use client'; // Đảm bảo component này là Client Component

import { ReactNode } from 'react';
import ProtectedRoute from '@/route/ProtectedRoute'; // Đảm bảo đường dẫn đúng
import Sidebar from '@/components/SideBar'; // Đảm bảo đường dẫn đúng
import { useAuth } from '@/store/auth'; // Import useAuth từ context của bạn

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { role } = useAuth(); // Lấy role từ AuthContext

    // ProtectedRoute sẽ kiểm tra role.
    // Sidebar cũng sẽ tự động ẩn/hiện dựa trên role bên trong nó.
    return (
        <ProtectedRoute allowedRoles={['ADMIN']}>
            <div className="flex flex-1">
                {/* Sidebar sẽ hiển thị dựa trên role được truyền vào (hoặc tự lấy trong Sidebar) */}
                {/* Ở đây, Sidebar sẽ lấy role từ useAuth() của chính nó */}

                <main className="flex-1 p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    );
}
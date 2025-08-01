'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function TopUpCancelPage() {
    const router = useRouter();

    useEffect(() => {
        toast.error('Giao dịch đã bị hủy.');

        const timer = setTimeout(() => {
            const preTransactionUrl = localStorage.getItem('pre_transaction_url');
            // ✅ Lấy URL đã lưu và chuyển hướng
            if (preTransactionUrl) {
                router.push(preTransactionUrl);
                localStorage.removeItem('pre_transaction_url'); // ✅ Xóa URL đã lưu
            } else {
                router.push('/'); // Chuyển hướng về trang chủ nếu không tìm thấy URL
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-red-50">
            <h1 className="text-4xl font-bold text-red-700">Giao dịch đã bị hủy</h1>
            <p className="mt-4 text-lg text-gray-600">Vui lòng thử lại.</p>
        </div>
    );
}
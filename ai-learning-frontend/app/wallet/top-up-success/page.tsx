'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useBalanceStore } from '@/store/balance';

export default function TopUpSuccessPage() {
    const router = useRouter();
    const fetchBalance = useBalanceStore((state) => state.fetchBalance);

    useEffect(() => {
        toast.success('Nạp tiền thành công! Số dư ví của bạn đang được cập nhật.');
        fetchBalance();

        const timer = setTimeout(() => {
            const preTransactionUrl = localStorage.getItem('pre_transaction_url');
            // ✅ Lấy URL đã lưu và chuyển hướng
            if (preTransactionUrl) {
                router.push(preTransactionUrl);
                localStorage.removeItem('pre_transaction_url'); // ✅ Xóa URL đã lưu
            } else {
                // Nếu không có URL đã lưu, chuyển hướng đến một trang mặc định (ví dụ: trang chủ)
                router.push('/');
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, [router, fetchBalance]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-green-50">
            <h1 className="text-4xl font-bold text-green-700">Nạp tiền thành công!</h1>
            <p className="mt-4 text-lg text-gray-600">Bạn sẽ được chuyển hướng sau ít phút.</p>
        </div>
    );
}
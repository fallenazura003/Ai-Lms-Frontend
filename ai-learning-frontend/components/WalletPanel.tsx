'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dispatch, SetStateAction, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import { toast } from 'sonner';

interface WalletPanelProps {
    open: boolean;
    onOpenChange: Dispatch<SetStateAction<boolean>>;
    onSuccess: (newBalance: number) => void;
}

export function WalletPanel({ open, onOpenChange, onSuccess }: WalletPanelProps) {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const handleTopUp = async () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('pre_transaction_url', window.location.pathname);
        }
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        setLoading(true);
        try {
            // Gửi yêu cầu nạp tiền đến backend
            const res = await api.post('/wallet/top-up', {
                amount: numericAmount,
            });

            // Backend sẽ trả về một URL Checkout Session từ Stripe
            if (res.data.data) {
                // Chuyển hướng người dùng đến trang thanh toán của Stripe
                window.location.href = res.data.data;
            } else {
                toast.error('Không thể tạo yêu cầu thanh toán. Vui lòng thử lại.');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Nạp tiền thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95%] sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Nạp tiền vào ví</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full"
                    />
                    <Button onClick={handleTopUp} disabled={loading} className="w-full">
                        {loading ? 'Đang xử lý...' : 'Nạp tiền bằng Stripe'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
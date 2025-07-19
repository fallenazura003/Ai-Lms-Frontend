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
        const numericAmount = parseFloat(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            toast.error('Vui lòng nhập số tiền hợp lệ.');
            return;
        }

        setLoading(true);
        try {
            const res = await api.post('/wallet/top-up', { amount: numericAmount });

            toast.success(res.data.message || 'Nạp tiền thành công');

            if (res.data.data !== undefined) {
                onSuccess(res.data.data); // truyền balance mới
            }

            onOpenChange(false); // đóng dialog sau toast
            setAmount('');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Nạp tiền thất bại');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95%] sm:max-w-lg"> {/* ✅ Điều chỉnh max-width cho mobile nhỏ */}
                <DialogHeader>
                    <DialogTitle>Nạp tiền vào ví</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <Input
                        type="number"
                        placeholder="Nhập số tiền"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full" // ✅ Đảm bảo input chiếm đủ chiều rộng
                    />
                    <Button onClick={handleTopUp} disabled={loading} className="w-full"> {/* ✅ Đảm bảo nút chiếm đủ chiều rộng */}
                        {loading ? 'Đang xử lý...' : 'Xác nhận'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
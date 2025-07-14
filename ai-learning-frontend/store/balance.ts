'use client';

import { create } from 'zustand';

interface BalanceState {
    balance: number | null;
    setBalance: (balance: number) => void;
    fetchBalance: () => Promise<void>;
}

import { getBalance } from '@/lib/wallet';

export const useBalanceStore = create<BalanceState>((set) => {
    const fetchBalance = async () => {
        try {
            const res = await getBalance();
            set({ balance: res.data });
        } catch (error) {
            console.error('Lỗi khi lấy số dư:', error);
        }
    };

    return {
        balance: null,
        setBalance: (value) => set({ balance: value }),
        fetchBalance,
    };
});


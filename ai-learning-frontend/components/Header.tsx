// src/components/Header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { WalletPanel } from '@/components/WalletPanel';
import { Bell } from 'lucide-react';
import { useEffect, useState } from 'react'; // Import useCallback
import { useBalanceStore } from '@/store/balance';

export default function Header() {
    const router = useRouter();
    const { logout, role, user } = useAuth();
    const { balance, setBalance, fetchBalance } = useBalanceStore((state) => state);
    const [walletOpen, setWalletOpen] = useState(false);

    useEffect(() => {
        if (role === 'STUDENT' || role === 'TEACHER') {
            fetchBalance(); // ✅ Không tạo lại liên tục nữa
        }
    }, [role]);

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const handleLogoClick = () => {
        if (role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'TEACHER') router.push('/teacher/home');
        else if (role === 'STUDENT') router.push('/student/home');
        else router.push('/');
    };

    return (
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md border-b border-gray-200 z-10">
            {/* Logo */}
            <div
                className="flex items-center space-x-2 cursor-pointer hover:text-blue-700"
                onClick={handleLogoClick}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-8 h-8 text-blue-600"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.5l9-7.5 9 7.5V21H3V13.5zM12 4.5l-9 7.5V3h18v8.5l-9-7.5zM12 18a3 3 0 100-6 3 3 0 000 6z"
                    />
                </svg>
                <h1 className="text-xl font-bold text-blue-600">AI Learning</h1>
            </div>

            {/* Search */}
            <SearchBar />

            {/* User Info */}
            <div className="flex items-center gap-4">
                {role ? (
                    <>
                        <Bell className="w-5 h-5 text-gray-600 hover:text-blue-600 cursor-pointer" />

                        {(role === 'STUDENT' || role === 'TEACHER') && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-800">👤 {user?.name || 'Người dùng'}</span>

                                <span className="text-sm font-semibold text-green-600">
                                    💰 {balance !== null ? `${balance.toLocaleString()}đ` : '...'}
                                </span>

                                <Button variant="outline" onClick={() => setWalletOpen(true)}>
                                    Nạp tiền
                                </Button>
                            </div>
                        )}

                        <Button onClick={handleLogout} variant="destructive">
                            Đăng xuất
                        </Button>

                        <WalletPanel
                            open={walletOpen}
                            onOpenChange={setWalletOpen}
                            onSuccess={(newBalance) => {
                                setBalance(newBalance); // ✅ update trực tiếp số dư từ WalletPanel
                                // Nếu bạn có một global state cho user balance, hãy cập nhật nó ở đây
                            }}
                        />
                    </>
                ) : (
                    <>
                        <Link href="/login" passHref>
                            <Button variant="outline">Đăng nhập</Button>
                        </Link>
                        <Link href="/register" passHref>
                            <Button>Đăng ký</Button>
                        </Link>
                    </>
                )}
            </div>
        </header>
    );
}
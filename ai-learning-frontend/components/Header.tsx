// src/components/Header.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SearchBar from '@/components/SearchBar';
import { WalletPanel } from '@/components/WalletPanel';
import { useEffect, useState } from 'react';
import { useBalanceStore } from '@/store/balance';
import NotificationBell from '@/components/NotificationBell';

// ❗️ Icons cho mobile menu
import { Menu, DollarSign, User } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
    const router = useRouter();
    const { logout, role, user } = useAuth();
    const { balance, setBalance, fetchBalance } = useBalanceStore((state) => state);
    const [walletOpen, setWalletOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ❗️ State cho mobile menu

    useEffect(() => {
        if (role === 'STUDENT' || role === 'TEACHER') {
            fetchBalance();
        }
    }, [role]);

    const handleLogout = () => {
        logout();
        router.push('/');
        setIsMobileMenuOpen(false); // Đóng menu sau khi đăng xuất
    };

    const handleLogoClick = () => {
        if (role === 'ADMIN') router.push('/admin/dashboard');
        else if (role === 'TEACHER') router.push('/teacher/home');
        else if (role === 'STUDENT') router.push('/student/home');
        else router.push('/');
        setIsMobileMenuOpen(false); // Đóng menu khi click logo
    };

    return (
        <header className="flex justify-between items-center px-4 py-3 bg-white shadow-md border-b border-gray-200 z-50 sticky top-0">
            {/* Logo - Cố định kích thước trên mobile */}
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
                    className="w-7 h-7 text-blue-600 md:w-8 md:h-8" // Nhỏ hơn trên mobile
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 13.5l9-7.5 9 7.5V21H3V13.5zM12 4.5l-9 7.5V3h18v8.5l-9-7.5zM12 18a3 3 0 100-6 3 3 0 000 6z"
                    />
                </svg>
                <h1 className="text-lg font-bold text-blue-600 md:text-xl">AI Learning</h1> {/* Nhỏ hơn trên mobile */}
            </div>

            {/* Search Bar - Ẩn trên mobile, hiển thị trên md */}
            <div className="hidden md:block flex-grow mx-4"> {/* `flex-grow` để nó chiếm không gian giữa */}
                <SearchBar />
            </div>

            {/* User Info & Buttons for Desktop */}
            <div className="hidden md:flex items-center gap-4">
                {role ? (
                    <>
                        <NotificationBell email={user?.email || ''} />
                        <span className="text-sm text-gray-800">👤 {user?.name || 'Người dùng'}</span>

                        {(role === 'STUDENT' || role === 'TEACHER') && (
                            <div className="flex items-center space-x-2">
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

            {/* Mobile Menu (Hamburger Icon) */}
            <div className="md:hidden flex items-center gap-2">
                {role && <NotificationBell email={user?.email || ''} />} {/* Bell luôn hiển thị trên mobile */}
                <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle navigation menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                        <SheetHeader>
                            <SheetTitle className="text-left">Menu</SheetTitle>
                            {/* <SheetDescription>
                                Điều hướng và tùy chọn tài khoản.
                            </SheetDescription> */}
                        </SheetHeader>
                        <div className="flex flex-col gap-4 mt-6">
                            {role ? (
                                <>
                                    <div className="flex items-center gap-2 border-b pb-4">
                                        <User className="h-5 w-5 text-gray-600" />
                                        <span className="font-semibold text-gray-800">{user?.name || 'Người dùng'}</span>
                                    </div>

                                    {(role === 'STUDENT' || role === 'TEACHER') && (
                                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                                            <DollarSign className="h-5 w-5" />
                                            <span>{balance !== null ? `${balance.toLocaleString()}đ` : '...'}</span>
                                            <Button variant="outline" size="sm" onClick={() => {
                                                setWalletOpen(true);
                                                setIsMobileMenuOpen(false); // Đóng menu sau khi click Nạp tiền
                                            }} className="ml-auto">
                                                Nạp tiền
                                            </Button>
                                        </div>
                                    )}

                                    {/* Mobile Search Bar - hiển thị trong menu */}
                                    <div className="w-full">
                                        <SearchBar />
                                    </div>

                                    {/* Các nút điều hướng chính */}
                                    {role === 'ADMIN' && (
                                        <>
                                            <Link href="/admin/dashboard" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Tổng quan</Button></Link>
                                            <Link href="/admin/users" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Quản lý người dùng</Button></Link>
                                            <Link href="/admin/courses" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Quản lý khóa học</Button></Link>
                                            <Link href="/admin/logs" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Quản lý log</Button></Link>
                                        </>
                                    )}
                                    {role === 'TEACHER' && (
                                        <>
                                            <Link href="/teacher/dashboard" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Tổng quan bán hàng</Button></Link>
                                            <Link href="/teacher/home" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Quản lý khóa học</Button></Link>
                                        </>
                                    )}
                                    {role === 'STUDENT' && (
                                        <>
                                            <Link href="/student/home" passHref><Button variant="ghost" className="w-full justify-start" onClick={() => setIsMobileMenuOpen(false)}>Trang học của tôi</Button></Link>
                                        </>
                                    )}

                                    <Button onClick={handleLogout} variant="destructive" className="w-full">
                                        Đăng xuất
                                    </Button>
                                </>
                            ) : (
                                // Chưa đăng nhập
                                <div className="flex flex-col gap-2">
                                    <Link href="/login" passHref>
                                        <Button variant="outline" className="w-full" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Button>
                                    </Link>
                                    <Link href="/register" passHref>
                                        <Button className="w-full" onClick={() => setIsMobileMenuOpen(false)}>Đăng ký</Button>
                                    </Link>
                                    <div className="w-full mt-4">
                                        <SearchBar /> {/* SearchBar cho người dùng chưa đăng nhập trên mobile */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            <WalletPanel
                open={walletOpen}
                onOpenChange={setWalletOpen}
                onSuccess={(newBalance) => {
                    setBalance(newBalance);
                }}
            />
        </header>
    );
}
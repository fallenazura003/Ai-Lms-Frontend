'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Header() {
    const router = useRouter();
    const { logout, role } = useAuth();

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
        <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md border-b border-gray-200 z-10"> {/* Thêm z-10 */}
            {/* Logo */}
            <div
                className="flex items-center space-x-2 cursor-pointer transition-colors duration-200 hover:text-blue-700"
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
                <h1 className="text-xl font-bold text-blue-600">
                    AI Learning
                </h1>
            </div>

            {/* User Info / Auth Buttons */}
            <div className="flex items-center gap-3">
                {role ? (
                    <>
                        <span className="text-base font-semibold text-blue-700 border-l pl-3 border-gray-300">
                            {role === 'ADMIN' ? 'Quản trị viên' : role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}
                        </span>
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
        </header>
    );
}
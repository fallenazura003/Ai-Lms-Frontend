// 'use client'; // ✅ Giữ nguyên directive này

import Link from 'next/link';
import { useAuth } from '@/store/auth';
import {
    HomeIcon,
    BookOpenIcon,
    ShieldCheckIcon,
    ChartBarIcon, // Ví dụ icon cho admin dashboard / teacher dashboard
    UserGroupIcon, // Ví dụ icon cho quản lý user
    Cog6ToothIcon // Ví dụ icon cho cài đặt
} from '@heroicons/react/24/outline';
import { LogsIcon } from "lucide-react"; // Đảm bảo bạn đã cài lucide-react nếu dùng LogsIcon

export default function Sidebar() {
    const { role } = useAuth();

    // Các mục menu cho từng vai trò
    const menuItems = {
        STUDENT: [
            { href: '/student/home', icon: BookOpenIcon, label: 'Trang học của tôi' },
            // Thêm các mục khác cho học sinh
        ],
        TEACHER: [
            // ✅ Bổ sung trang Teacher Dashboard
            { href: '/teacher/dashboard', icon: ChartBarIcon, label: 'Tổng quan bán hàng' },
            { href: '/teacher/home', icon: ShieldCheckIcon, label: 'Quản lý khóa học' },
            // Thêm các mục khác cho giáo viên
        ],
        ADMIN: [
            { href: '/admin/dashboard', icon: ChartBarIcon, label: 'Tổng quan' },
            { href: '/admin/users', icon: UserGroupIcon, label: 'Quản lý người dùng' },
            { href: '/admin/courses', icon: BookOpenIcon, label: 'Quản lý khóa học' },
            { href: '/admin/logs', icon: LogsIcon, label: 'Quản lý log' }
            // Thêm các mục khác cho admin
        ],
    };

    const currentMenuItems = role ? menuItems[role as keyof typeof menuItems] : [];

    if (!role) {
        return null; // Không hiển thị sidebar nếu chưa đăng nhập
    }

    return (
        <aside className="w-64 bg-white shadow-lg p-6 flex flex-col border-r border-gray-200">
            <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Menu</h2>
            <nav className="flex-grow">
                <ul className="space-y-3">
                    {currentMenuItems.map((item, index) => (
                        <li key={index}>
                            <Link href={item.href} className="flex items-center gap-3 text-lg text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-3 px-4 rounded-lg hover:bg-blue-50 group">
                                <item.icon className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors duration-200" />
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            {/* Có thể thêm các mục footer của sidebar ở đây nếu cần */}
            <div className="mt-auto pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                    Logged in as: <span className="font-semibold text-blue-600">{role}</span>
                </p>
            </div>
        </aside>
    );
}
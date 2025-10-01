'use client';

import Link from 'next/link';
import { useAuth } from '@/store/auth';
import {
    BookOpenIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    UserGroupIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import { LogsIcon, ChevronsLeft, ChevronsRight } from 'lucide-react';

import { useState } from 'react';
import clsx from 'clsx';

export default function Sidebar() {
    const { role } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const toggleSidebar = () => setCollapsed(!collapsed);

    const menuItems = {
        STUDENT: [
            { href: '/student/home', icon: BookOpenIcon, label: 'Trang học của tôi' },
            { href: '/student/profile', icon: UserIcon, label: 'Hồ sơ cá nhân' }
        ],
        TEACHER: [
            { href: '/teacher/dashboard', icon: ChartBarIcon, label: 'Tổng quan bán hàng' },
            { href: '/teacher/home', icon: ShieldCheckIcon, label: 'Quản lý khóa học' },
            { href: '/teacher/profile', icon: UserIcon, label: 'Hồ sơ cá nhân' }
        ],
        ADMIN: [
            { href: '/admin/dashboard', icon: ChartBarIcon, label: 'Tổng quan' },
            { href: '/admin/users', icon: UserGroupIcon, label: 'Quản lý người dùng' },
            { href: '/admin/courses', icon: BookOpenIcon, label: 'Quản lý khóa học' },
            { href: '/admin/logs', icon: LogsIcon, label: 'Quản lý log' },
            { href: '/admin/profile', icon:UserIcon , label: 'Hồ sơ cá nhân' }
        ],
    };

    const currentMenuItems = role ? menuItems[role as keyof typeof menuItems] : [];

    if (!role) return null;

    return (
        <aside
            className={clsx(
                "hidden md:flex flex-col bg-white shadow-lg p-4 border-r border-gray-200 transition-all duration-300",
                collapsed ? "w-20" : "w-64",
                "h-screen sticky top-0" // ✅ Thêm sticky top-0 và h-screen để sidebar luôn hiển thị và không bị cuộn với nội dung chính
            )}
        >
            <div className="flex items-center justify-between mb-6">
                {!collapsed ? (
                    <h2 className="text-2xl font-bold text-blue-700 text-center w-full">Menu</h2>
                ) : (
                    // Khi collapsed, bạn có thể muốn ẩn hoàn toàn hoặc chỉ hiển thị icon logo nhỏ nếu có
                    <span className="text-blue-700 text-xl font-bold"></span>
                )}
                <button
                    onClick={toggleSidebar}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
                >
                    {collapsed ? (
                        <ChevronsRight className="w-5 h-5" />
                    ) : (
                        <ChevronsLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            {/* Điều chỉnh chính ở đây: Loại bỏ flex-grow khỏi nav */}
            <nav>
                <ul className="space-y-2">
                    {currentMenuItems.map((item, index) => (
                        <li key={index}>
                            <Link
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-3 text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium py-2 px-3 rounded-lg hover:bg-blue-50 group",
                                    collapsed && "justify-center"
                                )}
                            >
                                <item.icon className="w-6 h-6 text-gray-500 group-hover:text-blue-600" />
                                {!collapsed && <span>{item.label}</span>}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Phần footer của sidebar nên nằm ngay dưới nav, không "đẩy" xuống cuối trang nếu nội dung ít */}
            {/* Nếu bạn muốn nó vẫn ở cuối màn hình (ví dụ, có các nút đăng xuất), thì giữ mt-auto và đặt sidebar trong layout có flex-col h-screen */}
            {/* Đối với trường hợp chỉ có vài link, tốt nhất là đặt nó ngay dưới nav để tránh khoảng trống lớn. */}
            {/* Tôi sẽ giữ mt-auto và giả định rằng sidebar này nằm trong một layout có chiều cao toàn màn hình */}
            <div className="mt-auto pt-4 border-t border-gray-200">
                {!collapsed ? (
                    <p className="text-sm text-gray-500 text-center">
                        Đăng nhập với: <span className="font-semibold text-blue-600">{role}</span>
                    </p>
                ) : (
                    <p className="text-xs text-gray-400 text-center">{role}</p>
                )}
            </div>
        </aside>
    );
}
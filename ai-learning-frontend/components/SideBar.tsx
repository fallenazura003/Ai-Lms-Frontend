'use client';

import Link from 'next/link';
import { useAuth } from '@/store/auth';
import {
    BookOpenIcon,
    ShieldCheckIcon,
    ChartBarIcon,
    UserGroupIcon,
} from '@heroicons/react/24/outline';
import { LogsIcon, ChevronsLeft, ChevronsRight } from 'lucide-react'; // ❗️ Thêm icon toggle

import { useState } from 'react';
import clsx from 'clsx';

export default function Sidebar() {
    const { role } = useAuth();
    const [collapsed, setCollapsed] = useState(false); // ✅ Trạng thái thu gọn sidebar

    const toggleSidebar = () => setCollapsed(!collapsed);

    const menuItems = {
        STUDENT: [
            { href: '/student/home', icon: BookOpenIcon, label: 'Trang học của tôi' },
        ],
        TEACHER: [
            { href: '/teacher/dashboard', icon: ChartBarIcon, label: 'Tổng quan bán hàng' },
            { href: '/teacher/home', icon: ShieldCheckIcon, label: 'Quản lý khóa học' },
        ],
        ADMIN: [
            { href: '/admin/dashboard', icon: ChartBarIcon, label: 'Tổng quan' },
            { href: '/admin/users', icon: UserGroupIcon, label: 'Quản lý người dùng' },
            { href: '/admin/courses', icon: BookOpenIcon, label: 'Quản lý khóa học' },
            { href: '/admin/logs', icon: LogsIcon, label: 'Quản lý log' }
        ],
    };

    const currentMenuItems = role ? menuItems[role as keyof typeof menuItems] : [];

    if (!role) return null;

    return (
        <aside
            className={clsx(
                "bg-white shadow-lg p-4 flex flex-col border-r border-gray-200 transition-all duration-300",
                collapsed ? "w-20" : "w-64"
            )}
        >
            <div className="flex items-center justify-between mb-6">
                {!collapsed ? (
                    <h2 className="text-2xl font-bold text-blue-700 text-center w-full">Menu</h2>
                ) : (
                    <span className="text-blue-700 text-xl font-bold"></span>
                )}
                <button
                    onClick={toggleSidebar}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                    {collapsed ? (
                        <ChevronsRight className="w-5 h-5" />
                    ) : (
                        <ChevronsLeft className="w-5 h-5" />
                    )}
                </button>
            </div>

            <nav className="flex-grow">
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

            {/* Footer */}
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

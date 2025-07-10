'use client';

import { useState, useEffect } from 'react'; // Thêm useEffect
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();
    // Khởi tạo state để lưu vai trò và trạng thái xác thực
    const [userRole, setUserRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true); // Mới khởi tạo là true, chờ đọc localStorage

    useEffect(() => {
        // Đọc thông tin từ localStorage khi component mount
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const status = localStorage.getItem('status');

        if (token && role && status === 'ACTIVE') {
            setIsAuthenticated(true);
            setUserRole(role as 'STUDENT' | 'TEACHER' | 'ADMIN');
        } else {
            setIsAuthenticated(false);
            setUserRole(null); // Anonymous hoặc không hợp lệ
        }
        setIsLoadingAuth(false); // Đã cố gắng tải từ localStorage xong
    }, []); // Chạy một lần khi component mount

    // Logic hiển thị Search Bar:
    // Hiển thị nếu đang tải auth (có thể render một skeleton)
    // HOẶC (nếu đã tải xong auth và):
    //    - Chưa xác thực (Anonymous, tức là !isAuthenticated)
    //    - HOẶC Đã xác thực VÀ user là STUDENT (userRole === 'STUDENT')
    const shouldShowSearchBar = !isLoadingAuth && (
        !isAuthenticated || (userRole === 'STUDENT')
    );

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Nếu đang tải Auth, hiển thị skeleton
    if (isLoadingAuth) {
        return (
            <div className="flex items-center gap-2">
                <div className="w-full max-w-sm h-10 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="w-20 h-10 bg-gray-200 rounded-md animate-pulse"></div>
            </div>
        );
    }

    // Nếu không nên hiển thị SearchBar, trả về null
    if (!shouldShowSearchBar) {
        return null;
    }

    return (
        <div className="flex items-center gap-2">
            <Input
                placeholder="Tìm kiếm khóa học..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full max-w-sm"
            />
            <Button onClick={handleSearch} variant="default">
                <Search className="w-4 h-4 mr-1" />
                Tìm
            </Button>
        </div>
    );
}
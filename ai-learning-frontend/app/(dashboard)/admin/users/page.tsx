'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api'; // ✅ Đã sửa lỗi đường dẫn tương đối
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/Pagination'; // ✅ Đã sửa lỗi đường dẫn tương đối
import { Input } from '@/components/ui/input';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'STUDENT' | 'TEACHER';
    status: 'ACTIVE' | 'BLOCKED';
    createdAt: string;
}

interface PageResponse<T> {
    content: T[];
    number: number;
    totalPages: number;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); // State cho từ khóa tìm kiếm

    // Sử dụng useCallback để hàm này chỉ được tạo lại khi dependencies thay đổi
    const fetchUsers = useCallback(async (page = 0, search = searchTerm) => {
        try {
            const url = `/admin/users?page=${page}&size=8${search ? `&search=${search}` : ''}`;
            const res = await api.get<PageResponse<User>>(url);
            setUsers(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
        }
    }, [searchTerm]); // Recreate fetchUsers when searchTerm changes

    useEffect(() => {
        const handler = setTimeout(() => {
            // Khi searchTerm thay đổi, reset về trang 0 và tìm kiếm
            fetchUsers(0, searchTerm);
        }, 500); // Debounce 500ms

        // Cleanup function
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); // Kích hoạt tìm kiếm khi searchTerm thay đổi

    // Xử lý chuyển trang
    const handlePageChange = (page: number) => {
        fetchUsers(page, searchTerm);
    };

    const toggleUserStatus = async (id: string) => {
        const confirmChange = window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?');
        if (!confirmChange) return;

        try {
            await api.patch(`/admin/users/${id}/status`);
            fetchUsers(currentPage, searchTerm); // Refresh current page
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý người dùng</h1>
                <Input
                    type="text"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[300px]"
                />
            </div>

            <Table className="bg-white shadow-md rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead>Tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Vai trò</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.role === 'TEACHER' ? 'Giáo viên' : 'Học sinh'}</TableCell>
                            <TableCell>
                                <Switch
                                    checked={user.status === 'ACTIVE'}
                                    onCheckedChange={() => toggleUserStatus(user.id)}
                                />
                                <span className="ml-2 text-sm text-gray-500">
                  {user.status === 'ACTIVE' ? 'Đang hoạt động' : 'Bị chặn'}
                </span>
                            </TableCell>
                            <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}

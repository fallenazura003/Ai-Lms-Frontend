'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/Pagination'; // ✅ import component phân trang

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

    const fetchUsers = async (page = 0) => {
        try {
            const res = await api.get<PageResponse<User>>(`/admin/users?page=${page}&size=8`);
            setUsers(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải danh sách người dùng:', error);
        }
    };

    const toggleUserStatus = async (id: string) => {
        const confirmChange = window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái người dùng này?');
        if (!confirmChange) return;

        try {
            await api.patch(`/admin/users/${id}/status`);
            fetchUsers(currentPage); // Refresh current page
        } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái người dùng:', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Quản lý người dùng</h1>
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
                        onPageChange={(page) => fetchUsers(page)}
                    />
                </div>
            )}
        </div>
    );
}

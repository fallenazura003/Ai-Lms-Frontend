'use client';

import { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api'; // ✅ Đã sửa lỗi đường dẫn tương đối
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/Pagination'; // ✅ Đã sửa lỗi đường dẫn tương đối
import { Button } from "@/components/ui/button";
import { Input } from '@/components/ui/input';

interface Event {
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
}

interface PageResponse<T> {
    content: T[];
    number: number;
    totalPages: number;
}

export default function AdminLogsPage() {
    const [logs, setLogs] = useState<Event[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [searchTerm, setSearchTerm] = useState(''); // State cho từ khóa tìm kiếm

    // Sử dụng useCallback để hàm này chỉ được tạo lại khi dependencies thay đổi
    const fetchLogs = useCallback(async (page = 0, search = searchTerm) => {
        try {
            const url = `/admin/logs?page=${page}&size=10${search ? `&search=${search}` : ''}`;
            const res = await api.get<PageResponse<Event>>(url);
            setLogs(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải log hệ thống:', error);
        }
    }, [searchTerm]); // Recreate fetchLogs when searchTerm changes

    useEffect(() => {
        const handler = setTimeout(() => {
            // Khi searchTerm thay đổi, reset về trang 0 và tìm kiếm
            fetchLogs(0, searchTerm);
        }, 500); // Debounce 500ms

        // Cleanup function
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); // Kích hoạt tìm kiếm khi searchTerm thay đổi

    // Xử lý chuyển trang
    const handlePageChange = (page: number) => {
        fetchLogs(page, searchTerm);
    };

    const handleExportExcel = async () => {
        try {
            const res = await api.get('/admin/logs/export-excel', {
                responseType: 'blob',
            });

            const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'logs.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
        }
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý log hệ thống</h1>
                <div className="flex space-x-4">
                    <Input
                        type="text"
                        placeholder="Tìm kiếm theo hành động hoặc người thực hiện..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-[300px]"
                    />
                    <Button onClick={handleExportExcel}>Xuất Excel</Button>
                </div>
            </div>

            <Table className="bg-white shadow-md rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-center">Hành động</TableHead>
                        <TableHead className="text-center">Thực hiện bởi</TableHead>
                        <TableHead className="text-center">Thời gian</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.map((log) => (
                        <TableRow key={log.id}>
                            <TableCell>{log.action}</TableCell>
                            <TableCell>{log.performedBy}</TableCell>
                            <TableCell className="text-center whitespace-nowrap">
                                {new Date(log.timestamp).toLocaleString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour12: false,
                                })}
                            </TableCell>
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

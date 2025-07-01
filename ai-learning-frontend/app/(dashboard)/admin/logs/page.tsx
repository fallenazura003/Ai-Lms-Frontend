'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Pagination from '@/components/Pagination';
import { Button } from "@/components/ui/button";

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

    const fetchLogs = async (page = 0) => {
        try {
            const res = await api.get<PageResponse<Event>>(`/admin/logs?page=${page}&size=10`);
            setLogs(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải log hệ thống:', error);
        }
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

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Quản lý log hệ thống</h1>
                <Button onClick={handleExportExcel}>Xuất Excel</Button>
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
                        onPageChange={fetchLogs}
                    />
                </div>
            )}
        </div>
    );
}

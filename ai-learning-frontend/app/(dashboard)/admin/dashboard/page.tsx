// app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Stats {
    Users: number;
    Courses: number;
    Enrollments: number;
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<Stats>({ Users: 0, Courses: 0, Enrollments: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get<Stats>('/admin/dashboard');
                setStats(res.data);
            } catch (error) {
                console.error('Lỗi khi tải thống kê:', error);
            }
        };
        fetchStats();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Tổng quan Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader><CardTitle className="text-lg font-semibold text-gray-700">Người dùng</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-blue-600">{stats.Users}</CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader><CardTitle className="text-lg font-semibold text-gray-700">Khóa học</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-green-600">{stats.Courses}</CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader><CardTitle className="text-lg font-semibold text-gray-700">Lượt mua</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-purple-600">{stats.Enrollments}</CardContent>
                </Card>
            </div>
        </div>
    );
}
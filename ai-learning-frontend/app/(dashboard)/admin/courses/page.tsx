'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/Pagination'; // ✅ Đã có sẵn component này
import Image from 'next/image';

interface Course {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    creatorName: string;
    createdAt: string;
    visible: boolean;
}

interface PageResponse<T> {
    content: T[];
    number: number;
    totalPages: number;
    totalElements: number;
    size: number;
}

export default function AdminCoursesPage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCourses = async (page = 0) => {
        try {
            const res = await api.get<PageResponse<Course>>(`/admin/courses?page=${page}&size=8`);
            setCourses(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải danh sách khóa học:', error);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const toggleCourseVisibility = async (courseId: string, currentVisible: boolean) => {
        const confirmChange = window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái hiển thị của khóa học này không?');
        if (!confirmChange) return;
        try {
            await api.patch(`/admin/courses/${courseId}/visibility`);
            fetchCourses(currentPage); // Refresh trang hiện tại
        } catch (err) {
            console.error('Lỗi khi thay đổi trạng thái hiển thị khóa học:', err);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Quản lý khóa học</h1>
            <Table className="bg-white shadow-md rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead>Tiêu đề</TableHead>
                        <TableHead>Người tạo</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Hiển thị</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {courses.map((course) => (
                        <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{course.creatorName}</TableCell>
                            <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Switch
                                    checked={course.visible}
                                    onCheckedChange={() => toggleCourseVisibility(course.id, course.visible)}
                                />
                                <span className="ml-2 text-sm text-gray-500">
                                    {course.visible ? 'Hiển thị' : 'Ẩn'}
                                </span>
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
                        onPageChange={(page) => fetchCourses(page)}
                    />
                </div>
            )}
        </div>
    );
}

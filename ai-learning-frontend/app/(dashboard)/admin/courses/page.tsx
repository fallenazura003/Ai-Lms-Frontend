'use client';

import { useEffect, useState, useCallback } from 'react'; // ✅ Import useCallback
import api from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import Pagination from '@/components/Pagination';
import { Input } from '@/components/ui/input'; // ✅ Import Input
// import Image from 'next/image'; // Không cần thiết

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
    const [searchTerm, setSearchTerm] = useState(''); // ✅ State cho từ khóa tìm kiếm

    // Sử dụng useCallback để hàm này chỉ được tạo lại khi dependencies thay đổi
    const fetchCourses = useCallback(async (page = 0, search = searchTerm) => {
        try {
            const url = `/admin/courses?page=${page}&size=8${search ? `&search=${search}` : ''}`;
            const res = await api.get<PageResponse<Course>>(url);
            setCourses(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);
        } catch (error) {
            console.error('Lỗi khi tải danh sách khóa học:', error);
        }
    }, [searchTerm]); // Recreate fetchCourses when searchTerm changes

    useEffect(() => {
        const handler = setTimeout(() => {
            // Khi searchTerm thay đổi, reset về trang 0 và tìm kiếm
            fetchCourses(0, searchTerm);
        }, 500); // Debounce 500ms

        // Cleanup function để hủy timeout nếu component unmount hoặc searchTerm thay đổi nhanh
        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]); // ✅ Kích hoạt tìm kiếm khi searchTerm thay đổi

    // Xử lý chuyển trang
    const handlePageChange = (page: number) => {
        fetchCourses(page, searchTerm);
    };

    const toggleCourseVisibility = async (courseId: string, currentVisible: boolean) => {
        const confirmChange = window.confirm('Bạn có chắc chắn muốn thay đổi trạng thái hiển thị của khóa học này không?');
        if (!confirmChange) return;
        try {
            await api.patch(`/admin/courses/${courseId}/visibility`);
            fetchCourses(currentPage, searchTerm); // Refresh trang hiện tại
        } catch (err) {
            console.error('Lỗi khi thay đổi trạng thái hiển thị khóa học:', err);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Quản lý khóa học</h1>
                <Input
                    type="text"
                    placeholder="Tìm kiếm theo tiêu đề hoặc mô tả..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-[300px]"
                />
            </div>

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
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}

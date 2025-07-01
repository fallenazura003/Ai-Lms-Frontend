'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import AddNewCourseDialog from '@/components/course/AddNewCourseDialog';
import AddNewCourseAiDialog from '@/components/course/AddNewCourseAiDialog';
import CourseCard from '@/components/course/CourseCard';
import Pagination from '@/components/Pagination';
import api from '@/lib/api';
import { useAuth } from '@/store/auth';

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    creatorName: string;
    createdAt: string;
    visible: boolean;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    number: number;
    size: number;
    totalElements: number;
}

export default function TeacherCourseListPage() {
    const { role } = useAuth();
    const courseListSectionRef = useRef<HTMLDivElement>(null);

    const [courseList, setCourseList] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchCourses = async (page = 0, size = 8) => {
        try {
            const endpoint =
                role === 'TEACHER'
                    ? `/teacher/courses?page=${page}&size=${size}`
                    : `/admin/courses?page=${page}&size=${size}`;

            const res = await api.get<PageResponse<Course>>(endpoint);
            setCourseList(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);

            if (page !== 0 && courseListSectionRef.current) {
                courseListSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Lỗi khi tải danh sách khóa học:', error);
        }
    };

    useEffect(() => {
        if (role === 'TEACHER' || role === 'ADMIN') {
            fetchCourses(0);
        }
    }, [role]);

    const handlePageChange = (page: number) => fetchCourses(page);
    const refreshCurrentPage = () => fetchCourses(currentPage);

    return (
        <div className="mt-10 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-3xl text-gray-800">Khóa học của bạn</h2>

                {role === 'TEACHER' && (
                    <div className="flex gap-2">
                        <AddNewCourseDialog onCourseCreated={refreshCurrentPage}>
                            <Button>+ Tạo thủ công</Button>
                        </AddNewCourseDialog>
                        <AddNewCourseAiDialog onCourseCreated={refreshCurrentPage}>
                            <Button variant="outline">🤖 Tạo bằng AI</Button>
                        </AddNewCourseAiDialog>
                    </div>
                )}
            </div>

            <div ref={courseListSectionRef}>
                {courseList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded bg-secondary text-center">
                        <Image src="/certificate.jpg" alt="No Course" width={100} height={100} className="mb-4" />
                        <h2 className="text-xl font-bold text-gray-700">Bạn chưa có khóa học nào</h2>
                        {role === 'TEACHER' && (
                            <AddNewCourseDialog onCourseCreated={refreshCurrentPage}>
                                <Button className="mt-4">+ Tạo khóa học mới</Button>
                            </AddNewCourseDialog>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {courseList.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    userRole={role as 'STUDENT' | 'TEACHER' | 'ADMIN'}
                                    onCourseActionSuccess={refreshCurrentPage}
                                />
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                    </>
                )}
            </div>
        </div>
    );
}

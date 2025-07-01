'use client';

import React, { useEffect, useState, useRef } from 'react'; // ✅ Import useRef
import WelcomeBanner from '@/components/course/WelcomeBanner';
import CourseCard from '@/components/course/CourseCard';
import api from '@/lib/api';
import { useAuth } from '@/store/auth';
import Pagination from '@/components/Pagination';

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
}

export default function StudentHomePage() {
    const { role } = useAuth();

    const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
    const [purchasedPage, setPurchasedPage] = useState(0);
    const [purchasedTotalPages, setPurchasedTotalPages] = useState(0);
    const [exploreCourses, setExploreCourses] = useState<Course[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ✅ Tạo refs cho các phần tử cần cuộn đến
    const purchasedCoursesRef = useRef<HTMLDivElement>(null);
    const exploreCoursesRef = useRef<HTMLDivElement>(null);

    const getPurchasedCourses = async (page = 0) => {
        try {
            const res = await api.get<PageResponse<Course>>(`/student/courses?page=${page}&size=8`);
            setPurchasedCourses(res.data.content);
            setPurchasedPage(res.data.number);
            setPurchasedTotalPages(res.data.totalPages);

            // ✅ Cuộn đến phần này nếu đang ở trang không phải 0 (tức là đã chuyển trang)
            if (page !== 0 && purchasedCoursesRef.current) {
                purchasedCoursesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Lỗi khi tải khóa học đã mua:', error);
        }
    };

    const getExploreCourses = async (page = 0) => {
        try {
            const res = await api.get<PageResponse<Course>>(`/student/explore?page=${page}&size=8`);
            setExploreCourses(res.data.content);
            setCurrentPage(res.data.number);
            setTotalPages(res.data.totalPages);

            // ✅ Cuộn đến phần này nếu đang ở trang không phải 0 (tức là đã chuyển trang)
            if (page !== 0 && exploreCoursesRef.current) {
                exploreCoursesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Lỗi khi tải khóa học khám phá:', error);
        }
    };

    useEffect(() => {
        if (role === 'STUDENT') {
            getPurchasedCourses();
            getExploreCourses();
        }
    }, [role]);

    const refreshData = () => {
        getPurchasedCourses();
        getExploreCourses(currentPage);
    };

    return (
        <div className="p-6">
            <WelcomeBanner />

            {/* Khóa học đã mua */}
            {purchasedCourses.length > 0 && (
                // ✅ Gán ref vào div cha của phần "Khóa học của bạn"
                <div id="purchased-courses-section" ref={purchasedCoursesRef} className="mt-10">
                    <h2 className="font-bold text-2xl mb-4">Khóa học của bạn</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {purchasedCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={true}
                                userRole="STUDENT"
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={purchasedPage}
                        totalPages={purchasedTotalPages}
                        onPageChange={(page) => getPurchasedCourses(page)}
                    />
                </div>
            )}

            {/* Khóa học chưa mua (visible) */}
            {exploreCourses.length > 0 && (
                // ✅ Gán ref vào div cha của phần "Khám phá khóa học"
                <div id="explore-courses-section" ref={exploreCoursesRef} className="mt-12">
                    <h2 className="font-bold text-2xl mb-4">Khám phá khóa học</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {exploreCourses.map((course) => (
                            <CourseCard
                                key={course.id}
                                course={course}
                                isEnrolled={false}
                                userRole="STUDENT"
                                onCourseActionSuccess={refreshData}
                            />
                        ))}
                    </div>

                    {/* Dùng Pagination Component */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => getExploreCourses(page)}
                    />
                </div>
            )}
        </div>
    );
}
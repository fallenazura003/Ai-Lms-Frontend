 'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react'; // ✅ Import useCallback
import WelcomeBanner from '@/components/course/WelcomeBanner';
import CourseCard from '@/components/course/CourseCard';
import api from '@/lib/api';
import { useAuth } from '@/store/auth';
import Pagination from '@/components/Pagination';
import CourseFilter from '@/components/course/CourseFilter'; // ✅ Import CourseFilter

interface Course {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    creatorName: string;
    createdAt: string;
    visible: boolean;
    category?: string; // ✅ Thêm category
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
    const [exploreCurrentPage, setExploreCurrentPage] = useState(0); // Đổi tên để rõ ràng hơn
    const [exploreTotalPages, setExploreTotalPages] = useState(0);   // Đổi tên để rõ ràng hơn

    // ✅ State cho bộ lọc của phần "Khám phá khóa học"
    const [exploreFilters, setExploreFilters] = useState<{ category: string }>({
        category: '',
    });

    // ✅ Tạo refs cho các phần tử cần cuộn đến
    const purchasedCoursesRef = useRef<HTMLDivElement>(null);
    const exploreCoursesRef = useRef<HTMLDivElement>(null);

    const getPurchasedCourses = async (page = 0) => {
        try {
            const res = await api.get<PageResponse<Course>>(`/student/courses?page=${page}&size=8`);
            setPurchasedCourses(res.data.content);
            setPurchasedPage(res.data.number);
            setPurchasedTotalPages(res.data.totalPages);

            if (page !== 0 && purchasedCoursesRef.current) {
                purchasedCoursesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Lỗi khi tải khóa học đã mua:', error);
        }
    };

    // ✅ Cập nhật getExploreCourses để nhận các tham số lọc
    const getExploreCourses = useCallback(async (page = 0) => {
        try {
            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('size', '8');

            // ✅ Thêm tham số category nếu có
            if (exploreFilters.category && exploreFilters.category !== 'Tất cả') {
                params.append('category', exploreFilters.category);
            }

            const res = await api.get<PageResponse<Course>>(`/student/explore?${params.toString()}`);
            setExploreCourses(res.data.content);
            setExploreCurrentPage(res.data.number);
            setExploreTotalPages(res.data.totalPages);

            if (page !== 0 && exploreCoursesRef.current) {
                exploreCoursesRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } catch (error) {
            console.error('Lỗi khi tải khóa học khám phá:', error);
        }
    }, [exploreFilters]); // ✅ Thêm exploreFilters vào dependencies

    useEffect(() => {
        if (role === 'STUDENT') {
            getPurchasedCourses();
            // Lần đầu tải khám phá khóa học với bộ lọc mặc định
            getExploreCourses(0);
        }
    }, [role, getExploreCourses]); // ✅ getExploreCourses cũng là dependency

    const refreshData = () => {
        getPurchasedCourses();
        getExploreCourses(exploreCurrentPage); // ✅ Dùng exploreCurrentPage
    };

    // ✅ Callback cho CourseFilter
    const handleExploreFiltersChange = useCallback((newFilters: { category: string }) => {
        setExploreFilters(newFilters);
        setExploreCurrentPage(0); // Reset về trang 0 khi bộ lọc thay đổi
        // getExploreCourses(0) sẽ tự động được gọi bởi useEffect phụ thuộc vào exploreFilters
    }, []);

    return (
        <div className="p-6">
            <WelcomeBanner />

            {/* Khóa học đã mua */}
            {purchasedCourses.length > 0 && (
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
                    {purchasedTotalPages > 1 && ( // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
                        <Pagination
                            currentPage={purchasedPage}
                            totalPages={purchasedTotalPages}
                            onPageChange={(page) => getPurchasedCourses(page)}
                        />
                    )}
                </div>
            )}

            {/* Khóa học chưa mua (visible) */}
            <div id="explore-courses-section" ref={exploreCoursesRef} className="mt-12">
                <h2 className="font-bold text-2xl mb-4">Khám phá khóa học</h2>

                {/* ✅ Tích hợp CourseFilter vào đây */}
                <div className="mb-6">
                    <CourseFilter onFilterChange={handleExploreFiltersChange} />
                </div>

                {exploreCourses.length === 0 && exploreFilters.category === '' ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded bg-secondary text-center">
                        <p className="text-xl font-bold text-gray-700">Không có khóa học nào để khám phá.</p>
                        <p className="text-gray-500">Hãy quay lại sau hoặc thử tìm kiếm.</p>
                    </div>
                ) : exploreCourses.length === 0 && exploreFilters.category !== '' ? (
                    <div className="flex flex-col items-center justify-center p-8 border rounded bg-secondary text-center">
                        <p className="text-xl font-bold text-gray-700">Không tìm thấy khóa học nào phù hợp với danh mục này.</p>
                        <p className="text-gray-500">Vui lòng chọn danh mục khác hoặc đặt lại bộ lọc.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {exploreCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    isEnrolled={false}
                                    userRole="STUDENT"
                                    onCourseActionSuccess={refreshData} // Vẫn giữ refreshData nếu có action ảnh hưởng
                                />
                            ))}
                        </div>

                        {/* Dùng Pagination Component */}
                        {exploreTotalPages > 1 && ( // Chỉ hiển thị phân trang nếu có nhiều hơn 1 trang
                            <Pagination
                                currentPage={exploreCurrentPage}
                                totalPages={exploreTotalPages}
                                onPageChange={(page) => getExploreCourses(page)}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
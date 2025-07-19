// 'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
    Book, LoaderCircle, PlayCircle, Settings, DollarSign, Trash2, Edit, BookOpen,
    Eye, EyeOff, Star, Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/api';
import { toast } from 'sonner';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface CourseProps {
    course: {
        id: string;
        title: string;
        description: string;
        price: number;
        imageUrl: string;
        creatorName: string;
        createdAt: string;
        visible: boolean;
        category?: string;
        // lessonCount: number; // ❌ Đã bỏ trường này khỏi interface
    };
    isEnrolled?: boolean;
    userRole?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'ANONYMOUS' | null;
    onCourseActionSuccess?: () => void;
}

export default function CourseCard({ course, isEnrolled, userRole, onCourseActionSuccess }: CourseProps) {
    const [loadingDelete, setLoadingDelete] = useState(false);
    const [loadingToggleVisibility, setLoadingToggleVisibility] = useState(false);
    const [currentCourseVisibility, setCurrentCourseVisibility] = useState(course.visible);
    const [averageRatingState, setAverageRatingState] = useState<number | null>(null);

    useEffect(() => {
        if (userRole !== 'STUDENT') return;

        const fetchRating = async () => {
            try {
                const res = await api.get(`/student/courses/${course.id}/rating/average`);
                setAverageRatingState(typeof res.data === 'number' ? res.data : null);
            } catch (error) {
                console.error("Không thể lấy điểm đánh giá trung bình:", error);
            }
        };

        fetchRating();
    }, [course.id, userRole]);

    const getFullImageUrl = (path: string | undefined | null) => {
        if (!path || path.trim() === '') {
            return 'https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png';
        }
        if (path.startsWith('/uploads/')) {
            return `http://localhost:8080${path}`;
        }
        return path;
    };

    const handleDeleteCourse = async () => {
        setLoadingDelete(true);
        try {
            await api.delete(`/teacher/courses/${course.id}`);
            toast.success('Khóa học đã được xóa thành công!');
            onCourseActionSuccess?.();
        } catch {
            toast.error('Có lỗi xảy ra khi xóa khóa học.');
        } finally {
            setLoadingDelete(false);
        }
    };

    const handleToggleVisibility = async () => {
        setLoadingToggleVisibility(true);
        try {
            const newVisibility = !currentCourseVisibility;
            await api.patch(`/teacher/courses/${course.id}/toggle-visibility`, {
                visible: newVisibility,
            });
            setCurrentCourseVisibility(newVisibility);
            toast.success(newVisibility ? 'Khóa học đã được hiển thị!' : 'Khóa học đã được ẩn!');
            onCourseActionSuccess?.();
        } catch {
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái hiển thị.');
        } finally {
            setLoadingToggleVisibility(false);
        }
    };

    return (
        <div className="shadow-lg rounded-xl overflow-hidden bg-white hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 flex flex-col h-full">
            {/* Image Section */}
            <div className="relative w-full h-[160px] sm:h-[180px] lg:h-[200px] flex-shrink-0">
                <Image
                    src={getFullImageUrl(course?.imageUrl)}
                    alt={course?.title || 'Course Image'}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    priority
                    className="rounded-t-xl object-cover"
                />
            </div>

            {/* Content Section */}
            <div className="p-3 sm:p-4 flex flex-col flex-grow">
                <div className="flex-shrink-0" style={{ minHeight: '90px' }}>
                    <h2 className="font-bold text-lg sm:text-xl text-gray-800 line-clamp-2 mb-1" title={course?.title}>
                        {course?.title}
                    </h2>
                    <p className="line-clamp-3 text-gray-600 text-sm mb-2">{course?.description}</p>

                    {averageRatingState !== null && (
                        <div className="mt-2 flex items-center gap-1 sm:gap-2 text-yellow-600 text-sm font-medium">
                            <Star className="w-4 h-4" />
                            <span>Đánh giá: {averageRatingState.toFixed(1)} / 5</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col flex-grow justify-end gap-2 sm:gap-3 mt-4">
                    {/* Display Category */}
                    {course.category && (
                        <div className="flex items-center gap-1 sm:gap-2 text-gray-600 text-sm">
                            <Tag className="h-4 w-4" />
                            <span>Danh mục: {course.category}</span>
                        </div>
                    )}

                    {/* Price (Removed Lesson Count) */}
                    <div className="flex items-center justify-end text-gray-700 text-sm sm:text-base"> {/* ✅ Chỉ còn justify-end */}
                        {/* ❌ Đã bỏ phần hiển thị số bài học */}
                        <h2 className="flex items-center gap-1 sm:gap-2 text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
                            {course.price === 0 ? 'Miễn phí' : `${course.price.toLocaleString()} VNĐ`}
                        </h2>
                    </div>

                    {/* Teacher Visibility Status */}
                    {userRole === 'TEACHER' && (
                        <div className="flex items-center justify-end text-xs sm:text-sm mt-1">
                            {currentCourseVisibility ? (
                                <span className="text-green-600 flex items-center gap-1">
                                    <Eye className="h-4 w-4" /> Đang hiển thị
                                </span>
                            ) : (
                                <span className="text-red-500 flex items-center gap-1">
                                    <EyeOff className="h-4 w-4" /> Đang ẩn
                                </span>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 mt-2">
                        {userRole === 'STUDENT' && (
                            isEnrolled ? (
                                <Link href={`/student/courses/${course.id}`} passHref className="w-full">
                                    <Button className="w-full" variant="secondary">
                                        <PlayCircle className="mr-2 h-5 w-5" /> Tiếp tục học
                                    </Button>
                                </Link>
                            ) : (
                                <Link href={`/student/courses/${course.id}`} passHref className="w-full">
                                    <Button className="w-full">
                                        <PlayCircle className="mr-2 h-5 w-5" /> Xem chi tiết
                                    </Button>
                                </Link>
                            )
                        )}

                        {userRole === 'TEACHER' && (
                            <>
                                <Link href={`/teacher/courses/${course.id}/preview`} passHref className="w-full">
                                    <Button className="w-full" variant="secondary">
                                        <Eye className="mr-2 h-5 w-5" /> Chi tiết khóa học
                                    </Button>
                                </Link>

                                <Link href={`/teacher/courses/${course.id}/lessons`} passHref className="w-full">
                                    <Button className="w-full" variant="default">
                                        <BookOpen className="mr-2 h-5 w-5" /> Quản lý bài học
                                    </Button>
                                </Link>

                                <Link href={`/teacher/courses/${course.id}/edit`} passHref className="w-full">
                                    <Button className="w-full" variant="outline">
                                        <Edit className="mr-2 h-5 w-5" /> Sửa khóa học
                                    </Button>
                                </Link>

                                <Button
                                    onClick={handleToggleVisibility}
                                    className="w-full"
                                    variant={currentCourseVisibility ? 'outline' : 'default'}
                                    disabled={loadingToggleVisibility}
                                >
                                    {loadingToggleVisibility ? (
                                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                    ) : currentCourseVisibility ? (
                                        <EyeOff className="mr-2 h-5 w-5" />
                                    ) : (
                                        <Eye className="mr-2 h-5 w-5" />
                                    )}
                                    {currentCourseVisibility ? 'Ẩn khóa học' : 'Hiển thị khóa học'}
                                </Button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button className="w-full" variant="destructive" disabled={loadingDelete}>
                                            {loadingDelete ? (
                                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="mr-2 h-5 w-5" />
                                            )}
                                            Xóa khóa học
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Hành động này sẽ xóa vĩnh viễn khóa học <span className="font-bold text-primary">{course.title}</span> và tất cả bài học liên quan.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDeleteCourse} disabled={loadingDelete}>
                                                {loadingDelete && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                                                Xóa
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}

                        {userRole === 'ADMIN' && (
                            <Link href={`/admin/courses/${course.id}/edit`} passHref className="w-full">
                                <Button className="w-full" variant="outline">
                                    <Settings className="mr-2 h-5 w-5" /> Chỉnh sửa khóa học
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
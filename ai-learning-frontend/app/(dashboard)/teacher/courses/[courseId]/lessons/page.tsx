// app/teacher/courses/[courseId]/lessons/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import LessonFormDialog from '@/components/lesson/LessonFormDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrashIcon } from 'lucide-react';
import { toast } from 'sonner';
import CourseLoading from '@/components/course/CourseLoading';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import AddNewLessonAiDialog from '@/components/lesson/AddNewLessonAiDialog';
import { LessonResponse } from '@/types/lesson'; // Import LessonResponse

interface CourseInfo {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
}

export default function LessonManagementPage() {
    const { courseId } = useParams();
    const [lessons, setLessons] = useState<LessonResponse[]>([]);
    const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const courseRes = await api.get(`/teacher/courses/${courseId}`);
            setCourseInfo(courseRes.data);

            const lessonRes = await api.get(`/teacher/courses/${courseId}/lessons`);
            // Backend đã sắp xếp, nên không cần sắp xếp lại ở đây nữa
            setLessons(lessonRes.data); // ✅ Chỉ cần gán trực tiếp
        } catch (err: any) {
            console.error("Lỗi khi tải dữ liệu:", err);
            toast.error(`Lỗi khi tải ${err.response?.data?.message || 'dữ liệu khóa học hoặc bài học'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (lessonId: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa bài học này không?')) {
            return;
        }
        try {
            await api.delete(`/teacher/courses/${courseId}/lessons/${lessonId}`);
            toast.success('Bài học đã được xóa thành công!');
            fetchData();
        } catch (err: any) {
            console.error("Lỗi khi xóa bài học:", err);
            toast.error(`Lỗi khi xóa bài học: ${err.response?.data?.message || 'Không xác định'}`);
        }
    };

    useEffect(() => {
        if (courseId) {
            fetchData();
        }
    }, [courseId]);

    if (loading) {
        return <CourseLoading />;
    }

    if (!courseInfo) {
        return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin khóa học.</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            {/* Breadcrumb và Course Info components */}
            {/* ... (Giữ nguyên các phần này) ... */}

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Danh sách bài học</h2>
                <div className="flex gap-2">
                    <LessonFormDialog courseId={courseId as string} onLessonSaved={fetchData}>
                        <Button>+ Thêm bài học mới</Button>
                    </LessonFormDialog>
                    <AddNewLessonAiDialog
                        courseId={courseId as string}
                        courseTitle={courseInfo.title}
                        onLessonCreated={fetchData}
                    >
                        <Button variant="outline">🤖 Tạo bằng AI</Button>
                    </AddNewLessonAiDialog>
                </div>
            </div>

            {lessons.length === 0 ? (
                <div className="text-center text-gray-500 p-8 border rounded-lg bg-white">
                    <p className="text-lg mb-2">Chưa có bài học nào trong khóa học này.</p>
                    <p className="mb-4">Hãy thêm bài học đầu tiên của bạn!</p>
                    <AddNewLessonAiDialog
                        courseId={courseId as string}
                        courseTitle={courseInfo.title}
                        onLessonCreated={fetchData}
                    >
                        <Button className="mt-4">🤖 Tạo bài học đầu tiên bằng AI</Button>
                    </AddNewLessonAiDialog>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lessons.map((lesson) => (
                        <Card key={lesson.id} className="shadow-sm border">
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center text-xl font-medium">
                                    {/* ✅ Hiển thị lessonOrder */}
                                    <span>{lesson.lessonOrder}. {lesson.title}</span>
                                    {lesson.isLessonCompleted && <span className="text-green-600 text-sm">✔ Đã hoàn thành</span>}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {lesson.youtubeVideoId && (
                                    <div className="text-sm text-gray-600 mb-2 flex items-center">
                                        🎬 Video: <code className="ml-1">{lesson.youtubeVideoId}</code>
                                    </div>
                                )}
                                <div className="flex gap-2 mt-4">
                                    <LessonFormDialog courseId={courseId as string} lesson={lesson} onLessonSaved={fetchData} />
                                    <Button variant="destructive" onClick={() => handleDelete(lesson.id)}>
                                        <TrashIcon className="w-4 h-4 mr-1" /> Xóa
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
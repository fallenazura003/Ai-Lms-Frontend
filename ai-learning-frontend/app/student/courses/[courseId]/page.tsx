'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Image from 'next/image';
import { DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '@/store/auth';

import LessonListSidebar from '@/components/lesson/LessonListSidebar';
import LessonContent from '@/components/lesson/LessonContent';
import CourseLoading from '@/components/course/CourseLoading';
import CourseCommentSection from '@/components/course/CourseCommentSection';
import { WalletPanel } from '@/components/WalletPanel'; // ✅ Thêm dòng này
import { useBalanceStore } from '@/store/balance';

interface LessonResponse {
    id: string;
    title: string;
    youtubeVideoId?: string;
    recallQuestion: string;
    material: string;
    shortAnswer: string;
    multipleChoice: string;
    summaryTask: string;
    isRecallQuestionCompleted?: boolean;
    isMaterialCompleted?: boolean;
    isShortAnswerCompleted?: boolean;
    isMultipleChoiceCompleted?: boolean;
    isSummaryTaskCompleted?: boolean;
    isLessonCompleted: boolean;
    courseId: string;
    lessonOrder: number;
}

interface CourseDetail {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    creatorName: string;
    price: number;
    createdAt: string;
    visible: boolean;
}

export default function CourseDetailPage() {
    const { courseId } = useParams();
    const { role } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const isTeacherPreview = pathname.startsWith('/teacher/courses');

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [lessons, setLessons] = useState<LessonResponse[]>([]);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);



    const { balance, setBalance, fetchBalance } = useBalanceStore((state) => state);



    const [walletOpen, setWalletOpen] = useState(false); // ✅ Biến mở popup ví

    const fetchLessons = async (cid: string) => {
        try {
            const basePath = isTeacherPreview ? '/teacher' : '/student';
            const res = await api.get(`${basePath}/courses/${cid}/lessons`);
            setLessons(res.data);
            if (res.data.length > 0) {
                const currentActive = res.data.find((l: LessonResponse) => l.id === activeLessonId);
                if (!currentActive) {
                    setActiveLessonId(res.data[0].id);
                }
            } else {
                setActiveLessonId(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Không thể tải danh sách bài học');
        }
    };

    useEffect(() => {
        if (!courseId || typeof courseId !== 'string') return;
        if (!role) return;

        const fetchCourseData = async () => {
            setLoading(true);
            try {
                let courseApiUrl = '';
                let shouldFetchLessons = false;

                // Nếu là học sinh => gọi API mua và gọi luôn fetchBalance
                if (role === 'STUDENT') {
                    courseApiUrl = `/student/courses/${courseId}`;
                    const purchasedRes = await api.get<boolean>(`/student/enrolled/${courseId}`);
                    setHasPurchased(purchasedRes.data);
                    shouldFetchLessons = purchasedRes.data;

                    // ✅ Tự động gọi số dư mỗi khi vào trang học sinh
                    await fetchBalance();
                } else if (role === 'TEACHER' && isTeacherPreview) {
                    courseApiUrl = `/teacher/courses/${courseId}/preview`;
                    setHasPurchased(true);
                    shouldFetchLessons = true;
                } else {
                    toast.error('Bạn không có quyền truy cập hoặc khóa học không tồn tại.');
                    return;
                }

                const courseRes = await api.get(courseApiUrl);
                setCourse(courseRes.data);

                if (shouldFetchLessons) {
                    await fetchLessons(courseId);
                }
            } catch (err: any) {
                toast.error(err.response?.data?.message || 'Không thể tải khóa học.');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [courseId, role, isTeacherPreview]);


    const handleBuy = async () => {
        if (!course) return;
        setBuying(true);
        try {
            const res = await api.post('/student/purchase', { courseId: course.id });

            toast.success(res.data.message || 'Đã mua khóa học thành công!');
            setHasPurchased(true);
            await fetchLessons(course.id);

            if (res.data.data?.balance !== undefined) {
                setBalance(res.data.data.balance);
            } else {
                await fetchBalance();
            }
        } catch (err: any) {
            const message = err.response?.data?.message || 'Mua khóa học thất bại';
            if (message.includes('Số dư không đủ để mua khóa học này.')) {
                toast.error('❌ Số dư không đủ để mua khóa học này.');
                setTimeout(() => setWalletOpen(true), 300);
            } else {
                toast.error(message);
            }
        } finally {
            setBuying(false);
        }
    };


    const getFullImageUrl = (path: string | undefined | null) => {
        if (!path || path.trim() === '') {
            return 'https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png';
        }
        if (path.startsWith('/uploads/')) {
            return `http://localhost:8080${path}`;
        }
        return path;
    };

    const activeLesson = lessons.find((l) => l.id === activeLessonId) || null;
    const activeLessonIndex = lessons.findIndex((l) => l.id === activeLessonId);
    const hasPreviousLesson = activeLessonIndex > 0;
    const hasNextLesson = activeLessonIndex < lessons.length - 1;

    const handleNextLesson = () => {
        if (hasNextLesson) setActiveLessonId(lessons[activeLessonIndex + 1].id);
    };

    const handlePreviousLesson = () => {
        if (hasPreviousLesson) setActiveLessonId(lessons[activeLessonIndex - 1].id);
    };

    if (loading) return <CourseLoading />;
    if (!course) return <div className="p-6 text-center text-red-600">Không tìm thấy khóa học.</div>;

    return (
        <div className="flex">
            <aside className="w-80 flex-shrink-0 bg-secondary h-screen overflow-y-auto border-r shadow-sm">
                <LessonListSidebar
                    lessons={lessons}
                    activeLessonId={activeLessonId}
                    onLessonClick={(lesson) => setActiveLessonId(lesson.id)}
                />
            </aside>

            <main className="flex-1 overflow-y-auto p-6 max-h-screen">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
                            <p className="text-gray-600 mt-2">Tác giả: {course.creatorName}</p>
                        </div>

                        {role === 'STUDENT' && !hasPurchased && (
                            <Button
                                onClick={handleBuy}
                                disabled={buying}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                <DollarSign className="mr-2 w-5 h-5" />
                                {buying ? 'Đang xử lý...' : 'Mua khóa học'}
                            </Button>
                        )}

                        {hasPurchased && role === 'STUDENT' && (
                            <div className="text-green-700 font-semibold border border-green-300 bg-green-50 rounded px-4 py-2 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Bạn đã sở hữu khóa học này
                            </div>
                        )}

                        {role === 'TEACHER' && isTeacherPreview && (
                            <Button onClick={() => router.push(`/teacher/courses/${course.id}/lessons`)}>
                                Quản lý bài học (Teacher)
                            </Button>
                        )}
                    </div>

                    <div className="relative w-full h-[300px] rounded overflow-hidden mb-6">
                        <Image
                            src={getFullImageUrl(course.imageUrl)}
                            alt={course.title}
                            fill
                            className="object-cover rounded"
                        />
                    </div>

                    {!hasPurchased && role === 'STUDENT' && (
                        <div className="mb-6 text-xl text-green-600 font-bold flex items-center gap-2">
                            <DollarSign className="w-5 h-5" />
                            {course.price === 0 ? 'Miễn phí' : `${course.price} VNĐ`}
                        </div>
                    )}

                    <p className="text-gray-700 whitespace-pre-line mb-8">{course.description}</p>

                    {hasPurchased ? (
                        <LessonContent
                            lesson={activeLesson}
                            onNextLesson={handleNextLesson}
                            onPreviousLesson={handlePreviousLesson}
                            hasNextLesson={hasNextLesson}
                            hasPreviousLesson={hasPreviousLesson}
                        />
                    ) : (
                        <div className="p-8 text-center bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                            <h3 className="text-xl font-semibold mb-2">Mua khóa học để truy cập các bài học</h3>
                            <p>Hãy mua khóa học này để mở khóa tất cả các bài học và bắt đầu hành trình học tập của bạn!</p>
                        </div>
                    )}
                </div>

                <CourseCommentSection courseId={course.id} />

                {/* ✅ WalletPanel để nạp tiền khi không đủ */}
                <WalletPanel
                    open={walletOpen}
                    onOpenChange={setWalletOpen}
                    onSuccess={(newBalance) => {
                        setBalance(newBalance);
                    }}
                />

            </main>
        </div>
    );
}

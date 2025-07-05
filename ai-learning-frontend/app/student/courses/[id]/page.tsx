// app/student/courses/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Import useRouter
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import Image from 'next/image';
import { DollarSign, CheckCircle } from 'lucide-react';
import { useAuth } from '@/store/auth';

// Import components cho bài học
import LessonListSidebar from '@/components/lesson/LessonListSidebar';
import LessonContent from '@/components/lesson/LessonContent';
import CourseLoading from '@/components/course/CourseLoading'; // Import CourseLoading

import CourseCommentSection from '@/components/course/CourseCommentSection';

// Cập nhật lại interface LessonResponse để bao gồm tất cả các trường is...Completed và courseId
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
    lessonOrder: number; // Thêm lessonOrder
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

export default function StudentCourseDetailPage() {
    const { id } = useParams();
    const { role } = useAuth(); // Lấy role từ store
    const router = useRouter(); // Khởi tạo router

    const [course, setCourse] = useState<CourseDetail | null>(null);
    const [lessons, setLessons] = useState<LessonResponse[]>([]);
    const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [buying, setBuying] = useState(false);
    const [hasPurchased, setHasPurchased] = useState(false);

    // Function to fetch lessons
    const fetchLessons = async (courseId: string) => {
        try {
            const res = await api.get(`/student/courses/${courseId}/lessons`);
            setLessons(res.data);
            if (res.data.length > 0) {
                // Đảm bảo activeLessonId được set khi lessons được load
                // Nếu activeLessonId hiện tại không còn trong danh sách mới (do xóa bài học chẳng hạn)
                // hoặc chưa có bài học nào được chọn, thì chọn bài đầu tiên.
                const currentActive = res.data.find((l: LessonResponse) => l.id === activeLessonId); // ✅ Sửa lỗi ở đây
                if (!currentActive && res.data.length > 0) {
                    setLessons(res.data); // Cập nhật state lessons trước khi set activeLessonId
                    setActiveLessonId(res.data[0].id);
                } else if (res.data.length === 0) {
                    setActiveLessonId(null);
                }
            } else {
                setActiveLessonId(null); // Không có bài học nào
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Không thể tải danh sách bài học');
            console.error("Error fetching lessons:", err);
        }
    };

    // Effect để fetch thông tin khóa học và kiểm tra trạng thái mua
    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                // Chỉ fetch nếu id có và role là STUDENT
                if (id && role === 'STUDENT') {
                    const courseRes = await api.get(`/student/courses/${id}`);
                    setCourse(courseRes.data);

                    const purchasedRes = await api.get<boolean>(`/student/enrolled/${id}`);
                    setHasPurchased(purchasedRes.data);

                    if (purchasedRes.data) {
                        await fetchLessons(id as string);
                    }
                } else if (id && role === 'TEACHER') { // Teacher cũng có thể xem trang này
                    const courseRes = await api.get(`/teacher/courses/${id}`); // Dùng API của teacher
                    setCourse(courseRes.data);
                    // Teacher luôn có thể xem bài học của mình
                    setHasPurchased(true); // Coi như đã "sở hữu" để hiển thị bài học
                    await fetchLessons(id as string);
                } else {
                    // Nếu không phải STUDENT/TEACHER hoặc không có ID, không làm gì cả
                    // Có thể chuyển hướng về trang chủ hoặc hiển thị thông báo lỗi
                    // toast.error("Bạn không có quyền truy cập hoặc khóa học không tồn tại.");
                    // router.push('/'); // Hoặc chuyển hướng đi nơi khác
                }
            } catch (err: any) {
                // Nếu có lỗi 403 khi fetch khóa học, có thể người dùng chưa đăng nhập hoặc không có quyền
                if (err.response && err.response.status === 403) {
                    toast.error("Bạn không có quyền truy cập khóa học này.");
                    // Chuyển hướng về trang đăng nhập hoặc trang chủ nếu không có quyền
                    router.push('/login');
                } else {
                    toast.error(err.response?.data?.message || 'Không thể tải khóa học hoặc kiểm tra trạng thái mua');
                }
                console.error("Error in fetchCourseData:", err);
            } finally {
                setLoading(false);
            }
        };

        // Chỉ gọi fetchCourseData nếu ID tồn tại
        if (id) {
            fetchCourseData();
        }
    }, [id, role, router]); // Thêm router vào dependency array (best practice)

    // Effect để re-fetch lessons khi activeLessonId thay đổi (nếu đã mua)
    // Hoặc khi lessons rỗng và courseId tồn tại (ví dụ: tạo bài học đầu tiên)
    useEffect(() => {
        if (id && hasPurchased && lessons.length > 0) { // Chỉ re-fetch nếu có lessons
            // Không cần gọi lại fetchLessons ở đây nếu chỉ là để cập nhật trạng thái hoàn thành
            // Trạng thái hoàn thành được quản lý trong LessonListSidebar
            // Nếu bạn muốn re-fetch để lấy trạng thái hoàn thành mới nhất từ DB
            // thì hãy cẩn thận với vòng lặp vô hạn
        }
        // Nếu activeLessonId bị null (do xóa hết bài học), thì reset về null
        if (!activeLessonId && lessons.length > 0) {
            setActiveLessonId(lessons[0].id);
        }
    }, [activeLessonId, id, hasPurchased, lessons.length]);


    const handleBuy = async () => {
        if (!course) return;
        setBuying(true);
        try {
            await api.post('/student/purchase', { courseId: course.id });
            toast.success('Đã mua khóa học thành công!');
            setHasPurchased(true); // Cập nhật trạng thái đã mua
            // Sau khi mua, lessons sẽ được fetch tự động qua useEffect phụ thuộc vào hasPurchased
            await fetchLessons(course.id);
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Mua khóa học thất bại');
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

    const activeLesson = lessons.find(l => l.id === activeLessonId) || null;
    const activeLessonIndex = lessons.findIndex(l => l.id === activeLessonId);
    const hasPreviousLesson = activeLessonIndex > 0;
    const hasNextLesson = activeLessonIndex < lessons.length - 1;

    const handleNextLesson = () => {
        if (activeLessonIndex < lessons.length - 1) {
            setActiveLessonId(lessons[activeLessonIndex + 1].id);
        }
    };

    const handlePreviousLesson = () => {
        if (activeLessonIndex > 0) {
            setActiveLessonId(lessons[activeLessonIndex - 1].id);
        }
    };

    if (loading) return <CourseLoading />; // Sử dụng component loading
    if (!course) return <div className="p-6 text-center">Không tìm thấy khóa học.</div>;

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
                        {role === 'TEACHER' && (
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
                        <div className="flex flex-col">
                            <LessonContent
                                lesson={activeLesson}
                                onNextLesson={handleNextLesson}
                                onPreviousLesson={handlePreviousLesson}
                                hasNextLesson={hasNextLesson}
                                hasPreviousLesson={hasPreviousLesson}
                            />
                        </div>
                    ) : (
                        <div className="p-8 text-center bg-blue-50 border border-blue-200 rounded-lg text-blue-700">
                            <h3 className="text-xl font-semibold mb-2">Mua khóa học để truy cập các bài học</h3>
                            <p>Hãy mua khóa học này để mở khóa tất cả các bài học và bắt đầu hành trình học tập của bạn!</p>
                        </div>
                    )}
                </div>
                <CourseCommentSection courseId={course.id} />
            </main>
        </div>
    );
}
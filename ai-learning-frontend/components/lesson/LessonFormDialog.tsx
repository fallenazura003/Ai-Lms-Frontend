// components/lesson/LessonFormDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// ✅ Cập nhật LessonResponse interface để bao gồm lessonOrder
// Nếu bạn đã có LessonResponse ở '@/types/lesson', hãy import nó thay vì định nghĩa lại.
// Ví dụ: import { LessonResponse } from '@/types/lesson';
interface LessonResponse {
    id?: string;
    title: string;
    youtubeVideoId?: string;
    recallQuestion: string;
    material: string;
    shortAnswer: string;
    multipleChoice: string;
    summaryTask: string;
    // ✅ Thêm lessonOrder vào đây
    lessonOrder: number; // Đảm bảo có trường này và nó là số

    // Vẫn giữ các trường boolean trong interface vì chúng có thể được trả về từ API
    // hoặc sử dụng ở các phần khác của ứng dụng (ví dụ: hiển thị trạng thái hoàn thành).
    // Chúng chỉ không hiển thị trong form tạo/chỉnh sửa.
    isRecallQuestionCompleted?: boolean;
    isMaterialCompleted?: boolean;
    isShortAnswerCompleted?: boolean;
    isMultipleChoiceCompleted?: boolean;
    isSummaryTaskCompleted?: boolean;
    isLessonCompleted?: boolean;
    courseId: string;
}

interface LessonFormDialogProps {
    courseId: string;
    lesson?: LessonResponse;
    onLessonSaved?: () => void;
    children?: React.ReactNode;
}

export default function LessonFormDialog({ courseId, lesson, onLessonSaved, children }: LessonFormDialogProps) {
    const [open, setOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState<LessonResponse>({
        id: undefined,
        title: '',
        youtubeVideoId: '',
        recallQuestion: '',
        material: '',
        shortAnswer: '',
        multipleChoice: '',
        summaryTask: '',
        lessonOrder: 1, // ✅ Khởi tạo lessonOrder mặc định là 1 khi tạo mới
        // Các trường boolean (nếu cần gửi lên backend, phải khớp với DTO của backend)
        isRecallQuestionCompleted: false,
        isMaterialCompleted: false,
        isShortAnswerCompleted: false,
        isMultipleChoiceCompleted: false,
        isSummaryTaskCompleted: false,
        isLessonCompleted: false,
        courseId: courseId,
    });

    useEffect(() => {
        if (lesson) {
            // Khi chỉnh sửa bài học, lấy giá trị từ prop lesson
            setForm({
                id: lesson.id,
                title: lesson.title || '',
                youtubeVideoId: lesson.youtubeVideoId || '',
                recallQuestion: lesson.recallQuestion || '',
                material: lesson.material || '',
                shortAnswer: lesson.shortAnswer || '',
                multipleChoice: lesson.multipleChoice || '',
                summaryTask: lesson.summaryTask || '',
                lessonOrder: lesson.lessonOrder || 1, // ✅ Lấy lessonOrder từ prop, mặc định là 1
                isRecallQuestionCompleted: lesson.isRecallQuestionCompleted || false,
                isMaterialCompleted: lesson.isMaterialCompleted || false,
                isShortAnswerCompleted: lesson.isShortAnswerCompleted || false,
                isMultipleChoiceCompleted: lesson.isMultipleChoiceCompleted || false,
                isSummaryTaskCompleted: lesson.isSummaryTaskCompleted || false,
                isLessonCompleted: lesson.isLessonCompleted || false,
                courseId: lesson.courseId || courseId,
            });
        } else {
            // Khi tạo bài học mới, reset form về giá trị mặc định (đã khởi tạo ở trên)
            // hoặc fetch tổng số bài học để gợi ý lessonOrder
            // Hiện tại, giữ nguyên như khởi tạo để đơn giản.
            setForm(prevForm => ({
                ...prevForm, // Giữ lại courseId và các giá trị mặc định khác
                id: undefined,
                title: '',
                youtubeVideoId: '',
                recallQuestion: '',
                material: '',
                shortAnswer: '',
                multipleChoice: '',
                summaryTask: '',
                lessonOrder: 1, // Reset về 1 khi form mở để tạo mới
            }));
        }
    }, [lesson, open, courseId]); // Thêm 'open' vào dependency array để reset khi dialog đóng/mở

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        setForm(prev => ({
            ...prev,
            // Chuyển đổi giá trị số nếu trường là 'lessonOrder'
            [name]: name === 'lessonOrder' ? parseInt(value) || 0 : value,
        }));
    };

    const handleSave = async () => {
        setSubmitting(true);
        try {
            // Chuẩn bị dữ liệu gửi đi (loại bỏ các trường boolean không cần thiết nếu backend không yêu cầu)
            const payload = {
                title: form.title,
                youtubeVideoId: form.youtubeVideoId,
                recallQuestion: form.recallQuestion,
                material: form.material,
                shortAnswer: form.shortAnswer,
                multipleChoice: form.multipleChoice,
                summaryTask: form.summaryTask,
                lessonOrder: form.lessonOrder, // ✅ Gửi lessonOrder
                // Các trường boolean này có thể bỏ qua nếu backend không yêu cầu khi POST/PUT
                // hoặc giữ lại nếu DTO của backend có chúng
                // isRecallQuestionCompleted: form.isRecallQuestionCompleted,
                // isMaterialCompleted: form.isMaterialCompleted,
                // isShortAnswerCompleted: form.isShortAnswerCompleted,
                // isMultipleChoiceCompleted: form.isMultipleChoiceCompleted,
                // isSummaryTaskCompleted: form.isSummaryTaskCompleted,
                // isLessonCompleted: form.isLessonCompleted,
            };

            if (form.id) {
                // Sử dụng payload khi PUT
                await api.put(`/teacher/courses/${form.courseId}/lessons/${form.id}`, payload);
                toast.success('Bài học đã được cập nhật thành công!');
            } else {
                // Sử dụng payload khi POST
                await api.post(`/teacher/courses/${form.courseId}/lessons`, payload);
                toast.success('Bài học đã được tạo thành công!');
            }
            setOpen(false);
            onLessonSaved?.();
        } catch (err: any) {
            console.error('Lỗi khi lưu bài học:', err);
            toast.error('Có lỗi xảy ra khi lưu bài học: ' + (err.response?.data?.message || ''));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (lesson ? <Button variant="outline">✏️ Sửa bài học</Button> : <Button>+ Thêm bài học</Button>)}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{lesson ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {/* Input cho lessonOrder */}
                    <div>
                        <Label htmlFor="lessonOrder">Thứ tự bài học</Label>
                        <Input
                            id="lessonOrder"
                            name="lessonOrder"
                            type="number" // ✅ Quan trọng: type="number"
                            placeholder="Thứ tự hiển thị của bài học"
                            value={form.lessonOrder}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    {/* Các trường nội dung chính */}
                    <div>
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input id="title" name="title" placeholder="Tiêu đề bài học" value={form.title} onChange={handleChange} required />
                    </div>
                    <div>
                        <Label htmlFor="youtubeVideoId">YouTube Video ID</Label>
                        <Input id="youtubeVideoId" name="youtubeVideoId" placeholder="ID video YouTube (ví dụ: dQw4w9WgXcQ)" value={form.youtubeVideoId} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="recallQuestion">Câu hỏi gợi nhớ</Label>
                        <Textarea id="recallQuestion" name="recallQuestion" placeholder="Câu hỏi gợi nhớ (hỗ trợ Markdown)" value={form.recallQuestion} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="material">Tài liệu bài học</Label>
                        <Textarea id="material" name="material" placeholder="Tài liệu bài học (hỗ trợ Markdown)" value={form.material} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="shortAnswer">Trả lời ngắn</Label>
                        <Textarea id="shortAnswer" name="shortAnswer" placeholder="Câu hỏi trả lời ngắn (hỗ trợ Markdown)" value={form.shortAnswer} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="multipleChoice">Trắc nghiệm (MCQ)</Label>
                        <Textarea id="multipleChoice" name="multipleChoice" placeholder="Câu hỏi trắc nghiệm (hỗ trợ Markdown hoặc JSON)" value={form.multipleChoice} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="summaryTask">Nhiệm vụ tóm tắt</Label>
                        <Textarea id="summaryTask" name="summaryTask" placeholder="Nhiệm vụ tóm tắt (hỗ trợ Markdown)" value={form.summaryTask} onChange={handleChange} />
                    </div>
                </div>
                <Button className="w-full" onClick={handleSave} disabled={submitting}>
                    {submitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang lưu...
                        </>
                    ) : (
                        lesson ? 'Cập nhật bài học' : 'Tạo bài học mới'
                    )}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
'use client';

import { useForm } from 'react-hook-form';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useState, useEffect } from 'react'; // Import useEffect
import ReactMarkdown from 'react-markdown';
import { Loader2 } from 'lucide-react';

interface LessonFormData {
    lessonIdea: string;
    courseTitle: string;
    title: string;
    youtubeVideoId: string;
    recallQuestion: string;
    material: string;
    shortAnswer: string;
    multipleChoice: string;
    summaryTask: string;
    lessonOrder: number; // ✅ Thêm trường lessonOrder
}

export default function AddNewLessonAiDialog({
                                                 children,
                                                 courseId,
                                                 courseTitle,
                                                 onLessonCreated,
                                             }: {
    children: React.ReactNode;
    courseId: string;
    courseTitle: string;
    onLessonCreated?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);
    const [initialLessonOrder, setInitialLessonOrder] = useState(1); // State để lưu thứ tự bài học gợi ý

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<LessonFormData>({
        defaultValues: {
            lessonIdea: '',
            courseTitle: courseTitle,
            title: '',
            youtubeVideoId: '',
            recallQuestion: '',
            material: '',
            shortAnswer: '',
            multipleChoice: '',
            summaryTask: '',
            lessonOrder: 1, // Khởi tạo mặc định
        },
    });

    const watchedMaterial = watch('material');
    const watchedMultipleChoice = watch('multipleChoice');

    // ✅ useEffect để tải số lượng bài học hiện có khi dialog mở
    useEffect(() => {
        const fetchLessonCount = async () => {
            if (open) { // Chỉ fetch khi dialog mở
                try {
                    // Endpoint này cần được hỗ trợ bởi backend của bạn.
                    // Ví dụ: GET /teacher/courses/{courseId}/lessons (đã có)
                    // và sau đó lấy length của danh sách.
                    const response = await api.get(`/teacher/courses/${courseId}/lessons`);
                    const currentLessonsCount = response.data.length;
                    const newOrder = currentLessonsCount + 1;
                    setInitialLessonOrder(newOrder); // Cập nhật state
                    setValue('lessonOrder', newOrder); // Set giá trị mặc định cho form
                } catch (error) {
                    console.error("Lỗi khi tải số lượng bài học:", error);
                    setInitialLessonOrder(1); // Mặc định là 1 nếu có lỗi
                    setValue('lessonOrder', 1); // Đặt lại mặc định nếu lỗi
                }
            } else {
                // Reset form và lessonOrder khi đóng dialog
                reset();
                setInitialLessonOrder(1); // Reset lại giá trị gợi ý
            }
        };

        fetchLessonCount();
    }, [open, courseId, setValue, reset]); // Thêm setValue và reset vào dependency array

    const handleGenerate = async () => {
        const idea = watch('lessonIdea');
        if (!idea.trim()) {
            toast.error('Vui lòng nhập ý tưởng bài học trước khi tạo bằng AI');
            return;
        }

        setLoadingAI(true);
        // Reset các trường nội dung bài học khi bắt đầu sinh AI mới
        setValue('title', '');
        setValue('youtubeVideoId', '');
        setValue('recallQuestion', '');
        setValue('material', '');
        setValue('shortAnswer', '');
        setValue('multipleChoice', '');
        setValue('summaryTask', '');


        try {
            const res = await api.post('/teacher/ai/generate-lesson', { lessonIdea: idea, courseTitle: courseTitle });
            const data = res.data;
            setValue('title', data.title);
            setValue('youtubeVideoId', data.youtubeVideoId || '');
            setValue('recallQuestion', data.recallQuestion);
            setValue('material', data.material);
            setValue('shortAnswer', data.shortAnswer);
            setValue('multipleChoice', data.multipleChoice);
            setValue('summaryTask', data.summaryTask);
            toast.success('Nội dung bài học đã được tạo tự động!');
        } catch (err: any) {
            console.error("Error generating lesson with AI:", err);
            toast.error(err.response?.data?.message || 'Lỗi khi tạo nội dung bài học bằng AI. Vui lòng kiểm tra console.');
        } finally {
            setLoadingAI(false);
        }
    };


    const onSubmit = async (data: LessonFormData) => {
        if (!data.title || !data.material) {
            toast.error('Tiêu đề và nội dung bài học là bắt buộc.');
            return;
        }

        try {
            const payload = {
                title: data.title,
                youtubeVideoId: data.youtubeVideoId.trim() === '' ? null : data.youtubeVideoId.trim(),
                recallQuestion: data.recallQuestion,
                material: data.material,
                shortAnswer: data.shortAnswer,
                multipleChoice: data.multipleChoice,
                summaryTask: data.summaryTask,
                lessonOrder: data.lessonOrder, // ✅ Gửi lessonOrder từ form
                // Các trường boolean (nếu backend yêu cầu trong LessonRequest)
                isRecallQuestionCompleted: false,
                isMaterialCompleted: false,
                isShortAnswerCompleted: false,
                isMultipleChoiceCompleted: false,
                isSummaryTaskCompleted: false,
                isLessonCompleted: false,
            };

            await api.post(`/teacher/courses/${courseId}/lessons`, payload);
            toast.success('Bài học đã được tạo thành công!');
            setOpen(false); // Đóng dialog
            // reset(); // Không reset ở đây vì đã có useEffect xử lý khi open = false
            onLessonCreated?.();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Tạo bài học thất bại');
        }
    };

    const renderMultipleChoice = (jsonString: string) => {
        try {
            const questions = JSON.parse(jsonString);
            if (!Array.isArray(questions)) return <p className="text-red-500">Định dạng trắc nghiệm không hợp lệ.</p>;

            return (
                <div className="space-y-4">
                    {questions.map((q, index) => (
                        <div key={index} className="border p-4 rounded-md bg-gray-50">
                            <p className="font-semibold mb-2">Câu hỏi {index + 1}: {q.question}</p>
                            <ul className="list-disc pl-5">
                                {q.options && q.options.map((opt: string, i: number) => (
                                    <li key={i}>{opt}</li>
                                ))}
                            </ul>
                            <p className="mt-2 text-green-700">**Đáp án đúng:** {q.correctAnswer}</p>
                        </div>
                    ))}
                </div>
            );
        } catch (e) {
            return <p className="text-red-500">Không thể hiển thị trắc nghiệm (lỗi JSON).</p>;
        }
    };


    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[700px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>Tạo bài học bằng AI</DialogTitle>
                    <DialogDescription>
                        Nhập ý tưởng để AI tạo nội dung, sau đó bạn có thể chỉnh sửa.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="lessonIdea">Ý tưởng bài học</Label>
                        <div className="flex gap-2">
                            <Input
                                id="lessonIdea"
                                {...register('lessonIdea', { required: 'Vui lòng nhập ý tưởng bài học' })}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !loadingAI) {
                                        e.preventDefault();
                                        handleGenerate();
                                    }
                                }}
                            />
                            <Button type="button" onClick={handleGenerate} disabled={loadingAI}>
                                {loadingAI ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang sinh...
                                    </>
                                ) : (
                                    'Tạo với AI'
                                )}
                            </Button>
                        </div>
                        {errors.lessonIdea && (
                            <span className="text-red-500 text-sm">{errors.lessonIdea.message as string}</span>
                        )}
                    </div>

                    {/* ✅ Thêm trường Input cho lessonOrder */}
                    <div className="grid gap-2">
                        <Label htmlFor="lessonOrder">Thứ tự bài học</Label>
                        <Input
                            id="lessonOrder"
                            type="number"
                            {...register('lessonOrder', {
                                required: 'Thứ tự bài học là bắt buộc',
                                valueAsNumber: true, // Quan trọng để đảm bảo giá trị là số
                                min: 1, // Thứ tự bài học ít nhất là 1
                            })}
                            placeholder="Thứ tự hiển thị của bài học"
                            // Mặc định giá trị được set bởi useEffect
                        />
                        {errors.lessonOrder && (
                            <span className="text-red-500 text-sm">{errors.lessonOrder.message as string}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Tiêu đề bài học</Label>
                        <Input {...register('title', { required: 'Vui lòng nhập tiêu đề bài học' })} />
                        {errors.title && (
                            <span className="text-red-500 text-sm">{errors.title.message as string}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>YouTube Video ID (tùy chọn)</Label>
                        <Input {...register('youtubeVideoId')} placeholder="Ví dụ: dQw4w9WgXcQ" />
                    </div>

                    <div className="grid gap-2">
                        <Label>Câu hỏi gợi nhớ</Label>
                        <Textarea {...register('recallQuestion', { required: 'Vui lòng nhập câu hỏi gợi nhớ' })} />
                        {errors.recallQuestion && (
                            <span className="text-red-500 text-sm">{errors.recallQuestion.message as string}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Nội dung bài học (Markdown)</Label>
                        <Textarea {...register('material', { required: 'Vui lòng nhập nội dung bài học' })} rows={10} />
                        {errors.material && (
                            <span className="text-red-500 text-sm">{errors.material.message as string}</span>
                        )}
                        <div className="border rounded-md p-4 bg-gray-50 max-h-60 overflow-y-auto">
                            <h4 className="font-semibold mb-2">Xem trước nội dung:</h4>
                            <div className="prose max-w-none">
                                <ReactMarkdown>{watchedMaterial}</ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Câu hỏi trả lời ngắn</Label>
                        <Textarea {...register('shortAnswer', { required: 'Vui lòng nhập câu hỏi trả lời ngắn' })} />
                        {errors.shortAnswer && (
                            <span className="text-red-500 text-sm">{errors.shortAnswer.message as string}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Câu hỏi trắc nghiệm (JSON)</Label>
                        <Textarea {...register('multipleChoice', { required: 'Vui lòng nhập câu hỏi trắc nghiệm' })} rows={5} />
                        {errors.multipleChoice && (
                            <span className="text-red-500 text-sm">{errors.multipleChoice.message as string}</span>
                        )}
                        <div className="border rounded-md p-4 bg-gray-50 max-h-60 overflow-y-auto">
                            <h4 className="font-semibold mb-2">Xem trước trắc nghiệm:</h4>
                            {renderMultipleChoice(watchedMultipleChoice)}
                        </div>
                        <p className="text-sm text-gray-500">
                            Định dạng JSON yêu cầu:{" "}
                            <code>{`[{ "question": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }]`}</code>
                        </p>
                    </div>

                    <div className="grid gap-2">
                        <Label>Nhiệm vụ tóm tắt</Label>
                        <Textarea {...register('summaryTask', { required: 'Vui lòng nhập nhiệm vụ tóm tắt' })} />
                        {errors.summaryTask && (
                            <span className="text-red-500 text-sm">{errors.summaryTask.message as string}</span>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Đang tạo...
                                </>
                            ) : (
                                'Tạo bài học'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
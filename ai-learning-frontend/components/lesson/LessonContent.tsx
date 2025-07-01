'use client';
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import {
    CheckCircle, Lightbulb, Edit, ListChecks, FileText,
    Type, ChevronLeft, ChevronRight, PlayCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// Import YouTubePlayer (chúng ta sẽ cần đảm bảo component này responsive)
import YouTubePlayer from '@/components/lesson/YoutubePlayer';
import MCQViewer from "@/components/lesson/MCQViewer";

interface LessonResponse {
    id: string;
    title: string;
    recallQuestion: string;
    material: string;
    shortAnswer: string;
    multipleChoice: string;
    summaryTask: string;
    youtubeVideoId?: string;
    isRecallQuestionCompleted?: boolean;
    isMaterialCompleted?: boolean;
    isShortAnswerCompleted?: boolean;
    isMultipleChoiceCompleted?: boolean;
    isSummaryTaskCompleted?: boolean;
    isLessonCompleted?: boolean;
    courseId?: string;
}

interface LessonContentProps {
    lesson: LessonResponse | null;
    onNextLesson?: () => void;
    onPreviousLesson?: () => void;
    hasNextLesson: boolean;
    hasPreviousLesson: boolean;
}

function LessonContent({
                           lesson,
                           onNextLesson,
                           onPreviousLesson,
                           hasNextLesson,
                           hasPreviousLesson,
                       }: LessonContentProps) {
    const topRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [lesson?.id]);

    if (!lesson) {
        return (
            <div className="p-10 text-gray-500 italic flex justify-center items-center h-[60vh] border rounded-md bg-white shadow-md">
                Vui lòng chọn một bài học để xem nội dung.
            </div>
        );
    }

    // `renderMultipleChoice` của bạn đã rất tốt, giữ nguyên.
    // Tôi sẽ giả định rằng MCQViewer đã xử lý việc parse và render dữ liệu `multipleChoice` JSON string.

    return (
        <div ref={topRef} className="space-y-8 pb-10">
            <h1 className="font-extrabold text-4xl sm:text-5xl text-blue-900 text-center mb-10 leading-tight">
                {lesson.title}
            </h1>

            {/* Bước 1: Câu hỏi gợi nhớ */}
            {lesson.recallQuestion && (
                <Card className="border-l-4 border-purple-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-purple-800 flex items-center">
                            <Lightbulb className="w-7 h-7 mr-3 text-purple-600" /> Câu hỏi gợi nhớ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-lg max-w-none">
                            <ReactMarkdown>{lesson.recallQuestion}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bước 2: Tài liệu bài học */}
            {lesson.material && (
                <Card className="border-l-4 border-green-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-green-800 flex items-center">
                            <FileText className="w-7 h-7 mr-3 text-green-600" /> Tài liệu bài học
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-lg max-w-none">
                            {/* ✅ SỬA LỖI: Hiển thị đúng lesson.material */}
                            <ReactMarkdown>{lesson.material}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Video */}
            {lesson.youtubeVideoId && (
                <div className="border rounded-md shadow-lg p-6 bg-white">
                    <h3 className="font-bold text-2xl text-gray-800 mb-4 flex items-center">
                        <PlayCircle className="w-7 h-7 mr-3 text-red-600" /> Xem video
                    </h3>
                    {/* YouTubePlayer ở đây sẽ nhận được width: 100% từ div cha này */}
                    <YouTubePlayer videoId={lesson.youtubeVideoId} />
                </div>
            )}

            {/* Bước 3: Câu hỏi trả lời ngắn */}
            {lesson.shortAnswer && (
                <Card className="border-l-4 border-yellow-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-yellow-800 flex items-center">
                            <Edit className="w-7 h-7 mr-3 text-yellow-600" /> Câu hỏi trả lời ngắn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-lg max-w-none">
                            {/* ✅ SỬA LỖI: Hiển thị đúng lesson.shortAnswer */}
                            <ReactMarkdown>{lesson.shortAnswer}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bước 4: Câu hỏi trắc nghiệm (MCQViewer đã xử lý) */}
            {lesson.multipleChoice && (
                <Card className="border-l-4 border-blue-600 shadow-lg"> {/* Màu xanh dương cho trắc nghiệm */}
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-blue-800 flex items-center">
                            <ListChecks className="w-7 h-7 mr-3 text-blue-600" /> Câu hỏi trắc nghiệm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* MCQViewer đã nhận dữ liệu JSON string, nên không cần renderMultipleChoice ở đây */}
                        <MCQViewer
                            data={lesson.multipleChoice}
                            lessonId={lesson.id} // Đảm bảo truyền lessonId nếu cần cho logic bên trong MCQViewer
                        />
                    </CardContent>
                </Card>
            )}

            {/* Bước 5: Nhiệm vụ tóm tắt */}
            {lesson.summaryTask && (
                <Card className="border-l-4 border-orange-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold text-orange-800 flex items-center">
                            <Type className="w-7 h-7 mr-3 text-orange-600" /> Nhiệm vụ tóm tắt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="prose prose-lg max-w-none">
                            {/* ✅ SỬA LỖI: Hiển thị đúng lesson.summaryTask */}
                            <ReactMarkdown>{lesson.summaryTask}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Nút điều hướng */}
            <div className="flex justify-between mt-10">
                <Button
                    onClick={onPreviousLesson}
                    disabled={!hasPreviousLesson}
                    variant="outline"
                    className="flex items-center gap-2 text-lg px-6 py-3"
                >
                    <ChevronLeft className="h-5 w-5" /> Bài học trước
                </Button>
                <Button
                    onClick={onNextLesson}
                    disabled={!hasNextLesson}
                    variant="default"
                    className="flex items-center gap-2 text-lg px-6 py-3"
                >
                    Bài học tiếp theo <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

export default LessonContent;
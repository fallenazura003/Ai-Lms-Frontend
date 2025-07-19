'use client';
import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import {
     Lightbulb, Edit, ListChecks, FileText,
    Type, ChevronLeft, ChevronRight, PlayCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
            <div className="p-4 sm:p-10 text-gray-500 italic flex justify-center items-center h-[50vh] sm:h-[60vh] border rounded-md bg-white shadow-md mx-4 md:mx-0"> {/* ✅ Responsive height và margin ngang */}
                Vui lòng chọn một bài học để xem nội dung.
            </div>
        );
    }

    return (
        <div ref={topRef} className="space-y-6 sm:space-y-8 pb-10 px-4 md:px-0"> {/* ✅ Responsive spacing và padding ngang */}
            <h1 className="font-extrabold text-3xl sm:text-4xl lg:text-5xl text-blue-900 text-center mb-6 sm:mb-10 leading-tight"> {/* ✅ Responsive font size và margin */}
                {lesson.title}
            </h1>

            {/* Bước 1: Câu hỏi gợi nhớ */}
            {lesson.recallQuestion && (
                <Card className="border-l-4 border-purple-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-purple-800 flex items-center"> {/* ✅ Responsive font size */}
                            <Lightbulb className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" /> Câu hỏi gợi nhớ {/* ✅ Responsive icon size */}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6"> {/* ✅ Responsive padding */}
                        <div className="prose prose-sm sm:prose-lg max-w-none"> {/* ✅ Responsive prose size */}
                            <ReactMarkdown>{lesson.recallQuestion}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bước 2: Tài liệu bài học */}
            {lesson.material && (
                <Card className="border-l-4 border-green-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-green-800 flex items-center">
                            <FileText className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-green-600" /> Tài liệu bài học
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="prose prose-sm sm:prose-lg max-w-none">
                            <ReactMarkdown>{lesson.material}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Video */}
            {lesson.youtubeVideoId && (
                <div className="border rounded-md shadow-lg p-4 sm:p-6 bg-white"> {/* ✅ Responsive padding */}
                    <h3 className="font-bold text-xl sm:text-2xl text-gray-800 mb-3 sm:mb-4 flex items-center"> {/* ✅ Responsive font size và margin */}
                        <PlayCircle className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-red-600" /> Xem video
                    </h3>
                    <YouTubePlayer videoId={lesson.youtubeVideoId} />
                </div>
            )}

            {/* Bước 3: Câu hỏi trả lời ngắn */}
            {lesson.shortAnswer && (
                <Card className="border-l-4 border-yellow-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-yellow-800 flex items-center">
                            <Edit className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-yellow-600" /> Câu hỏi trả lời ngắn
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="prose prose-sm sm:prose-lg max-w-none">
                            <ReactMarkdown>{lesson.shortAnswer}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Bước 4: Câu hỏi trắc nghiệm (MCQViewer đã xử lý) */}
            {lesson.multipleChoice && (
                <Card className="border-l-4 border-blue-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-blue-800 flex items-center">
                            <ListChecks className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" /> Câu hỏi trắc nghiệm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <MCQViewer
                            data={lesson.multipleChoice}
                            lessonId={lesson.id}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Bước 5: Nhiệm vụ tóm tắt */}
            {lesson.summaryTask && (
                <Card className="border-l-4 border-orange-600 shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-xl sm:text-2xl font-bold text-orange-800 flex items-center">
                            <Type className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-orange-600" /> Nhiệm vụ tóm tắt
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6">
                        <div className="prose prose-sm sm:prose-lg max-w-none">
                            <ReactMarkdown>{lesson.summaryTask}</ReactMarkdown>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Nút điều hướng */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6 sm:mt-10"> {/* ✅ Flex direction và gap */}
                <Button
                    onClick={onPreviousLesson}
                    disabled={!hasPreviousLesson}
                    variant="outline"
                    className="flex items-center justify-center gap-2 text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto" // ✅ Responsive width, font, padding
                >
                    <ChevronLeft className="h-5 w-5" /> Bài học trước
                </Button>
                <Button
                    onClick={onNextLesson}
                    disabled={!hasNextLesson}
                    variant="default"
                    className="flex items-center justify-center gap-2 text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 w-full sm:w-auto" // ✅ Responsive width, font, padding
                >
                    Bài học tiếp theo <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
    );
}

export default LessonContent;
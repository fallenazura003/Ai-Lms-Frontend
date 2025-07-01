// app/course/_components/LessonListSidebar.tsx
"use client";
import React from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText, HelpCircle, MessageCircle, CheckSquare, ListTodo, CheckCircle } from 'lucide-react';

// Import LessonResponse từ định nghĩa chung của bạn
interface LessonResponse {
    id: string;
    title: string;
    recallQuestion: string;
    material: string;
    shortAnswer: string;
    multipleChoice: string;
    summaryTask: string;
    youtubeVideoId?: string;
    isRecallQuestionCompleted?: boolean; // Thêm trường này
    isMaterialCompleted?: boolean;     // Thêm trường này
    isShortAnswerCompleted?: boolean;  // Thêm trường này
    isMultipleChoiceCompleted?: boolean; // Thêm trường này
    isSummaryTaskCompleted?: boolean;  // Thêm trường này
    isLessonCompleted?: boolean; // Thêm trường này (có thể là optional nếu không phải lúc nào cũng có)
    courseId?: string; // Thêm trường này (có thể là optional nếu không phải lúc nào cũng có)
}


interface LessonListSidebarProps {
    lessons: LessonResponse[];
    activeLessonId: string | null;
    onLessonClick: (lesson: LessonResponse) => void;
}

function LessonListSidebar({
                               lessons,
                               activeLessonId,
                               onLessonClick,
                           }: LessonListSidebarProps) {

    const activeLessonIndex = lessons.findIndex(l => l.id === activeLessonId);
    const defaultAccordionValue = activeLessonIndex !== -1 ? `item-${activeLessonIndex}` : (lessons.length > 0 ? `item-0` : undefined);

    const renderStepButton = (
        lesson: LessonResponse,
        stepKey: keyof LessonResponse, // Key của trường nội dung
        icon: React.ElementType,
        label: string,
        isCompletedKey: keyof LessonResponse // Thêm key cho trạng thái hoàn thành
    ) => {
        // Kiểm tra nếu trường nội dung là chuỗi rỗng thì không render
        if (typeof lesson[stepKey] === 'string' && !lesson[stepKey]) return null;

        // Ép kiểu để truy cập thuộc tính boolean
        const isCompleted = (lesson[isCompletedKey] as boolean) || false;

        return (
            <Button
                variant="ghost"
                size="sm"
                className="justify-start text-sm text-gray-600 hover:text-blue-600 w-full"
                onClick={() => onLessonClick(lesson)}
            >
                {React.createElement(icon, { className: "w-4 h-4 mr-2" })}
                {label}
                {isCompleted && <CheckCircle className="w-4 h-4 ml-auto text-green-500" />}
            </Button>
        );
    };

    return (
        <div className="w-80 bg-secondary h-[calc(100vh-64px)] p-5 overflow-y-auto border-r shadow-sm flex-shrink-0">
            <h2 className="my-3 font-bold text-xl text-gray-800">📚 Danh sách bài học</h2>
            <Accordion type="single" collapsible defaultValue={defaultAccordionValue}>
                {lessons.map((lesson, index) => (
                    <AccordionItem value={`item-${index}`} key={lesson.id}>
                        <AccordionTrigger
                            className={`text-lg font-medium text-left flex items-center justify-between px-4 py-3 rounded-md transition-colors duration-200 ${
                                activeLessonId === lesson.id
                                    ? "bg-blue-100 text-blue-800 font-semibold"
                                    : "text-gray-700 hover:bg-gray-100"
                            }`}
                        >
                            <div className="flex items-center">
                                {lesson.isLessonCompleted ? (
                                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                                ) : lesson.youtubeVideoId ? (
                                    <PlayCircle className="w-5 h-5 mr-2 text-red-500" />
                                ) : (
                                    <FileText className="w-5 h-5 mr-2 text-gray-500" />
                                )}
                                {lesson.title}
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="flex flex-col gap-1 py-1 px-4 border-l-2 border-blue-200 ml-2">
                                {/* Sử dụng key cho trạng thái hoàn thành */}
                                {renderStepButton(lesson, 'recallQuestion', HelpCircle, 'Câu hỏi gợi nhớ', 'isRecallQuestionCompleted')}
                                {renderStepButton(lesson, 'material', FileText, 'Tài liệu bài học', 'isMaterialCompleted')}
                                {renderStepButton(lesson, 'shortAnswer', MessageCircle, 'Trả lời ngắn', 'isShortAnswerCompleted')}
                                {renderStepButton(lesson, 'multipleChoice', CheckSquare, 'Trắc nghiệm', 'isMultipleChoiceCompleted')}
                                {renderStepButton(lesson, 'summaryTask', ListTodo, 'Nhiệm vụ tóm tắt', 'isSummaryTaskCompleted')}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                ))}
            </Accordion>
            <div className="mt-8 p-4 bg-blue-50 rounded-md border border-blue-200 text-sm text-blue-800">
                <p className="font-semibold">Cần nghỉ ngơi?</p>
                <p className="mt-1">Hãy làm một bài kiểm tra nhanh để kiểm tra kiến thức của bạn!</p>
                <Button className="mt-4 w-full" variant="secondary" onClick={() => {/* Handle Start Quiz */}}>
                    <PlayCircle className="mr-2 h-4 w-4" /> Bắt đầu bài kiểm tra
                </Button>
            </div>
        </div>
    );
}

export default LessonListSidebar;
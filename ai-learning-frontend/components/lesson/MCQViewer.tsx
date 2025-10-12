'use client';

import React, { useState, useEffect, useCallback } from "react";
import {
    loadSavedAnswersApi,
    saveQuizAnswerApi,
    LoadQuizAnswersResponse,
    QuizAnswerResponse, SaveQuizAnswerRequest
} from '@/lib/studentQuizApi'; // ✅ Đã sửa đường dẫn: @/lib/studentQuizApi -> ../../lib/studentQuizApi
import { useAuth } from '@/store/auth'; // ✅ Đã sửa đường dẫn: @/store/auth -> ../../store/auth

interface MCQQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface MCQViewerProps {
    data: string; // JSON string of MCQs
    lessonId: string;
}

const MCQViewer: React.FC<MCQViewerProps> = ({ data, lessonId }) => { // ✅ Nhận lessonId
    const { role } = useAuth(); // Lấy role để chỉ cho phép học sinh tương tác
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    // Map lưu trữ key là index câu hỏi, value là lựa chọn (option content)
    const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({});
    const [isLoadingAnswers, setIsLoadingAnswers] = useState(true);

    // Dùng Map để chuyển đổi câu trả lời đã lưu từ API sang định dạng dễ truy cập
    const mapSavedAnswers = useCallback((answers: QuizAnswerResponse[]): { [key: string]: string } => {
        // Chuyển đổi từ QuestionId (Backend) sang Index (Frontend) và Option Content
        // Lấy toàn bộ câu hỏi để map ID
        const currentQuestions: MCQQuestion[] = JSON.parse(data);

        const answerMap: { [index: number]: string } = {};

        answers.forEach(answer => {
            // Giả định questionId ở Backend là 'Q1', 'Q2',... tương ứng với index 0, 1,...
            if (answer.questionId.startsWith('Q')) {
                const questionIndex = parseInt(answer.questionId.substring(1)) - 1;

                // Lấy nội dung của lựa chọn đã chọn (selectedOptionId)
                const selectedOptionContent = currentQuestions[questionIndex]?.options.find(
                    opt => opt === answer.selectedOptionId // Giả định selectedOptionId chính là nội dung lựa chọn
                );

                if (selectedOptionContent) {
                    answerMap[questionIndex] = selectedOptionContent;
                }
            }
        });
        return answerMap;
    }, [data]);


    // 1. Phân tích JSON và Tải câu trả lời đã lưu
    useEffect(() => {
        if (!data || !lessonId || role !== 'STUDENT') {
            setQuestions([]);
            setSelectedAnswers({});
            setIsLoadingAnswers(false);
            return;
        }

        try {
            const parsed: MCQQuestion[] = JSON.parse(data);
            if (Array.isArray(parsed)) {
                setQuestions(parsed);

                // Tải câu trả lời đã lưu
                const loadAnswers = async () => {
                    setIsLoadingAnswers(true);
                    const loadedData = await loadSavedAnswersApi(lessonId);
                    const mappedAnswers = mapSavedAnswers(loadedData.answers);
                    setSelectedAnswers(mappedAnswers);
                    setIsLoadingAnswers(false);
                };

                loadAnswers();
            }
        } catch (e) {
            console.error("Invalid MCQ JSON:", e);
            setQuestions([]);
            setIsLoadingAnswers(false);
        }
    }, [data, lessonId, role, mapSavedAnswers]);


    // 2. Xử lý lưu câu trả lời khi người dùng chọn
    const handleSelect = (index: number, option: string) => {
        if (role !== 'STUDENT' || selectedAnswers[index] != null) return;

        // Cập nhật state cục bộ
        setSelectedAnswers(prev => ({ ...prev, [index]: option }));

        // Chuẩn bị dữ liệu để gửi lên Backend
        const questionId = `Q${index + 1}`; // Tạo ID câu hỏi (Q1, Q2,...)
        const selectedOptionId = option; // Nội dung lựa chọn được coi là ID lựa chọn

        const request: SaveQuizAnswerRequest = {
            questionId: questionId,
            selectedOptionId: selectedOptionId,
            // rawAnswerJson có thể để trống hoặc thêm vào nếu cần lưu context chi tiết hơn
        };

        // Gọi API để lưu vào MySQL
        saveQuizAnswerApi(lessonId, request);
    };

    if (isLoadingAnswers && role === 'STUDENT') {
        return (
            <div className="p-4 text-center text-gray-500">
                Đang tải câu trả lời đã lưu...
            </div>
        )
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            {questions.map((q, index) => {
                const selected = selectedAnswers[index] || null;
                // Tìm đáp án đúng bằng cách so sánh nội dung lựa chọn
                const correctOptionContent = q.options[q.correctAnswer.charCodeAt(0) - 65];

                const isCorrect = selected === correctOptionContent;
                const showResult = selected !== null;

                return (
                    <div
                        key={index}
                        className="p-4 sm:p-5 border rounded-md bg-gray-50 shadow-sm space-y-2 sm:space-y-3"
                    >
                        <p className="font-semibold text-base sm:text-lg text-gray-800">
                            Câu hỏi {index + 1}: {q.question}
                        </p>
                        <ul className="space-y-1 sm:space-y-2">
                            {q.options.map((opt, i) => {
                                const isSelected = selected === opt;

                                // Nếu đã chọn hoặc là Teacher, không cho phép tương tác
                                const isClickable = role === 'STUDENT' && !showResult;

                                let optionClass = "px-3 py-2 sm:px-4 sm:py-2 border rounded-md text-sm sm:text-base transition-colors duration-200";

                                if (showResult) {
                                    if (opt === correctOptionContent) {
                                        optionClass += " bg-green-100 text-green-800 border-green-300 shadow-inner";
                                    } else if (isSelected) {
                                        optionClass += " bg-red-100 text-red-800 border-red-300 shadow-inner";
                                    } else {
                                        optionClass += " bg-white text-gray-600 opacity-70";
                                    }
                                } else if (isClickable) {
                                    optionClass += " cursor-pointer hover:bg-blue-50 hover:border-blue-300";
                                } else {
                                    optionClass += " cursor-default bg-white text-gray-600 opacity-80";
                                }

                                return (
                                    <li
                                        key={i}
                                        className={optionClass}
                                        onClick={() => isClickable && handleSelect(index, opt)}
                                    >
                                        <span className="font-bold mr-1 sm:mr-2">{String.fromCharCode(65 + i)}.</span>
                                        {opt}
                                    </li>
                                );
                            })}
                        </ul>

                        {showResult && (
                            <div className="mt-2 p-2 rounded-md border text-xs sm:text-sm">
                                {isCorrect ? (
                                    <p className="text-green-700 font-semibold flex items-center gap-1">
                                        <span className="text-lg">✅</span> Chính xác!
                                    </p>
                                ) : (
                                    <p className="text-red-600 font-semibold flex items-center gap-1">
                                        <span className="text-lg">❌</span> Sai. Đáp án đúng là: <span className="text-green-700 font-bold">{q.correctAnswer} - {correctOptionContent}</span>
                                    </p>
                                )}
                            </div>
                        )}
                        {/* Hiển thị một message cho Teacher */}
                        {role === 'TEACHER' && (
                            <p className="text-xs text-blue-500 italic mt-2">
                                (Teacher Mode: Học sinh sẽ thấy kết quả ngay sau khi chọn đáp án đầu tiên)
                            </p>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MCQViewer;

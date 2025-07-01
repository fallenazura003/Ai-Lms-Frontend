"use client";

import React, { useState, useEffect } from "react";

interface MCQQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
}

interface MCQViewerProps {
    data: string; // JSON string of MCQs
    lessonId: string;
}

const MCQViewer: React.FC<MCQViewerProps> = ({ data }) => {
    const [questions, setQuestions] = useState<MCQQuestion[]>([]);
    const [selectedAnswers, setSelectedAnswers] = useState<{ [index: number]: string }>({});

    useEffect(() => {
        try {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed)) {
                setQuestions(parsed);
                setSelectedAnswers({}); // Reset answers mỗi lần có dữ liệu mới
            }
        } catch (e) {
            console.error("Invalid MCQ JSON:", e);
        }
    }, [data]);

    const handleSelect = (index: number, option: string) => {
        if (selectedAnswers[index] != null) return; // Không cho đổi khi đã chọn
        setSelectedAnswers(prev => ({ ...prev, [index]: option }));
    };

    return (
        <div className="space-y-6">
            {questions.map((q, index) => {
                const selected = selectedAnswers[index] || null;
                const isCorrect = selected === q.options[q.correctAnswer.charCodeAt(0) - 65];
                const showResult = selected !== null;

                return (
                    <div
                        key={index}
                        className="p-5 border rounded-md bg-gray-50 shadow-sm space-y-3"
                    >
                        <p className="font-semibold text-lg text-gray-800">
                            Câu hỏi {index + 1}: {q.question}
                        </p>
                        <ul className="space-y-2">
                            {q.options.map((opt, i) => {
                                const isSelected = selected === opt;
                                const optionClass = [
                                    "px-4 py-2 border rounded-md cursor-pointer",
                                    showResult
                                        ? opt === q.correctAnswer
                                            ? "bg-green-100 text-green-800 border-green-300"
                                            : isSelected
                                                ? "bg-red-100 text-red-800 border-red-300"
                                                : "bg-white text-gray-600 opacity-70"
                                        : "hover:bg-gray-100"
                                ].join(" ");

                                return (
                                    <li
                                        key={i}
                                        className={optionClass}
                                        onClick={() => handleSelect(index, opt)}
                                    >
                                        <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>
                                        {opt}
                                    </li>
                                );
                            })}
                        </ul>

                        {showResult && (
                            <div className="mt-2 text-sm">
                                {isCorrect ? (
                                    <p className="text-green-700 font-semibold">
                                        ✅ Chính xác! Đáp án đúng là: {q.correctAnswer}
                                    </p>
                                ) : (
                                    <p className="text-red-600 font-semibold">
                                        ❌ Sai. Đáp án đúng là: {q.correctAnswer}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default MCQViewer;

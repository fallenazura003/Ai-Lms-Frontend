// app/course/_components/CourseLoading.tsx
"use client";
import React from 'react';

export default function CourseLoading() {
    return (
        <div className="w-full h-screen flex items-center justify-center">
            <div className="text-lg text-gray-600 animate-pulse">Đang tải khóa học...</div>
        </div>
    );
}
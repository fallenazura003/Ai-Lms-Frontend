'use client';
import { ProgressItem } from "@/store/useProgressStore";

interface CourseProgressBarProps {
    // Đã thay đổi prop nhận vào
    progress: ProgressItem | null;
}

export default function CourseProgressBar({ progress }: CourseProgressBarProps) {
    const percent = progress?.totalLessons
        ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
        : 0;

    return (
        <div className="border p-3 rounded mb-4 bg-white shadow-sm">
            <h3 className="font-bold text-lg text-gray-800">Tiến độ khóa học</h3>
            {progress ? (
                <>
                    <p className="text-gray-600 my-2">
                        {progress.completedLessons}/{progress.totalLessons} bài học ({percent}%)
                    </p>
                    <progress
                        className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-value]:bg-green-500"
                        value={progress.completedLessons}
                        max={progress.totalLessons}
                    ></progress>
                </>
            ) : (
                <p className="text-gray-500 italic">Khóa học này chưa có tiến độ.</p>
            )}
        </div>
    );
}

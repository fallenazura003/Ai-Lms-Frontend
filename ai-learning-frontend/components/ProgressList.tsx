'use client';
import { useEffect } from "react";
import { useProgressStore } from "@/store/useProgressStore";

export default function ProgressList() {
    const { progressList, fetchProgress } = useProgressStore();

    useEffect(() => {
        fetchProgress();
    }, [fetchProgress]);

    return (
        <div>
            <h2 className="text-lg font-bold mb-3">📚 Tiến độ học tập</h2>
            {progressList.length === 0 && <p>Chưa có khóa học nào.</p>}

            {progressList.map((p) => (
                <div key={p.id} className="border p-3 rounded mb-2">
                    <p className="font-semibold">{p.courseTitle}</p>
                    <p>Tiến độ: {p.completedLessons}/{p.totalLessons} ({p.percent}%)</p>
                    <progress className="w-full" value={p.completedLessons} max={p.totalLessons}></progress>
                    <p className="text-sm text-gray-500">Trạng thái: {p.status}</p>
                </div>
            ))}
        </div>
    );
}

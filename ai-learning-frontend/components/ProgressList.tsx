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
            <h2 className="text-lg font-bold">Tiến độ học tập</h2>
            {progressList.map((p) => (
                <div key={p.id} className="border p-2 rounded mb-2">
                    <p>Khóa học: {p.course?.title || 'Không rõ tên'}</p>
                    <p>Tiến độ: {p.completedLessons}/{p.totalLessons}</p>
                    <progress value={p.completedLessons} max={p.totalLessons}></progress>
                    <p>Trạng thái: {p.status}</p>
                </div>
            ))}
        </div>
    );
}

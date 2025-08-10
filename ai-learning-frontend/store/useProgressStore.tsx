import { create } from "zustand";
import api from "@/lib/api";

interface ProgressItem {
    id: string;
    student?: any;
    course?: { id: string; title?: string };
    completedLessons: number;
    totalLessons: number;
    status: string;
    completedLessonIds: string[];
}

type ProgressState = {
    progressList: ProgressItem[];
    fetchProgress: () => Promise<void>;
    fetchProgressByCourse: (courseId: string) => Promise<ProgressItem | null>;
    completeLesson: (courseId: string, lessonId: string) => Promise<void>;
};

export const useProgressStore = create<ProgressState>((set, get) => ({
    progressList: [],

    fetchProgress: async () => {
        try {
            const res = await api.get(`/student/progress`);
            set({ progressList: res.data || [] });
        } catch (error) {
            console.error("❌ Lỗi khi lấy tiến độ:", error);
            set({ progressList: [] });
        }
    },

    fetchProgressByCourse: async (courseId) => {
        try {
            const res = await api.get(`/student/progress/${courseId}`);
            return res.data || null;
        } catch (error) {
            console.error(`❌ Lỗi khi lấy tiến độ cho course ${courseId}:`, error);
            return null;
        }
    },

    completeLesson: async (courseId, lessonId) => {
        try {
            const res = await api.post(`/student/progress/complete-lesson`, {}, {
                params: { courseId, lessonId },
            });

            const updatedProgress: ProgressItem = res.data;
            set((state) => {
                const idx = state.progressList.findIndex(
                    (p) => p.course?.id === updatedProgress.course?.id
                );
                const newList = [...state.progressList];
                if (idx !== -1) {
                    newList[idx] = updatedProgress;
                } else {
                    newList.unshift(updatedProgress);
                }
                return { progressList: newList };
            });
        } catch (error) {
            console.error("❌ Lỗi khi hoàn thành bài học:", error);
        }
    },
}));

import { create } from "zustand";
import api from "@/lib/api";

export interface ProgressItem {
    id: string;
    courseId: string;
    courseTitle: string;
    completedLessons: number;
    totalLessons: number;
    percent: number;
    status: "IN_PROGRESS" | "COMPLETED";
    completedLessonIds: string[];
}

type ProgressState = {
    progressList: ProgressItem[];
    fetchProgress: () => Promise<void>;
    fetchProgressByCourse: (courseId: string) => Promise<ProgressItem | null>;
    completeLesson: (courseId: string, lessonId: string) => Promise<ProgressItem | null>;
    // Đã xóa hàm getResumeLesson
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

            const updated: ProgressItem = res.data;

            // ✅ Cập nhật list trong store ngay lập tức
            set((state) => {
                const idx = state.progressList.findIndex(p => p.courseId === updated.courseId);
                const newList = [...state.progressList];
                if (idx !== -1) {
                    newList[idx] = updated;
                } else {
                    newList.unshift(updated);
                }
                return { progressList: newList };
            });

            return updated;
        } catch (error) {
            console.error("❌ Lỗi khi hoàn thành bài học:", error);
            return null;
        }
    },

    // Đã xóa hàm getResumeLesson
}));

import api from './api'; // Giả định bạn có một instance axios được cấu hình tại '@/lib/api'
import { toast } from 'sonner';

// Định nghĩa kiểu dữ liệu (DTOs)
export interface SaveQuizAnswerRequest {
    questionId: string;
    selectedOptionId: string;
}

export interface QuizAnswerResponse {
    id: string;
    questionId: string;
    selectedOptionId: string;
    lessonId: string;
    userId: string;
}

export interface LoadQuizAnswersResponse {
    lessonId: string;
    answers: QuizAnswerResponse[];
}

/**
 * Tải tất cả các câu trả lời đã lưu của người dùng cho một bài học.
 */
export const loadSavedAnswersApi = async (lessonId: string): Promise<LoadQuizAnswersResponse> => {
    try {
        const response = await api.get(`/student/lessons/${lessonId}/quiz/answers`);
        return response.data;
    } catch (error) {
        // Log lỗi nhưng trả về cấu trúc rỗng để tránh crash UI
        console.error("Failed to load saved answers:", error);
        return { lessonId, answers: [] };
    }
};

/**
 * Lưu hoặc cập nhật một câu trả lời trắc nghiệm.
 */
export const saveQuizAnswerApi = async (lessonId: string, answer: SaveQuizAnswerRequest): Promise<QuizAnswerResponse | null> => {
    try {
        // Sử dụng POST (vì Backend đã được cấu hình để saveOrUpdate)
        const response = await api.post(`/student/lessons/${lessonId}/quiz/answers`, answer);
        // Không toast ở đây để tránh làm phiền người dùng khi họ chọn đáp án liên tục
        return response.data;
    } catch (error) {
        toast.error('Lưu câu trả lời thất bại. Vui lòng thử lại.');
        console.error("Failed to save quiz answer:", error);
        return null;
    }
};

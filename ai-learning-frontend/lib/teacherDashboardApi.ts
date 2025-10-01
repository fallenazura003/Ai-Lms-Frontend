// src/services/teacherDashboardApi.ts
import api from '@/lib/api'; // ✅ Sửa lại import instance axios để phù hợp với alias của Next.js

export interface TeacherDashboardStats {
    totalCoursesSold: number;
    totalPurchases: number;
    totalRevenue: number;
}

export interface PurchaseDetail {
    purchaseId: string;
    courseId: string;
    courseTitle: string;
    buyerName: string;
    buyerEmail: string;
    price: number;
    purchaseDate: string; // ISO string format
}

export interface BuyerDetail {
    userId: string;
    userName: string;
    userEmail: string;
    purchaseDate: string;
}

// Interface này mô tả cấu trúc phản hồi phân trang từ Spring Boot
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number; // current page number (0-indexed)
    size: number;

}
export interface RevenueChartDTO {
    year: number;
    month: number;
    totalRevenue: number;
    periodLabel: string;
}

export async function getRevenueChartData(): Promise<RevenueChartDTO[]> {
    const res = await api.get<RevenueChartDTO[]>('/teacher/dashboard/revenue-chart');
    return res.data;
}


export const getTeacherDashboardStats = async (): Promise<TeacherDashboardStats> => {
    const response = await api.get<TeacherDashboardStats>('/teacher/dashboard/stats');
    return response.data;
};

export const getDetailedPurchases = async (page: number, size: number): Promise<PageResponse<PurchaseDetail>> => {
    const response = await api.get<PageResponse<PurchaseDetail>>(`/teacher/dashboard/purchases?page=${page}&size=${size}`);
    return response.data;
};

export const getCourseBuyers = async (courseId: string): Promise<BuyerDetail[]> => {
    const response = await api.get<BuyerDetail[]>(`/teacher/dashboard/purchases/${courseId}/buyers`);
    return response.data;
};

export const exportPurchasesToExcel = async (): Promise<void> => {
    const response = await api.get('/teacher/dashboard/purchases/export-excel', {
        responseType: 'blob', // Quan trọng: nhận dạng phản hồi là một blob
    });

    // Tạo URL blob và tải xuống
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'purchase_details.xlsx'); // Tên file được tải xuống
    document.body.appendChild(link);
    link.click(); // Kích hoạt sự kiện click để tải file
    document.body.removeChild(link); // Xóa thẻ a sau khi tải xong
    window.URL.revokeObjectURL(url); // Giải phóng URL blob để tránh rò rỉ bộ nhớ
};
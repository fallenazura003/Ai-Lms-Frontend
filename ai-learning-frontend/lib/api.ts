// lib/api.ts
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
});

// ✅ Gắn token vào mọi request nếu có
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ✅ Xử lý lỗi 401/403 toàn cục
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
            console.warn("Token hết hạn hoặc bị từ chối, đang đăng xuất...");

            // Xóa localStorage (phòng trường hợp chưa logout được trong context)
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("status");

            // Chuyển hướng về login
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;

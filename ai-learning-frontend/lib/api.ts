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

        if (status === 401) {
            console.warn("Token hết hạn. Đăng xuất...");
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("status");
            if (typeof window !== "undefined") {
                window.location.href = "/";
            }
        } else if (status === 403) {
            console.warn("Không đủ quyền. Không redirect!");
        }

        return Promise.reject(error);
    }
);


export default api;

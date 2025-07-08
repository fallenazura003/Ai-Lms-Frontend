"use client";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import CourseCard from '@/components/course/CourseCard'; // component hiển thị khóa học
import { toast } from 'sonner'; // Để hiển thị thông báo lỗi

// Import component Pagination mới của bạn
import Pagination from '@/components/Pagination'; // Đảm bảo đường dẫn đúng đến component Pagination của bạn

// --- Định nghĩa các Interface phù hợp với DTO và phản hồi của Backend ---

// Định nghĩa CourseSummaryDTO ở frontend, khớp với CourseSummaryDTO của backend
interface CourseSummaryDTO {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string; // Đổi từ imageUrl sang thumbnail để khớp với DTO của bạn
    createdBy: string; // Tên của người tạo
    createdAt: string;
}

// Định nghĩa cấu trúc phản hồi Page của Spring Data JPA
interface PageResponse<T> {
    content: T[];          // Danh sách các phần tử trên trang hiện tại
    totalPages: number;    // Tổng số trang
    totalElements: number; // Tổng số phần tử
    number: number;        // Số trang hiện tại (0-indexed)
    size: number;          // Kích thước của trang
    first: boolean;        // Là trang đầu tiên hay không
    last: boolean;         // Là trang cuối cùng hay không
    empty: boolean;        // Trang có trống hay không
}

// --- Cập nhật SearchPage Component ---

export default function SearchPage() {
    const searchParams = useSearchParams();
    const keyword = searchParams.get('keyword') || ''; // Lấy từ khóa tìm kiếm
    const [searchResults, setSearchResults] = useState<CourseSummaryDTO[]>([]); // Lưu kết quả tìm kiếm
    const [loading, setLoading] = useState(false); // Trạng thái tải dữ liệu
    const [currentPage, setCurrentPage] = useState(0); // Trang hiện tại (0-indexed)
    const [totalPages, setTotalPages] = useState(0); // Tổng số trang

    // Hàm để lấy dữ liệu tìm kiếm từ API
    const fetchSearchResults = async (page: number) => {
        if (!keyword.trim()) {
            setSearchResults([]);
            setTotalPages(0);
            return;
        }

        setLoading(true);
        try {
            // Gửi yêu cầu GET đến API tìm kiếm của backend
            // Bao gồm tham số 'page' và 'size' cho phân trang
            const response = await api.get<PageResponse<CourseSummaryDTO>>(
                `/public/courses/search?q=${encodeURIComponent(keyword)}&page=${page}&size=8`
            );

            // Cập nhật state với dữ liệu từ phản hồi của API
            setSearchResults(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number); // Cập nhật trang hiện tại từ phản hồi
        } catch (error) {
            console.error("Error fetching search results:", error);
            toast.error("Không thể tải kết quả tìm kiếm. Vui lòng thử lại.");
            setSearchResults([]);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    };

    // useEffect để gọi API khi từ khóa tìm kiếm thay đổi hoặc khi trang được tải lần đầu
    useEffect(() => {
        fetchSearchResults(0); // Luôn bắt đầu từ trang 0 khi từ khóa thay đổi
    }, [keyword]); // Dependency array: chạy lại khi `keyword` thay đổi

    // Hàm xử lý khi người dùng chuyển trang (được truyền xuống component Pagination)
    const handlePageChange = (newPage: number) => {
        fetchSearchResults(newPage); // Gọi lại API với trang mới
    };

    // Hàm để xử lý đường dẫn ảnh (giả sử backend trả về đường dẫn tương đối)
    const getFullImageUrl = (path: string | undefined | null) => {
        if (!path || path.trim() === '') {
            return 'https://via.placeholder.com/400x250?text=No+Image'; // Ảnh mặc định
        }
        // Giả sử ảnh được lưu ở http://localhost:8080/uploads/
        if (path.startsWith('/uploads/')) {
            return `http://localhost:8080${path}`;
        }
        return path; // Trả về nguyên gốc nếu nó đã là URL đầy đủ
    };

    // --- Render giao diện ---
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">
                Kết quả tìm kiếm cho: &quot;{keyword}&quot;
            </h1>

            {loading && <p className="text-center text-gray-600">Đang tải kết quả...</p>}

            {!loading && searchResults.length === 0 && (
                <p className="text-center text-gray-600">
                    Không tìm thấy khóa học nào phù hợp với từ khóa của bạn.
                </p>
            )}

            {!loading && searchResults.length > 0 && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {searchResults.map(course => (
                            <CourseCard
                                key={course.id}
                                course={{
                                    id: course.id,
                                    title: course.title,
                                    description: course.description,
                                    imageUrl: getFullImageUrl(course.imageUrl),
                                    creatorName: course.createdBy,
                                    createdAt: course.createdAt,
                                    price: course.price, // Đặt giá trị mặc định hoặc lấy từ DTO nếu có
                                    visible: true // Đặt giá trị mặc định hoặc lấy từ DTO nếu có
                                }}
                            />
                        ))}
                    </div>

                    {/* Sử dụng component Pagination mới */}
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </>
            )}
        </div>
    );
}
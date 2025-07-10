"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react'; // Import useCallback
import api from '@/lib/api';
import CourseCard from '@/components/course/CourseCard';
import { toast } from 'sonner';
import Pagination from '@/components/Pagination';
import { Skeleton } from '@/components/ui/skeleton';
import { Frown, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Định nghĩa các Interface (Dựa trên CourseResponse của Backend) ---

interface CourseResponseDTO {
    id: string;
    title: string;
    description: string;
    price: number;
    category?: string;
    creatorName: string;
    imageUrl: string;
    createdAt: string;
    updatedAt: string;
    visible: boolean;
}

interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

// --- Component SearchPage ---

export default function SearchPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const keyword = searchParams.get('keyword') || '';

    // State cho thông tin người dùng, đọc từ localStorage
    const [userRole, setUserRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN' | 'ANONYMOUS' | null>(null); // Added 'ANONYMOUS'
    const [userId, setUserId] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    const [searchResults, setSearchResults] = useState<CourseResponseDTO[]>([]);
    const [purchasedCourseIds, setPurchasedCourseIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [loadingPurchased, setLoadingPurchased] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalResults, setTotalResults] = useState(0);

    // useEffect để đọc thông tin người dùng từ localStorage
    useEffect(() => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        const status = localStorage.getItem('status');
        const savedUserId = localStorage.getItem('userId');

        if (token && role && status === 'ACTIVE') {
            setIsAuthenticated(true);
            setUserRole(role as 'STUDENT' | 'TEACHER' | 'ADMIN');
            setUserId(savedUserId);
        } else {
            setIsAuthenticated(false);
            setUserRole('ANONYMOUS'); // Explicitly set to ANONYMOUS if not authenticated
            setUserId(null);
        }
        setIsLoadingAuth(false);
    }, []); // Run once on mount

    // Memoize fetchSearchResults using useCallback to prevent unnecessary re-creation
    const fetchSearchResults = useCallback(async (page: number) => {
        if (!keyword.trim()) {
            setSearchResults([]);
            setTotalPages(0);
            setTotalResults(0);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get<PageResponse<CourseResponseDTO>>(
                `/public/courses/search?q=${encodeURIComponent(keyword)}&page=${page}&size=8`
            );
            setSearchResults(response.data.content);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.number);
            setTotalResults(response.data.totalElements);
        } catch (error) {
            console.error("Error fetching search results:", error);
            toast.error("Không thể tải kết quả tìm kiếm. Vui lòng thử lại.");
            setSearchResults([]);
            setTotalPages(0);
            setTotalResults(0);
        } finally {
            setLoading(false);
        }
    }, [keyword]); // Dependency on keyword

    // Memoize fetchPurchasedCourseIds using useCallback
    const fetchPurchasedCourseIds = useCallback(async () => {
        if (!isLoadingAuth && isAuthenticated && userRole === 'STUDENT' && userId) {
            setLoadingPurchased(true);
            try {
                // Ensure this API call is correctly authenticated and authorized on the backend
                const response = await api.get<string[]>(`/public/courses/purchased-course-ids`);
                setPurchasedCourseIds(new Set(response.data));
            } catch (error) {
                console.error("Error fetching purchased course IDs:", error);
                // Consider adding a more user-friendly message or handling for 403 specific errors
            } finally {
                setLoadingPurchased(false);
            }
        } else {
            setPurchasedCourseIds(new Set());
            setLoadingPurchased(false);
        }
    }, [isLoadingAuth, isAuthenticated, userRole, userId]); // Dependencies for this specific fetch

    useEffect(() => {
        if (!isLoadingAuth) {
            fetchSearchResults(0);
        }
    }, [keyword, isLoadingAuth, fetchSearchResults]); // Add fetchSearchResults to dependencies

    useEffect(() => {
        fetchPurchasedCourseIds();
    }, [isAuthenticated, userRole, userId, isLoadingAuth, fetchPurchasedCourseIds]); // Add fetchPurchasedCourseIds to dependencies

    const handlePageChange = (newPage: number) => {
        fetchSearchResults(newPage);
    };

    const handleGoBack = () => {
        router.back();
    };

    const overallLoading = loading || isLoadingAuth || (isAuthenticated && userRole === 'STUDENT' && loadingPurchased);

    return (
        <div className="container mx-auto p-6 min-h-[calc(100vh-64px)] flex flex-col">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={handleGoBack} aria-label="Quay lại">
                    <ArrowLeft className="h-6 w-6" />
                </Button>
                <h1 className="text-3xl font-bold">
                    Kết quả tìm kiếm cho: &quot;{keyword}&quot;
                </h1>
            </div>

            {overallLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                    {Array.from({ length: 8 }).map((_, index) => (
                        <div key={index} className="flex flex-col space-y-3">
                            <Skeleton className="h-[150px] w-full rounded-md" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-[80%]" />
                                <Skeleton className="h-4 w-[60%]" />
                                <Skeleton className="h-4 w-[40%]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <>
                    {totalResults > 0 && (
                        <p className="text-lg text-gray-700 mb-6">
                            Tìm thấy <span className="font-semibold text-primary">{totalResults}</span> khóa học phù hợp.
                        </p>
                    )}

                    {searchResults.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-gray-50 rounded-lg shadow-inner">
                            <Frown className="h-16 w-16 text-gray-400 mb-4" />
                            <p className="text-xl font-semibold text-gray-700 mb-2">
                                Rất tiếc, không tìm thấy khóa học nào.
                            </p>
                            <p className="text-gray-500 text-center max-w-md">
                                Vui lòng thử tìm kiếm với từ khóa khác hoặc kiểm tra lại chính tả.
                            </p>
                            <Button className="mt-6" onClick={handleGoBack}>
                                Quay lại trang trước
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {searchResults.map(course => (
                                    <CourseCard
                                        key={course.id}
                                        course={{
                                            id: course.id,
                                            title: course.title,
                                            description: course.description,
                                            imageUrl: course.imageUrl,
                                            creatorName: course.creatorName,
                                            createdAt: course.createdAt,
                                            price: course.price,
                                            visible: course.visible,
                                        }}
                                        isEnrolled={isAuthenticated && userRole === 'STUDENT' && purchasedCourseIds.has(course.id)}
                                        userRole={userRole} // Directly pass userRole from state
                                    />
                                ))}
                            </div>

                            <div className="mt-auto pt-8">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
}
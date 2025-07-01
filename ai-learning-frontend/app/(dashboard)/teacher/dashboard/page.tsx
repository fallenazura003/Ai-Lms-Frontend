// app/teacher/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import {
    getTeacherDashboardStats,
    getDetailedPurchases,
    getCourseBuyers,
    exportPurchasesToExcel,
    TeacherDashboardStats,
    PurchaseDetail,
    BuyerDetail,
    PageResponse // Import PageResponse
} from '@/lib/teacherDashboardApi'; // Đảm bảo đường dẫn đúng đến file service của bạn
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'; // Dùng Dialog của shadcn/ui
import { Input } from '@/components/ui/input'; // Có thể cần nếu có chức năng tìm kiếm
import Pagination from '@/components/Pagination'; // Component phân trang của bạn

export default function TeacherDashboardPage() {
    const [stats, setStats] = useState<TeacherDashboardStats>({ totalCoursesSold: 0, totalPurchases: 0, totalRevenue: 0 });
    const [purchases, setPurchases] = useState<PurchaseDetail[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [openBuyersModal, setOpenBuyersModal] = useState(false);
    const [currentCourseBuyers, setCurrentCourseBuyers] = useState<BuyerDetail[]>([]);
    const [loadingBuyers, setLoadingBuyers] = useState(false);

    const pageSize = 10; // Kích thước trang mặc định

    // --- Fetch Dashboard Stats ---
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const statsData = await getTeacherDashboardStats();
                setStats(statsData);
            } catch (err) {
                console.error('Lỗi khi tải thống kê Dashboard:', err);
                setError('Không thể tải thống kê Dashboard. Vui lòng thử lại.');
            }
        };
        fetchStats();
    }, []);

    // --- Fetch Detailed Purchases ---
    const fetchPurchases = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const purchasesData: PageResponse<PurchaseDetail> = await getDetailedPurchases(page, pageSize);
            setPurchases(purchasesData.content);
            setCurrentPage(purchasesData.number);
            setTotalPages(purchasesData.totalPages);
        } catch (err) {
            console.error('Lỗi khi tải chi tiết giao dịch:', err);
            setError('Không thể tải chi tiết giao dịch. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases(currentPage);
    }, [currentPage]);

    // --- Handle Pagination Change ---
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // --- Handle View Buyers (Modal) ---
    const handleViewBuyers = async (courseId: string) => {
        setOpenBuyersModal(true);
        setLoadingBuyers(true);
        try {
            const buyersData = await getCourseBuyers(courseId);

            // ✅ Sắp xếp giảm dần theo ngày mua
            const sortedBuyers = buyersData.sort((a, b) =>
                new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime()
            );

            setCurrentCourseBuyers(sortedBuyers);
        } catch (err) {
            console.error('Lỗi khi tải danh sách người mua:', err);
        } finally {
            setLoadingBuyers(false);
        }
    };


    // --- Handle Export Excel ---
    const handleExportExcel = async () => {
        try {
            await exportPurchasesToExcel();
            alert('Xuất file Excel thành công!');
        } catch (err) {
            console.error('Lỗi khi xuất Excel:', err);
            alert('Không thể xuất file Excel. Vui lòng thử lại.');
        }
    };

    // --- Loading and Error States ---
    if (loading && purchases.length === 0) { // Chỉ hiển thị loading ban đầu hoặc khi chuyển trang
        return (
            <div className="flex justify-center items-center h-64">
                <p>Đang tải dữ liệu...</p> {/* Có thể thay bằng Spinner */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 mt-4">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Tổng quan Dashboard Giảng Viên</h1>

            {/* Thẻ thống kê tổng quát */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader><CardTitle className="text-lg font-semibold text-gray-700">Tổng số khóa học đã bán</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-blue-600">{stats.totalCoursesSold}</CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader><CardTitle className="text-lg font-semibold text-gray-700">Tổng số lượt mua</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-green-600">{stats.totalPurchases}</CardContent>
                </Card>
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardHeader><CardTitle className="text-lg font-semibold text-gray-700">Tổng doanh thu</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-purple-600">
                        {stats.totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </CardContent>
                </Card>
            </div>

            {/* Bảng thống kê chi tiết */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Thống kê chi tiết giao dịch</h2>
                <Button onClick={handleExportExcel}>Xuất Excel</Button>
            </div>

            <Table className="bg-white shadow-md rounded-lg">
                <TableHeader>
                    <TableRow>
                        <TableHead>ID giao dịch</TableHead>
                        <TableHead>Tên khóa học</TableHead>
                        <TableHead>Người mua</TableHead>
                        <TableHead>Email người mua</TableHead>
                        <TableHead>Giá tiền</TableHead>
                        <TableHead>Ngày mua</TableHead>
                        <TableHead className="text-center">Chi tiết người mua</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">
                                Không có giao dịch mua nào.
                            </TableCell>
                        </TableRow>
                    ) : (
                        purchases.map((purchase) => (
                            <TableRow key={purchase.purchaseId}>
                                <TableCell className="font-medium">{purchase.purchaseId.substring(0, 8)}...</TableCell>
                                <TableCell>{purchase.courseTitle}</TableCell>
                                <TableCell>{purchase.buyerName}</TableCell>
                                <TableCell>{purchase.buyerEmail}</TableCell>
                                <TableCell>{purchase.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                                <TableCell>{new Date(purchase.purchaseDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center">
                                    <Dialog open={openBuyersModal} onOpenChange={setOpenBuyersModal}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" onClick={() => handleViewBuyers(purchase.courseId)}>
                                                Xem
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[800px]">
                                            <DialogHeader>
                                                <DialogTitle>Danh sách người mua</DialogTitle>
                                            </DialogHeader>
                                            {loadingBuyers ? (
                                                <div className="flex justify-center p-4">
                                                    <p>Đang tải người mua...</p>
                                                </div>
                                            ) : (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Tên</TableHead>
                                                            <TableHead>Email</TableHead>
                                                            <TableHead>Ngày mua</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {currentCourseBuyers.length === 0 ? (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center">
                                                                    Không có người mua nào cho khóa học này.
                                                                </TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            currentCourseBuyers.map((buyer) => (
                                                                <TableRow key={buyer.userId}>
                                                                    <TableCell>{buyer.userName}</TableCell>
                                                                    <TableCell>{buyer.userEmail}</TableCell>
                                                                    <TableCell>
                                                                        {new Date(buyer.purchaseDate).toLocaleString('vi-VN', {
                                                                            hour: '2-digit',
                                                                            minute: '2-digit',
                                                                            second: '2-digit',
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour12: false
                                                                        })}
                                                                    </TableCell>

                                                                </TableRow>
                                                            ))
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            )}
                                        </DialogContent>
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>

            {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}
        </div>
    );
}
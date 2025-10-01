'use client';

import { useEffect, useState } from 'react';
import {
    getTeacherDashboardStats,
    getDetailedPurchases,
    getCourseBuyers,
    exportPurchasesToExcel,
    getRevenueChartData,
    TeacherDashboardStats,
    PurchaseDetail,
    BuyerDetail,
    PageResponse,
    RevenueChartDTO
} from '@/lib/teacherDashboardApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Pagination from '@/components/Pagination';

import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';

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

    const [revenueData, setRevenueData] = useState<RevenueChartDTO[]>([]);

    const pageSize = 10;

    // Fetch Stats
    useEffect(() => {
        getTeacherDashboardStats()
            .then(setStats)
            .catch(() => setError('Không thể tải thống kê Dashboard.'));
    }, []);

    // Fetch Revenue Data
    useEffect(() => {
        getRevenueChartData()
            .then(setRevenueData)
            .catch(err => console.error('Lỗi khi tải dữ liệu biểu đồ:', err));
    }, []);

    // Fetch Purchases
    const fetchPurchases = async (page: number) => {
        setLoading(true);
        setError(null);
        try {
            const purchasesData: PageResponse<PurchaseDetail> = await getDetailedPurchases(page, pageSize);
            setPurchases(purchasesData.content);
            setCurrentPage(purchasesData.number);
            setTotalPages(purchasesData.totalPages);
        } catch {
            setError('Không thể tải chi tiết giao dịch.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPurchases(currentPage);
    }, [currentPage]);

    // Handle Buyers
    const handleViewBuyers = async (courseId: string) => {
        setOpenBuyersModal(true);
        setLoadingBuyers(true);
        try {
            const buyersData = await getCourseBuyers(courseId);
            setCurrentCourseBuyers(
                buyersData.sort((a, b) => new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime())
            );
        } finally {
            setLoadingBuyers(false);
        }
    };

    // Export Excel
    const handleExportExcel = async () => {
        try {
            await exportPurchasesToExcel();
            alert('Xuất file Excel thành công!');
        } catch {
            alert('Không thể xuất file Excel.');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Tổng quan Dashboard Giảng Viên</h1>

            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card><CardHeader><CardTitle>Tổng số khóa học đã bán</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-blue-600">{stats.totalCoursesSold}</CardContent>
                </Card>
                <Card><CardHeader><CardTitle>Tổng số lượt mua</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-green-600">{stats.totalPurchases}</CardContent>
                </Card>
                <Card><CardHeader><CardTitle>Tổng doanh thu</CardTitle></CardHeader>
                    <CardContent className="text-4xl font-bold text-purple-600">
                        {stats.totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </CardContent>
                </Card>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md mt-8">
                <h2 className="text-2xl font-bold mb-4">Biểu đồ doanh thu theo tháng</h2>

                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="periodLabel" tick={{ fontSize: 12 }} />
                        <YAxis
                            tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}tr`}
                            tick={{ fontSize: 12 }}
                        />
                        <Tooltip
                            formatter={(value: number) =>
                                value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                            }
                            labelStyle={{ fontWeight: 'bold' }}
                            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                        />
                        <Legend verticalAlign="top" height={36} />
                        <Line
                            type="monotone"
                            dataKey="totalRevenue"
                            name="Doanh thu (VND)"
                            stroke="#4f46e5"
                            strokeWidth={3}
                            dot={{ r: 5, stroke: '#4f46e5', strokeWidth: 2, fill: '#fff' }}
                            activeDot={{ r: 7 }}
                        />
                    </LineChart>
                </ResponsiveContainer>

                {/* Biểu đồ cột song song */}
                <div className="mt-8">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="periodLabel" tick={{ fontSize: 12 }} />
                            <YAxis
                                tickFormatter={(value) => `${(value / 1_000_000).toFixed(1)}tr`}
                                tick={{ fontSize: 12 }}
                            />
                            <Tooltip
                                formatter={(value: number) =>
                                    value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
                                }
                                labelStyle={{ fontWeight: 'bold' }}
                                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                            />
                            <Legend verticalAlign="top" height={36} />
                            <Bar dataKey="totalRevenue" name="Doanh thu (VND)" fill="#10b981" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Purchases Table */}
            <div className="flex justify-between items-center mb-4 mt-10">
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
                        <TableHead className="text-center">Chi tiết</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {purchases.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={7} className="text-center">Không có giao dịch mua nào.</TableCell>
                        </TableRow>
                    ) : (
                        purchases.map(p => (
                            <TableRow key={p.purchaseId}>
                                <TableCell>{p.purchaseId.substring(0, 8)}...</TableCell>
                                <TableCell>{p.courseTitle}</TableCell>
                                <TableCell>{p.buyerName}</TableCell>
                                <TableCell>{p.buyerEmail}</TableCell>
                                <TableCell>{p.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</TableCell>
                                <TableCell>{new Date(p.purchaseDate).toLocaleDateString()}</TableCell>
                                <TableCell className="text-center">
                                    <Dialog open={openBuyersModal} onOpenChange={setOpenBuyersModal}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" onClick={() => handleViewBuyers(p.courseId)}>Xem</Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-[600px]">
                                            <DialogHeader><DialogTitle>Danh sách người mua</DialogTitle></DialogHeader>
                                            {loadingBuyers ? <p>Đang tải...</p> : (
                                                <Table>
                                                    <TableHeader><TableRow>
                                                        <TableHead>Tên</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Ngày mua</TableHead>
                                                    </TableRow></TableHeader>
                                                    <TableBody>
                                                        {currentCourseBuyers.map(b => (
                                                            <TableRow key={b.userId}>
                                                                <TableCell>{b.userName}</TableCell>
                                                                <TableCell>{b.userEmail}</TableCell>
                                                                <TableCell>{new Date(b.purchaseDate).toLocaleString('vi-VN')}</TableCell>
                                                            </TableRow>
                                                        ))}
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
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </div>
            )}
        </div>
    );
}

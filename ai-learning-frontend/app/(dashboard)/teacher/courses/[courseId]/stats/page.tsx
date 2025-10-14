'use client';

import React, { useEffect, useState } from 'react';
import { BarChart3, Users, DollarSign, BookOpen, Mail } from 'lucide-react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import api from "@/lib/api";


const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`rounded-xl bg-white p-4 shadow-md ${className}`}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`flex flex-col space-y-1.5 ${className}`}>{children}</div>;
const CardTitle = ({ children, className }: { children: React.ReactNode, className?: string }) => <h3 className={`font-semibold tracking-tight text-sm ${className}`}>{children}</h3>;
const CardContent = ({ children, className }: { children: React.ReactNode, className?: string }) => <div className={`p-0 pt-0 ${className}`}>{children}</div>;
const Table = ({ children }: { children: React.ReactNode }) => <table className="w-full caption-bottom text-sm">{children}</table>;
const TableHeader = ({ children, className }: { children: React.ReactNode, className?: string }) => <thead className={`[&_tr]:border-b ${className}`}>{children}</thead>;
const TableBody = ({ children }: { children: React.ReactNode }) => <tbody className="[&_tr:last-child]:border-0">{children}</tbody>;
const TableRow = ({ children, className }: { children: React.ReactNode, className?: string }) => <tr className={`border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted ${className}`}>{children}</tr>;
const TableHead = ({ children, className }: { children: React.ReactNode, className?: string }) => <th className={`h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</th>;
const TableCell = ({ children, className }: { children: React.ReactNode, className?: string }) => <td className={`p-4 align-middle [&:has([role=checkbox])]:pr-0 ${className}`}>{children}</td>;
const Progress = ({ value, className }: { value: number, className?: string }) => (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-gray-200 ${className}`}>
        <div
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${value}%` }}
        />
    </div>
);
const Button = ({ children, className, variant = 'default', onClick }: { children: React.ReactNode, className?: string, variant?: string, onClick?: () => void }) => {
    let baseStyle = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors h-10 px-4 py-2";
    if (variant === 'outline') {
        baseStyle += " border border-input bg-white hover:bg-gray-100";
    } else {
        baseStyle += " bg-blue-600 text-white hover:bg-blue-700";
    }
    return <button className={`${baseStyle} ${className}`} onClick={onClick}>{children}</button>;
};




interface StudentProgress {
    studentId: string;
    studentName: string;
    studentEmail: string;
    purchaseDate: string;
    progressPercentage: number;
    completedLessons: number;
    totalLessons: number;
}

interface CourseStatsResponse {
    courseTitle: string;
    totalRevenue: number;
    totalEnrollments: number;
    students: StudentProgress[];
}

export default function TeacherCourseStatsPage() {
    const { courseId } = useParams();

    const [stats, setStats] = useState<CourseStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            if (!courseId) return;

            try {
                const res = await api.get<CourseStatsResponse>(`/teacher/courses/${courseId}/stats`);

                const dataWithEnrollments = {
                    ...res.data,
                    totalEnrollments: res.data.students.length
                }

                setStats(dataWithEnrollments);
                setLoading(false);
            } catch (err: any) {
                console.error("Lỗi gọi API:", err);
                setError('Không thể tải dữ liệu thống kê từ backend. Vui lòng kiểm tra dịch vụ API thực tế.');
                setStats({ courseTitle: "Lỗi tải dữ liệu", totalRevenue: 0, totalEnrollments: 0, students: [] });
                toast.error('Lỗi khi gọi API thống kê khóa học.');
                setLoading(false);
            }
        };

        fetchStats();
    }, [courseId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <p className="text-xl text-gray-500">Đang tải dữ liệu thống kê từ API...</p>
            </div>
        );
    }

    if (error && stats?.totalEnrollments === 0) {
        return (
            <div className="p-8 text-center bg-red-50 border border-red-200 rounded-xl m-8">
                <h1 className="text-2xl font-bold text-red-600">Lỗi Tải Dữ Liệu</h1>
                <p className="mt-2 text-red-500">{error}</p>
                <a href="/teacher/courses">
                    <Button variant="outline" className="mt-4 border-red-300 text-red-600 hover:bg-red-50">Quay lại danh sách khóa học</Button>
                </a>
            </div>
        );
    }

    // --- Formatters ---
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString('vi-VN');
    };

    // Tính toán các chỉ số
    const studentCount = stats?.students.length || 0;
    const totalLessonsInCourse = stats?.students[0]?.totalLessons || 0;

    const maxProgress = studentCount > 0 ? stats!.students.reduce((max, student) => Math.max(max, student.progressPercentage), 0) : 0;
    const avgProgress = studentCount > 0
        ? stats!.students.reduce((sum, student) => sum + student.progressPercentage, 0) / studentCount
        : 0;

    const currentStats = stats || { courseTitle: "Loading...", totalRevenue: 0, totalEnrollments: 0, students: [] };


    return (
        <div className="p-6 md:p-10 font-sans">
            <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
                <BarChart3 className="inline-block mr-3 h-8 w-8 text-indigo-600" /> Thống kê Khóa học
            </h1>
            <p className="text-xl font-semibold text-gray-600 mb-8">{currentStats.courseTitle}</p>

            <a href={`/teacher/courses/${courseId}/lessons`}>
                <Button variant="outline" className="mb-6 border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                    <BookOpen className="mr-2 h-4 w-4" /> Quản lý bài học
                </Button>
            </a>


            {/* Tóm tắt chỉ số */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <Card className="shadow-xl border-l-4 border-green-600">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Doanh thu</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-600">
                            {formatCurrency(currentStats.totalRevenue)}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Từ {currentStats.totalEnrollments} lượt mua</p>
                    </CardContent>
                </Card>



                <Card className="shadow-xl border-l-4 border-pink-600">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tiến độ TB</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{avgProgress.toFixed(1)}%</div>
                        <p className="text-xs text-gray-500 mt-1">Tối đa: {maxProgress.toFixed(1)}%</p>
                    </CardContent>
                </Card>

                <Card className="shadow-xl border-l-4 border-yellow-600">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tổng Bài học</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{totalLessonsInCourse}</div>
                        <p className="text-xs text-gray-500 mt-1">Tổng số bài học trong khóa</p>
                    </CardContent>
                </Card>
            </div>

            {/* Danh sách Học viên và Tiến độ */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <Users className="mr-2 h-6 w-6 text-blue-600" /> Danh sách Học viên ({currentStats.totalEnrollments})
            </h2>

            {currentStats.students.length === 0 ? (
                <div className="p-6 text-center bg-gray-50 border border-gray-200 rounded-xl">
                    <p className="text-gray-500">Chưa có học viên nào đăng ký khóa học này hoặc không thể tải dữ liệu.</p>
                </div>
            ) : (
                <div className="bg-white shadow-xl rounded-xl overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="text-gray-700">Tên học viên</TableHead>
                                <TableHead className="text-gray-700">Email</TableHead>
                                <TableHead className="w-[150px] text-center text-gray-700">Ngày mua</TableHead>
                                <TableHead className="w-[250px] text-gray-700">Tiến độ học</TableHead>
                                <TableHead className="w-[100px] text-center text-gray-700">Hoàn thành</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentStats.students.map((student) => (
                                <TableRow key={student.studentId} className="border-gray-200">
                                    <TableCell className="font-medium text-gray-800">{student.studentName}</TableCell>
                                    <TableCell className="text-sm text-gray-500 flex items-center gap-2">
                                        <Mail className="h-3 w-3 text-indigo-500" />
                                        {student.studentEmail}
                                    </TableCell>
                                    <TableCell className="text-center text-sm whitespace-nowrap text-gray-600">
                                        {/* ✅ ĐÃ SỬA: Sử dụng student.purchaseDate */}
                                        {formatDate(student.purchaseDate)}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            <Progress value={student.progressPercentage} className="h-2 bg-gray-200" />
                                            <span className="text-sm font-semibold w-10 text-right text-gray-700">
                                                {student.progressPercentage.toFixed(0)}%
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-medium text-gray-700">
                                        {student.completedLessons} / {student.totalLessons}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

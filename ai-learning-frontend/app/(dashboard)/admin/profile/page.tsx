'use client'
import React from 'react';

import {User, Mail, Shield, Zap, Badge} from 'lucide-react';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {useAuth} from "@/store/auth";


const UserProfilePage: React.FC = () => {
    // Lấy tất cả thông tin tĩnh cần thiết từ AuthContext
    const { user, role, status } = useAuth();

    // Hàm dịch vai trò sang tiếng Việt
    const getRoleVietnamese = (r: string | null) => {
        if (!r) return 'Không xác định';
        switch(r) {
            case 'STUDENT': return 'Học viên';
            case 'TEACHER': return 'Giáo viên';
            case 'ADMIN': return 'Quản trị viên';
            default: return r;
        }
    }

    // Hàm hiển thị trạng thái tài khoản
    const getStatusBadge = (s: string | null) => {
        if (!s || s === 'BLOCKED') {
            return <Badge className="bg-red-500 text-white hover:bg-red-600">Bị khóa</Badge>;
        }
        return <Badge className="bg-green-500 text-white"></Badge>;
    }

    // Kiểm tra thông tin người dùng
    if (!user) {
        return (
            <div className="text-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg max-w-lg mx-auto mt-10 shadow-md">
                <p className="text-yellow-700 font-medium text-lg">Vui lòng đăng nhập để xem thông tin hồ sơ.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-2xl">
            <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800 border-b-2 pb-2">Thông tin Hồ sơ Cá nhân</h1>

            <Card className="shadow-2xl border-t-4 border-blue-500">
                <CardHeader className="bg-blue-50">
                    <CardTitle className="flex items-center text-2xl text-blue-700 font-semibold">
                        <User className="w-6 h-6 mr-3" /> {user.name}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 p-6">

                    {/* Dòng Email */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-600 font-medium flex items-center">
                            <Mail className="inline w-5 h-5 mr-2 text-indigo-500" /> Email
                        </span>
                        <span className="font-semibold text-gray-800">{user.email}</span>
                    </div>

                    {/* Dòng Vai trò */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-600 font-medium flex items-center">
                            <Shield className="inline w-5 h-5 mr-2 text-green-500" /> Vai trò
                        </span>
                        <span className="font-bold text-base">
                            {getRoleVietnamese(role)}
                        </span>
                    </div>

                    {/* Dòng Trạng thái */}
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <span className="text-gray-600 font-medium flex items-center">
                            <Zap className="inline w-5 h-5 mr-2 text-yellow-500" /> Trạng thái
                        </span>
                        {getStatusBadge(status)}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfilePage;

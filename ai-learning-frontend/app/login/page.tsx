'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';
import api from '@/lib/api';
import Link from "next/link";
import Image from 'next/image'; // Import Image component

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });

            const {
                token,
                role,
                status,
                userId,
                userName,
                userEmail
            } = res.data;

            const success = setAuth(token, role, status, userId, {
                id: userId,
                name: userName,
                email: userEmail,
            });

            if (!success) {
                setError('Tài khoản không hợp lệ.');
                return;
            }

            if (status === 'BLOCKED') {
                setError('Tài khoản đã bị khóa.');
                return;
            }

            // Điều hướng theo vai trò
            if (role === 'STUDENT') router.push('/student/home');
            else if (role === 'TEACHER') router.push('/teacher/home');
            else if (role === 'ADMIN') router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="relative flex items-center justify-center min-h-screen text-[#F4F4F4] p-4">
            {/* Background Image */}
            <div className="absolute inset-0 -z-10">
                <Image
                    src="/background1.jpg" // Sử dụng ảnh nền từ landing page
                    alt="Background"
                    fill
                    className="object-cover"
                    priority // Ưu tiên tải ảnh nền này
                />
                {/* Overlay with blur effect */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md" /> {/* Tăng độ mờ lên md */}
            </div>

            <Card className="w-full max-w-md bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-2xl border border-gray-700 relative z-10">
                <CardHeader className="pb-4">
                    <CardTitle className="text-center text-3xl font-bold font-header text-[#F4F4F4]">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#FF6B6B] to-[#FFD166]">
                            Đăng nhập
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <Label htmlFor="email" className="text-gray-300 text-sm mb-1 block">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="bg-gray-700 text-[#F4F4F4] border-gray-600 focus:border-[#06D6A0] focus:ring-[#06D6A0] placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-gray-300 text-sm mb-1 block">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="bg-gray-700 text-[#F4F4F4] border-gray-600 focus:border-[#06D6A0] focus:ring-[#06D6A0] placeholder-gray-400"
                            />
                        </div>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        <Button type="submit" className="w-full bg-[#06D6A0] text-[#1A1A2E] hover:bg-yellow-500 font-semibold py-2 rounded-lg shadow-md transition-all duration-200">
                            Đăng nhập
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Chưa có tài khoản?{' '}
                        <Link href="/register" className="text-[#06D6A0] hover:text-yellow-500 transition-colors duration-200 font-medium">
                            Đăng ký ngay
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
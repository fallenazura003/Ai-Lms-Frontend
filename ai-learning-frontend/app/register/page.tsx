'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/auth/register', form);
            setSuccess('🎉 Đăng ký thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập.');
            setTimeout(() => router.push('/login'), 3000);
        } catch (err: any) {
            setError(err.response?.data || 'Đăng ký thất bại!');
        }
    };

    return (
        <main className="relative flex items-center justify-center min-h-screen text-[#F4F4F4] p-4">
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
                            Đăng ký tài khoản
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name" className="text-gray-300 text-sm mb-1 block">Tên</Label>
                            <Input
                                id="name"
                                placeholder="Nguyễn Văn A"
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                                className="bg-gray-700 text-[#F4F4F4] border-gray-600 focus:border-[#06D6A0] focus:ring-[#06D6A0] placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="text-gray-300 text-sm mb-1 block">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                                className="bg-gray-700 text-[#F4F4F4] border-gray-600 focus:border-[#06D6A0] focus:ring-[#06D6A0] placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <Label htmlFor="password" className="text-gray-300 text-sm mb-1 block">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required
                                className="bg-gray-700 text-[#F4F4F4] border-gray-600 focus:border-[#06D6A0] focus:ring-[#06D6A0] placeholder-gray-400"
                            />
                        </div>
                        <div>
                            <Label className="text-gray-300 text-sm mb-1 block">Vai trò</Label>
                            <Select
                                value={form.role}
                                onValueChange={(val) => handleChange('role', val)}
                            >
                                <SelectTrigger className="bg-gray-700 text-[#F4F4F4] border-gray-600 focus:border-[#06D6A0] focus:ring-[#06D6A0]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-gray-800 border-gray-700 text-[#F4F4F4]">
                                    <SelectItem value="STUDENT" className="hover:bg-gray-700 focus:bg-gray-700 data-[state=checked]:bg-[#06D6A0] data-[state=checked]:text-[#1A1A2E]">Học viên</SelectItem>
                                    <SelectItem value="TEACHER" className="hover:bg-gray-700 focus:bg-gray-700 data-[state=checked]:bg-[#06D6A0] data-[state=checked]:text-[#1A1A2E]">Giáo viên</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                        {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

                        <Button type="submit" className="w-full bg-[#06D6A0] text-[#1A1A2E] hover:bg-yellow-500 font-semibold py-2 rounded-lg shadow-md transition-all duration-200">
                            Đăng ký
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm text-gray-400">
                        Đã có tài khoản?{' '}
                        <Link href="/login" className="text-[#06D6A0] hover:text-yellow-500 transition-colors duration-200 font-medium">
                            Đăng nhập
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/store/auth';
import api from '@/lib/api';

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

            // ✅ Gọi đầy đủ 4 tham số: token, role, status, userId
            const { token, role, status, userId } = res.data;
            const success = setAuth(token, role, status, userId);

            if (!success) {
                setError('Tài khoản không hợp lệ.');
                return;
            }

            if (status === 'BLOCKED') {
                setError('Tài khoản đã bị khóa.');
                return;
            }

            // ✅ Điều hướng theo vai trò
            if (role === 'STUDENT') router.push('/student/home');
            else if (role === 'TEACHER') router.push('/teacher/home');
            else if (role === 'ADMIN') router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data || 'Đăng nhập thất bại');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <Card className="w-full max-w-md shadow-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Đăng nhập</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="******"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full">
                            Đăng nhập
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

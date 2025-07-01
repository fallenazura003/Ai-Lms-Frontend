'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
            setSuccess('🎉 Đăng ký thành công!');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.response?.data || 'Đăng ký thất bại!');
        }
    };

    return (
        <main className="flex items-center justify-center h-screen bg-gray-50">
            <Card className="w-full max-w-md shadow-xl border border-gray-200">
                <CardContent className="p-6 space-y-6">
                    <h1 className="text-2xl font-bold text-center">Đăng ký tài khoản</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Tên</Label>
                            <Input
                                id="name"
                                placeholder="Nguyễn Văn A"
                                value={form.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={form.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="password">Mật khẩu</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) => handleChange('password', e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label>Vai trò</Label>
                            <Select
                                value={form.role}
                                onValueChange={(val) => handleChange('role', val)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="STUDENT">Học viên</SelectItem>
                                    <SelectItem value="TEACHER">Giáo viên</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}

                        <Button type="submit" className="w-full">
                            Đăng ký
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </main>
    );
}

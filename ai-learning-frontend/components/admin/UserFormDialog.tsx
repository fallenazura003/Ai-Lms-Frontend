// components/admin/UserFormDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { DialogContent, DialogDescription, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import api from '@/lib/api';
import {useToast} from "@/hooks/use-toast"; // Đảm bảo đường dẫn đúng


interface UserFormProps {
    user: { id: string; name: string; email: string; role: string } | null;
    onClose: () => void; // Callback khi dialog đóng hoặc submit thành công
}

export default function UserFormDialog({ user, onClose }: UserFormProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '', // Mật khẩu có thể không được trả về từ API khi edit
        role: 'STUDENT',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                email: user.email,
                password: '', // Mật khẩu thường không được fill lại khi sửa
                role: user.role,
            });
        } else {
            setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (user) {
                // Chỉ gửi password nếu có thay đổi
                const dataToSend = formData.password ? formData : { name: formData.name, email: formData.email, role: formData.role };
                await api.put(`/admin/users/${user.id}`, dataToSend);
                toast({
                    title: "Cập nhật thành công!",
                    description: `Người dùng ${formData.name} đã được cập nhật.`,
                });
            } else {
                await api.post('/admin/users', formData);
                toast({
                    title: "Tạo thành công!",
                    description: `Người dùng ${formData.name} đã được tạo.`,
                });
            }
            onClose(); // Đóng dialog và refresh data
        } catch (error: any) {
            console.error('Lỗi:', error);
            toast({
                title: "Lỗi!",
                description: error.response?.data?.message || "Đã xảy ra lỗi khi thực hiện thao tác.",
                variant: "destructive",
            });
        }
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogTitle>{user ? 'Sửa người dùng' : 'Tạo người dùng mới'}</DialogTitle>
            <DialogDescription>
                {user ? 'Chỉnh sửa thông tin người dùng.' : 'Nhập thông tin để tạo người dùng mới.'}
            </DialogDescription>
            <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Tên</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="col-span-3" required />
                </div>
                {/* Chỉ yêu cầu mật khẩu khi tạo mới hoặc nếu muốn thay đổi */}
                {!user && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Mật khẩu</Label>
                        <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="col-span-3" required />
                    </div>
                )}
                {user && ( // Nếu đang sửa, cho phép nhập mật khẩu mới nếu muốn
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="password" className="text-right">Mật khẩu mới</Label>
                        <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} className="col-span-3" placeholder="Để trống nếu không đổi mật khẩu" />
                    </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Vai trò</Label>
                    <select id="role" name="role" value={formData.role} onChange={handleChange} className="col-span-3 p-2 border rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
                        <option value="STUDENT">Học viên</option>
                        <option value="TEACHER">Giáo viên</option>
                        {/* Admin không được tạo/sửa qua form này */}
                    </select>
                </div>
                <DialogFooter>
                    <Button type="submit">{user ? 'Cập nhật' : 'Tạo mới'}</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    );
}
'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface AddNewCourseDialogProps {
    children: React.ReactNode;
    onCourseCreated?: () => void;
}

const categories = [
    { value: 'PROGRAMMING', label: 'Lập trình' },
    { value: 'DESIGN', label: 'Thiết kế' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'BUSINESS', label: 'Kinh doanh' },
    { value: 'LANGUAGE', label: 'Ngôn ngữ' },
    { value: 'MUSIC', label: 'Âm nhạc' },
    { value: 'OTHER', label: 'Khác' },
];

export default function AddNewCourseDialog({ children, onCourseCreated }: AddNewCourseDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            price: 0,
            category: 'OTHER',
            imageUrl: '',
            image: null as File | null,
        },
    });

    const onSubmit = async (data: any) => {
        if (!data.title || !data.description || (!data.image && !data.imageUrl.trim())) {
            toast.error("Vui lòng nhập đầy đủ thông tin và chọn ảnh (tệp hoặc URL).")
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('category', data.category);

        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.imageUrl.trim()) {
            formData.append('imageUrl', data.imageUrl.trim());
        }

        setLoading(true);
        try {
            const response = await api.post('/teacher/courses', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Khóa học đã được tạo thành công!");
                setOpen(false);
                reset();
                onCourseCreated?.();
            }
        } catch (error: any) {
            console.error("Lỗi khi tạo khóa học:", error.response || error);
            toast.error(error.response?.data?.message || "Đã xảy ra lỗi khi tạo khóa học.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Tạo khóa học mới</DialogTitle>
                    <DialogDescription>
                        Nhập thông tin khóa học và chọn ảnh đại diện (upload hoặc URL).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Tiêu đề</Label>
                        <Input id="title" {...register('title', { required: 'Tiêu đề không được để trống' })} />
                        {errors.title && <span className="text-red-500 text-sm">{errors.title.message as string}</span>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea id="description" {...register('description', { required: 'Mô tả không được để trống' })} />
                        {errors.description && <span className="text-red-500 text-sm">{errors.description.message as string}</span>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="price">Giá (VNĐ)</Label>
                        <Input
                            id="price"
                            type="number"
                            {...register('price', { required: 'Giá không được để trống', min: 0 })}
                        />
                        {errors.price && <span className="text-red-500 text-sm">{errors.price.message as string}</span>}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="category">Danh mục</Label>
                        <select
                            id="category"
                            {...register('category', { required: 'Vui lòng chọn danh mục' })}
                            className="w-full border rounded px-3 py-2"
                        >
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                        {errors.category && <span className="text-red-500 text-sm">{errors.category.message as string}</span>}
                    </div>
                    <div className="grid gap-2">
                        <Label>Ảnh đại diện</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                    // @ts-ignore
                                    register('image').onChange({ target: { name: 'image', value: file } });
                                }
                            }}
                        />
                        <span className="text-sm text-muted-foreground text-center">hoặc</span>
                        <Input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            {...register('imageUrl')}
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Đang tạo...' : 'Tạo khóa học'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

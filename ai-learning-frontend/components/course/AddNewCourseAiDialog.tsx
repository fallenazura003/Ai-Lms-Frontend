'use client';

import { useForm } from 'react-hook-form';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader,
    DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import api from '@/lib/api';
import { useState } from 'react';

const categories = [
    { value: 'PROGRAMMING', label: 'Lập trình' },
    { value: 'DESIGN', label: 'Thiết kế' },
    { value: 'MARKETING', label: 'Marketing' },
    { value: 'BUSINESS', label: 'Kinh doanh' },
    { value: 'LANGUAGE', label: 'Ngôn ngữ' },
    { value: 'MUSIC', label: 'Âm nhạc' },
    { value: 'OTHER', label: 'Khác' },
];

export default function AddNewCourseAiDialog({
                                                 children,
                                                 onCourseCreated,
                                             }: {
    children: React.ReactNode;
    onCourseCreated?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        defaultValues: {
            idea: '',
            title: '',
            description: '',
            price: 0,
            category: 'PROGRAMMING',
            image: null as File | null,
            imageUrl: '',
        },
    });

    const handleGenerate = async () => {
        const idea = (document.getElementById('idea') as HTMLInputElement)?.value || '';
        if (!idea.trim()) {
            toast.error('Vui lòng nhập ý tưởng trước khi tạo bằng AI');
            return;
        }

        setLoadingAI(true);
        try {
            const res = await api.post('/teacher/courses/generate', { idea });
            const data = res.data;
            setValue('title', data.title);
            setValue('description', data.description);
            setValue('price', parseFloat(data.price));
            setValue('category', data.category);
            toast.success('Khóa học đã được tạo tự động!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Lỗi khi tạo khóa học bằng AI');
        } finally {
            setLoadingAI(false);
        }
    };

    const onSubmit = async (data: any) => {
        if (!data.title || !data.description || (!data.image && !data.imageUrl)) {
            toast.error('Vui lòng điền đầy đủ thông tin và chọn ảnh.');
            return;
        }

        const formData = new FormData();
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('price', data.price.toString());
        formData.append('category', data.category);

        if (data.image instanceof File) {
            formData.append('image', data.image);
        } else if (data.imageUrl?.trim()) {
            formData.append('imageUrl', data.imageUrl.trim());
        }

        try {
            const response = await api.post('/teacher/courses', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Khóa học đã được tạo thành công!');
            setOpen(false);
            reset();
            onCourseCreated?.();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Tạo khóa học thất bại');
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Tạo khóa học bằng AI</DialogTitle>
                    <DialogDescription>
                        Nhập ý tưởng để AI tạo nội dung, bạn chọn ảnh thủ công.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="idea">Ý tưởng khóa học</Label>
                        <div className="flex gap-2">
                            <Input id="idea" {...register('idea')} />
                            <Button type="button" onClick={handleGenerate} disabled={loadingAI}>
                                {loadingAI ? 'Đang sinh...' : 'Tạo với AI'}
                            </Button>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Tiêu đề</Label>
                        <Input {...register('title', { required: 'Vui lòng nhập tiêu đề' })} />
                        {errors.title && (
                            <span className="text-red-500 text-sm">{errors.title.message as string}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Mô tả</Label>
                        <Textarea {...register('description', { required: 'Vui lòng nhập mô tả' })} />
                        {errors.description && (
                            <span className="text-red-500 text-sm">{errors.description.message as string}</span>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label>Giá (VNĐ)</Label>
                        <Input type="number" {...register('price', { required: true, min: 0 })} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Danh mục</Label>
                        <select {...register('category')} className="border rounded px-2 py-2">
                            {categories.map((cat) => (
                                <option key={cat.value} value={cat.value}>
                                    {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Ảnh đại diện</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
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
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang tạo...' : 'Tạo khóa học'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

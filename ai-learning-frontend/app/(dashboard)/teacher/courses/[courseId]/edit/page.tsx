'use client';

import React, { useEffect, useState, useRef } from 'react'; // Import useRef
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Import RadioGroup components

// Định nghĩa CourseCategory nếu chưa có hoặc import từ một file chung
enum CourseCategory {
    PROGRAMMING = 'PROGRAMMING',
    DESIGN = 'DESIGN',
    BUSINESS = 'BUSINESS',
    MARKETING = 'MARKETING',
    DEVELOPMENT = 'DEVELOPMENT',
    FINANCE = 'FINANCE',

    MUSIC = 'MUSIC',

    PERSONAL_DEVELOPMENT = 'PERSONAL_DEVELOPMENT',
    // Thêm các category khác nếu cần
}

interface CourseFormData {
    title: string;
    description: string;
    price: number;
    category: CourseCategory;
    imageFile: File | null;
    imageUrlInput: string; // Thêm trường này cho URL ảnh dán vào
}

interface CourseResponse {
    id: string;
    title: string;
    description: string;
    price: number;
    imageUrl: string;
    category: CourseCategory;
    creatorName: string;
    createdAt: string;
    visible: boolean;
}

export default function EditCoursePage() {
    const router = useRouter();
    const { courseId } = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [course, setCourse] = useState<CourseResponse | null>(null);
    const [formData, setFormData] = useState<CourseFormData>({
        title: '',
        description: '',
        price: 0,
        category: CourseCategory.PROGRAMMING,
        imageFile: null,
        imageUrlInput: '', // Khởi tạo rỗng
    });
    const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
    const [imageOption, setImageOption] = useState<'upload' | 'url'>('upload'); // State để chọn giữa tải lên/URL
    const fileInputRef = useRef<HTMLInputElement>(null); // Ref cho input file

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!courseId) return;
            setLoading(true);
            try {
                const res = await api.get<CourseResponse>(`/teacher/courses/${courseId}`);
                const courseData = res.data;
                setCourse(courseData);
                setFormData({
                    title: courseData.title,
                    description: courseData.description,
                    price: courseData.price,
                    category: courseData.category,
                    imageFile: null,
                    imageUrlInput: courseData.imageUrl && !courseData.imageUrl.startsWith('/uploads/') ? courseData.imageUrl : '', // Nếu là URL ảnh bên ngoài, điền vào đây
                });
                // Nếu ảnh hiện có là URL bên ngoài, chọn tùy chọn 'url'
                if (courseData.imageUrl && !courseData.imageUrl.startsWith('/uploads/')) {
                    setImageOption('url');
                } else {
                    setImageOption('upload'); // Mặc định là tải lên
                }
                setPreviewImageUrl(getFullImageUrl(courseData.imageUrl));
            } catch (error) {
                console.error('Lỗi khi tải chi tiết khóa học:', error);
                toast.error('Không thể tải chi tiết khóa học.');
                router.push('/teacher/home');
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [courseId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseFloat(e.target.value);
        setFormData((prev) => ({ ...prev, price: isNaN(value) ? 0 : value }));
    };

    const handleCategoryChange = (value: CourseCategory) => {
        setFormData((prev) => ({ ...prev, category: value }));
    };

    const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFormData((prev) => ({ ...prev, imageFile: file, imageUrlInput: '' })); // Reset imageUrlInput khi chọn file
            setPreviewImageUrl(URL.createObjectURL(file));
        }
    };

    const handleImageUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const url = e.target.value;
        setFormData((prev) => ({ ...prev, imageUrlInput: url, imageFile: null })); // Reset imageFile khi nhập URL
        setPreviewImageUrl(url); // Cập nhật preview ngay lập tức
        if (fileInputRef.current) {
            fileInputRef.current.value = ''; // Clear file input
        }
    };

    const handleImageOptionChange = (value: 'upload' | 'url') => {
        setImageOption(value);
        // Clear the other input when switching options
        if (value === 'upload') {
            setFormData(prev => ({ ...prev, imageUrlInput: '' }));
        } else { // value === 'url'
            setFormData(prev => ({ ...prev, imageFile: null }));
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Clear file input
            }
        }
        // Reset preview if neither option has a current value
        if (value === 'upload' && !formData.imageFile) {
            setPreviewImageUrl(getFullImageUrl(course?.imageUrl));
        } else if (value === 'url' && !formData.imageUrlInput) {
            setPreviewImageUrl(getFullImageUrl(course?.imageUrl));
        }
    };


    const getFullImageUrl = (path: string | undefined | null) => {
        if (!path || path.trim() === "") {
            return "https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png";
        }
        if (path.startsWith('/uploads/')) {
            return `http://localhost:8080${path}`;
        }
        return path;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price.toString());
        data.append('category', formData.category);

        // Logic xử lý ảnh: Ưu tiên ảnh từ URL, sau đó là file upload, cuối cùng là ảnh hiện có
        if (imageOption === 'url' && formData.imageUrlInput) {
            data.append('imageUrl', formData.imageUrlInput);
            data.append('image', ''); // Clear image file on backend if URL is provided
        } else if (imageOption === 'upload' && formData.imageFile) {
            data.append('image', formData.imageFile);
            data.append('imageUrl', ''); // Clear image URL on backend if new file is uploaded
        } else {
            // If neither new image file nor new URL is provided,
            // and there was an existing image, send its URL.
            // If imageUrlInput is empty after switching to URL option, it will be an empty string
            // If imageFile is null after switching to upload option, imageUrl will be used from initial load
            // Only send the existing imageUrl if no new input from either option
            if (course?.imageUrl && imageOption === 'upload' && !formData.imageFile) {
                // Use the current course's imageUrl if no new file is uploaded
                data.append('imageUrl', course.imageUrl);
                data.append('image', '');
            } else if (imageOption === 'url' && !formData.imageUrlInput) {
                // If option is URL but input is empty, clear image
                data.append('imageUrl', '');
                data.append('image', '');
            } else {
                // Default to empty if no image is intended
                data.append('imageUrl', '');
                data.append('image', '');
            }
        }


        try {
            await api.put(`/teacher/courses/${courseId}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success('Khóa học đã được cập nhật thành công!');
            router.push('/teacher/home');
        } catch (error) {
            console.error('Lỗi khi cập nhật khóa học:', error);
            toast.error('Có lỗi xảy ra khi cập nhật khóa học.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <span className="ml-3 text-lg text-gray-600">Đang tải chi tiết khóa học...</span>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-xl text-red-500">Không tìm thấy khóa học.</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-4xl mx-auto bg-white shadow-lg rounded-lg mt-10">
            <Button variant="outline" onClick={() => router.back()} className="mb-6 flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Quay lại
            </Button>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Chỉnh sửa khóa học: "{course.title}"</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <Label htmlFor="title" className="text-lg">Tiêu đề khóa học</Label>
                    <Input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="mt-2 text-base p-2"
                    />
                </div>

                <div>
                    <Label htmlFor="description" className="text-lg">Mô tả khóa học</Label>
                    <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="mt-2 text-base p-2"
                    />
                </div>

                <div>
                    <Label htmlFor="price" className="text-lg">Giá khóa học (VNĐ)</Label>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={handlePriceChange}
                        required
                        className="mt-2 text-base p-2"
                    />
                </div>

                <div>
                    <Label htmlFor="category" className="text-lg">Danh mục</Label>
                    <Select value={formData.category} onValueChange={handleCategoryChange}>
                        <SelectTrigger className="w-full mt-2 text-base p-2">
                            <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.values(CourseCategory).map((category) => (
                                <SelectItem key={category} value={category}>
                                    {category.replace(/_/g, ' ')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Phần lựa chọn tải ảnh hoặc dán URL */}
                <div>
                    <Label className="text-lg mb-2 block">Ảnh bìa khóa học</Label>
                    <RadioGroup
                        defaultValue="upload"
                        value={imageOption}
                        onValueChange={(value: 'upload' | 'url') => handleImageOptionChange(value)}
                        className="flex gap-4 mb-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="upload" id="option-upload" />
                            <Label htmlFor="option-upload">Tải ảnh lên</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="url" id="option-url" />
                            <Label htmlFor="option-url">Dán URL ảnh</Label>
                        </div>
                    </RadioGroup>

                    {imageOption === 'upload' && (
                        <>
                            <Input
                                id="image-upload"
                                name="imageFile"
                                type="file"
                                accept="image/*"
                                onChange={handleImageFileChange}
                                className="mt-2 text-base p-2"
                                ref={fileInputRef} // Gắn ref vào đây
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                {formData.imageFile ? formData.imageFile.name : (course?.imageUrl && course.imageUrl.startsWith('/uploads/') ? 'Đang sử dụng ảnh đã tải lên trước đó.' : 'Chưa có ảnh được chọn.')}
                            </p>
                        </>
                    )}

                    {imageOption === 'url' && (
                        <Input
                            id="image-url"
                            name="imageUrlInput"
                            type="text"
                            placeholder="Dán URL ảnh vào đây (ví dụ: https://example.com/image.jpg)"
                            value={formData.imageUrlInput}
                            onChange={handleImageUrlInputChange}
                            className="mt-2 text-base p-2"
                        />
                    )}

                    {previewImageUrl && (
                        <div className="mt-4 relative w-64 h-40 border rounded-md overflow-hidden">
                            <Image
                                src={previewImageUrl}
                                alt="Preview"
                                fill
                                style={{ objectFit: 'cover' }}
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = "https://foundr.com/wp-content/uploads/2021/09/Best-online-course-platforms.png"; // Fallback on error
                                }}
                            />
                        </div>
                    )}
                </div>

                <Button type="submit" className="w-full text-lg py-3" disabled={submitting}>
                    {submitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        'Cập nhật khóa học'
                    )}
                </Button>
            </form>
        </div>
    );
}
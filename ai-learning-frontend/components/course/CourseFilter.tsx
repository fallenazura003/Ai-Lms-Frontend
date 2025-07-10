// src/components/course/CourseFilter.tsx
import React, { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter as FilterIcon } from 'lucide-react';
import api from '@/lib/api';

// Định nghĩa props cho CourseFilter (chỉ có category)
interface CourseFilterProps {
    onFilterChange: (filters: { category: string }) => void; // Chỉ trả về category
    initialCategory?: string;
}

const CourseFilter: React.FC<CourseFilterProps> = ({
                                                       onFilterChange,
                                                       initialCategory = '',
                                                   }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    // Fetch danh sách categories có sẵn
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get<string[]>('/public/courses/categories');
                setAvailableCategories(['Tất cả', ...response.data]);
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };
        fetchCategories();
    }, []);

    // Hàm gọi onFilterChange khi selectedCategory thay đổi
    useEffect(() => {
        onFilterChange({ category: selectedCategory }); // Chỉ truyền category
    }, [selectedCategory, onFilterChange]);

    // Xử lý thay đổi category
    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value === 'Tất cả' ? '' : value);
    };

    // Hàm để reset bộ lọc category
    const handleResetFilters = () => {
        setSelectedCategory('');
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50 flex flex-wrap items-center gap-4">
            <FilterIcon className="h-6 w-6 text-gray-600" />
            <span className="font-semibold text-gray-700">Lọc theo:</span>

            {/* Lọc theo danh mục */}
            <div className="flex items-center gap-2">
                <label htmlFor="category-filter" className="text-sm font-medium">Danh mục:</label>
                <Select
                    value={selectedCategory === '' ? 'Tất cả' : selectedCategory}
                    onValueChange={handleCategoryChange}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableCategories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Nút Reset */}
            <Button variant="outline" onClick={handleResetFilters}>
                Đặt lại
            </Button>
        </div>
    );
};

export default CourseFilter;
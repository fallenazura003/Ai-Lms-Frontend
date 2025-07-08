'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const router = useRouter();

    const handleSearch = () => {
        if (query.trim()) {
            router.push(`/search?keyword=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Input
                placeholder="Tìm kiếm khóa học..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full max-w-sm"
            />
            <Button onClick={handleSearch} variant="default">
                <Search className="w-4 h-4 mr-1" />
                Tìm
            </Button>
        </div>
    );
}

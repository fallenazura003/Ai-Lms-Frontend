'use client';

import { Button } from '@/components/ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPages = () => {
        const pages = [];

        // Always show first
        if (currentPage > 2) {
            pages.push(0);
            if (currentPage > 3) pages.push('...');
        }

        // Show current ±2
        for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
            pages.push(i);
        }

        // Always show last
        if (currentPage < totalPages - 3) {
            if (currentPage < totalPages - 4) pages.push('...');
            pages.push(totalPages - 1);
        }

        return pages;
    };

    const pages = getPages();

    return (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
            <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => onPageChange(0)}
            >
                «
            </Button>

            <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => onPageChange(currentPage - 1)}
            >
                ‹
            </Button>

            {pages.map((page, index) =>
                typeof page === 'number' ? (
                    <Button
                        key={index}
                        size="sm"
                        variant={page === currentPage ? 'default' : 'outline'}
                        onClick={() => onPageChange(page)}
                    >
                        {page + 1}
                    </Button>
                ) : (
                    <span key={index} className="px-2 text-gray-400 select-none">...</span>
                )
            )}

            <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages - 1}
                onClick={() => onPageChange(currentPage + 1)}
            >
                ›
            </Button>

            <Button
                size="sm"
                variant="outline"
                disabled={currentPage === totalPages - 1}
                onClick={() => onPageChange(totalPages - 1)}
            >
                »
            </Button>
        </div>
    );
}

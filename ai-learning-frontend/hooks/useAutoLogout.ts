import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/auth';
import { toast } from 'sonner';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 5 phút

export const useAutoLogout = () => {
    const { logout } = useAuth();
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(handleLogout, INACTIVITY_TIMEOUT);
    };

    const handleLogout = () => {
        toast.warning('Bạn đã bị đăng xuất do không hoạt động quá lâu.');

        // Xoá token
        logout();

        // Chuyển hướng về trang đăng nhập
        router.push('/');
    };

    useEffect(() => {
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];

        events.forEach((event) => window.addEventListener(event, resetTimer));
        resetTimer(); // Đặt timer khi mount

        return () => {
            events.forEach((event) => window.removeEventListener(event, resetTimer));
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);
};

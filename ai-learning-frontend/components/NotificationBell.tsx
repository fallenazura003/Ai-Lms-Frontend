import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { connectSocket, disconnectSocket } from "@/utils/socket";
import { Bell } from "lucide-react";
import api from "@/lib/api";

interface Props {
    email: string;
}

export default function NotificationBell({ email }: Props) {
    const {
        notifications,
        addNotification,
        setNotifications,
        markAsRead,
    } = useNotificationStore();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // ✅ Fetch ban đầu bằng api custom
        api.get("/notifications")
            .then((res) => setNotifications(res.data))
            .catch((err) => console.error("Lỗi fetch notifications:", err));

        // ✅ Kết nối socket
        connectSocket(email, (msg) => addNotification(msg));

        return () => disconnectSocket();
    }, [email]);

    const unreadCount = notifications.filter((n) => !n.read).length;

    const handleRead = (id: number) => {
        api.post(`/notifications/${id}/read`)
            .then(() => markAsRead(id))
            .catch((err) => console.error("Lỗi đánh dấu đã đọc:", err));
    };

    return (
        <div className="relative">
            <button onClick={() => setOpen(!open)} className="relative">
                <Bell />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>
            {open && (
                <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-md max-h-[400px] overflow-y-auto z-50">
                    {notifications.map((n) => (
                        <div
                            key={n.id}
                            className={`p-2 border-b hover:bg-gray-100 cursor-pointer ${
                                n.read ? "text-gray-500" : "font-semibold"
                            }`}
                            onClick={() => handleRead(n.id)}
                        >
                            {n.message}
                            <div className="text-xs text-gray-400">
                                {new Date(n.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="p-4 text-gray-500 text-center">Không có thông báo</div>
                    )}
                </div>
            )}
        </div>
    );
}

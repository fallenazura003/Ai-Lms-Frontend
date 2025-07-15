import { useEffect, useState } from "react";
import { useNotificationStore } from "@/store/useNotificationStore";
import { connectSocket, disconnectSocket } from "@/utils/socket";
import { Bell } from "lucide-react";
import api from "@/lib/api";

// ... imports

interface Props {
    email: string;
}

export default function NotificationBell({ email }: Props) {
    const {
        notifications,
        addNotification,
        setNotifications,
    } = useNotificationStore();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        api.get("/notifications")
            .then((res) => setNotifications(res.data))
            .catch((err) => console.error("Lỗi fetch notifications:", err));

        connectSocket(email, (msg) => addNotification(msg));

        return () => disconnectSocket();
    }, [email]);

    // ✅ Change to n.isRead
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleBellClick = async () => {
        // Only perform the mark-as-read API call and state update if the bell is being opened
        // AND there are unread notifications.
        // This prevents unnecessary API calls when closing the bell or if no unread notifications exist.
        if (!open && unreadCount > 0) {
            try {
                await api.post("/notifications/mark-all-as-read");
                // Optimistically update the store: map all existing notifications to isRead: true
                setNotifications(notifications.map(n => ({ ...n, isRead: true })));
                console.log("All notifications marked as read and state updated.");
            } catch (err) {
                console.error("Lỗi đánh dấu tất cả đã đọc:", err);
                // Optionally, fetch notifications again if marking failed to re-sync
                // api.get("/notifications").then((res) => setNotifications(res.data));
            }
        }
        setOpen(!open); // Always toggle dropdown visibility
    };

    return (
        <div className="relative">
            <button onClick={handleBellClick} className="relative">
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
                            className={`p-2 border-b ${
                                // ✅ Change to n.isRead
                                n.isRead ? "text-gray-500" : "font-semibold bg-blue-50"
                            }`}
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
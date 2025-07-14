// stores/useNotificationStore.ts
import { create } from "zustand";

export interface Notification {
    id: number;
    message: string;
    type: string;
    read: boolean;
    createdAt: string;
}

type NotificationStore = {
    notifications: Notification[];
    addNotification: (noti: Notification) => void;
    setNotifications: (list: Notification[]) => void;
    markAsRead: (id: number) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (noti) => set((state) => ({
        notifications: [noti, ...state.notifications],
    })),
    setNotifications: (list) => set({ notifications: list }),
    markAsRead: (id) => set((state) => ({
        notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
        ),
    })),
}));

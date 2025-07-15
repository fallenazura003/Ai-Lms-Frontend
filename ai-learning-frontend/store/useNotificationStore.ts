// stores/useNotificationStore.ts
import { create } from "zustand";

export interface Notification {
    id: number;
    message: string;
    type: string;
    // ✅ Change 'read' to 'isRead'
    isRead: boolean; // Changed from 'read' to 'isRead'
    createdAt: string;
}

type NotificationStore = {
    notifications: Notification[];
    addNotification: (noti: Notification) => void;
    setNotifications: (list: Notification[]) => void;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    addNotification: (noti) => set((state) => ({
        notifications: [noti, ...state.notifications],
    })),
    setNotifications: (list) => set({ notifications: list }),
}));
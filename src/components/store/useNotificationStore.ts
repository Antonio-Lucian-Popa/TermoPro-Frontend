import { NotificationMessage } from '@/context/NotificationContext';
import { create } from 'zustand';


type NotificationState = {
  notifications: NotificationMessage[];
  addNotification: (n: NotificationMessage) => void;
  clearNotifications: () => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  addNotification: (n) => set((state) => ({ notifications: [n, ...state.notifications] })),
  clearNotifications: () => set({ notifications: [] }),
}));

import { ref, computed } from 'vue';
import { io, Socket } from 'socket.io-client';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, API_URL } from '../services/api';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue3-toastify';

const notifications = ref<any[]>([]);
const isConnected = ref(false);
let socket: Socket | null = null;

export function useNotifications() {
  const authStore = useAuthStore();

  const connect = () => {
    if (socket || !authStore.user?.userId) return;

    socket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      isConnected.value = true;
      // Tell backend who we are
      socket?.emit('joinUserRoom', authStore.user?.userId);
    });

    socket.on('disconnect', () => {
      isConnected.value = false;
    });

    socket.on('notification', (notification) => {
      notifications.value.unshift(notification);
      // Play a little toast
      toast.info(`🔔 ${notification.message}`, {
        autoClose: 5000,
        position: 'bottom-right',
      });
    });
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      socket = null;
      isConnected.value = false;
    }
    notifications.value = [];
  };

  const loadNotifications = async () => {
    if (!authStore.isLoggedIn) return;
    try {
      notifications.value = await fetchNotifications();
    } catch (e) {
      console.error('Failed to load notifications');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      const index = notifications.value.findIndex(n => n.id === id);
      if (index !== -1) {
        notifications.value[index].isRead = true;
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      notifications.value.forEach(n => n.isRead = true);
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length;
  });

  return {
    notifications,
    isConnected,
    unreadCount,
    connect,
    disconnect,
    loadNotifications,
    markAsRead,
    markAllRead,
  };
}

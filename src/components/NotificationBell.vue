<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useNotifications } from '../composables/useNotifications';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();
const { notifications, unreadCount, connect, disconnect, loadNotifications, markAsRead, markAllRead } = useNotifications();

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleNotificationClick = async (notification: any) => {
  if (!notification.isRead) {
    await markAsRead(notification.id);
  }
  if (notification.link) {
    router.push(notification.link);
  }
  isOpen.value = false;
};

const closeDropdown = (e: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

const initNotifications = () => {
  if (authStore.isLoggedIn) {
    connect();
    loadNotifications();
  } else {
    disconnect();
  }
};

// Re-initialize if auth state changes
watch(() => authStore.isLoggedIn, () => {
  initNotifications();
});

onMounted(() => {
  document.addEventListener('click', closeDropdown);
  initNotifications();
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
  disconnect();
});

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>

<template>
  <div class="notification-wrapper" ref="dropdownRef" v-if="authStore.isLoggedIn">
    <button class="bell-btn" @click="toggleDropdown" title="Notifications">
      <span class="bell-icon">🔔</span>
      <span class="badge" v-if="unreadCount > 0">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
    </button>

    <Transition name="fade-slide">
      <div class="notification-dropdown" v-if="isOpen">
        <div class="dropdown-header">
          <h3>Notifications</h3>
          <button v-if="unreadCount > 0" class="btn-mark-all" @click="markAllRead">Mark all as read</button>
        </div>
        
        <div class="dropdown-body">
          <div v-if="notifications.length === 0" class="empty-state">
            No notifications yet.
          </div>
          <div 
            v-else 
            v-for="notif in notifications" 
            :key="notif.id"
            class="notification-item"
            :class="{ 'is-unread': !notif.isRead }"
            @click="handleNotificationClick(notif)"
          >
            <div class="notif-content">
              <span class="notif-icon" v-if="notif.type === 'COMMENT'">💬</span>
              <span class="notif-icon" v-else>📣</span>
              <div class="notif-text">
                <p class="message">{{ notif.message }}</p>
                <span class="time">{{ formatDate(notif.createdAt) }}</span>
              </div>
            </div>
            <div class="unread-dot" v-if="!notif.isRead"></div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.notification-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.bell-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.bell-btn:hover {
  background-color: rgba(255, 255, 255, 0.05);
}

.bell-icon {
  font-size: 1.25rem;
  filter: grayscale(100%);
  opacity: 0.8;
  transition: opacity 0.2s;
}

.bell-btn:hover .bell-icon {
  opacity: 1;
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background-color: var(--color-accent);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 12px;
  width: 320px;
  max-height: 400px;
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  z-index: 100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  background-color: rgba(0, 0, 0, 0.2);
}

.dropdown-header h3 {
  font-family: var(--font-sans);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-main);
  margin: 0;
}

.btn-mark-all {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.btn-mark-all:hover {
  color: var(--color-accent);
}

.dropdown-body {
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  font-family: var(--font-serif);
  font-style: italic;
  color: var(--color-text-muted);
  font-size: 0.9rem;
}

.notification-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.notif-content {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  flex: 1;
}

.notif-icon {
  font-size: 1.2rem;
  margin-top: 2px;
}

.notif-text {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message {
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text-main);
  margin: 0;
  line-height: 1.4;
}

.notification-item.is-unread .message {
  font-weight: 700;
}

.time {
  font-family: var(--font-sans);
  font-size: 0.7rem;
  color: var(--color-text-muted);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background-color: var(--color-accent);
  border-radius: 50%;
  margin-left: 12px;
  flex-shrink: 0;
}

/* Animations */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

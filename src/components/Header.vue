<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out successfully')
  router.push('/')
}
</script>

<template>
  <header class="header glass-panel">
    <div class="header-content container">
      <RouterLink to="/" class="logo">
        <span class="text-gradient">Media</span>Log
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink to="/stats" class="nav-link">Stats</RouterLink>
        <button class="theme-toggle" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="btn-primary">Admin Login</RouterLink>
        <button v-else @click="handleLogout" class="btn-primary" style="background: rgba(255,255,255,0.1); color: var(--color-text-main);">Logout</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
}
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}
.logo {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.5rem;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 24px;
}
.nav-link {
  font-weight: 500;
  transition: color 0.2s;
  color: var(--color-text-main);
}
.nav-link:hover {
  color: var(--color-primary);
}
.theme-toggle {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}
.theme-toggle:hover {
  background: var(--glass-border);
}
</style>

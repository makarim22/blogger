<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out successfully')
  router.push('/')
}
</script>

<template>
  <header class="header glass-panel">
    <div class="container header-content">
      <RouterLink to="/" class="logo">
        <span class="text-gradient">Nex</span>Blog
      </RouterLink>
      <nav class="nav-links">
        <RouterLink to="/" class="nav-link">Home</RouterLink>
        <RouterLink v-if="!authStore.isLoggedIn" to="/login" class="btn-primary">Admin Login</RouterLink>
        <button v-else @click="handleLogout" class="btn-primary" style="background: rgba(255,255,255,0.1)">Logout</button>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 16px;
  z-index: 100;
  margin: 16px auto;
  width: calc(100% - 32px);
  max-width: 1200px;
  border-radius: 100px; /* Pill shape */
  padding: 12px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 24px;
  align-items: center;
}

.nav-link {
  font-weight: 500;
  color: var(--color-text-main);
  transition: color 0.2s ease;
}

.nav-link:hover {
  color: var(--color-primary);
}
</style>

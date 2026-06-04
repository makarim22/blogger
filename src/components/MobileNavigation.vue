<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const dispatchCommandK = () => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
}
</script>

<template>
  <nav class="mobile-nav">
    <div class="nav-container">
      <RouterLink to="/" class="nav-item" exact-active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
        <span>Home</span>
      </RouterLink>

      <RouterLink to="/movies" class="nav-item" exact-active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18"></rect><line x1="7" x2="7" y1="2" y2="22"></line><line x1="17" x2="17" y1="2" y2="22"></line><line x1="2" x2="22" y1="12" y2="12"></line><line x1="2" x2="7" y1="7" y2="7"></line><line x1="2" x2="7" y1="17" y2="17"></line><line x1="17" x2="22" y1="17" y2="17"></line><line x1="17" x2="22" y1="7" y2="7"></line></svg>
        <span>Cinema</span>
      </RouterLink>

      <button class="nav-item" @click="dispatchCommandK">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        <span>Search</span>
      </button>

      <RouterLink to="/books" class="nav-item" exact-active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
        <span>Lit</span>
      </RouterLink>
      
      <RouterLink v-if="authStore.user" to="/board" class="nav-item" exact-active-class="active">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
        <span>Explore</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
.mobile-nav {
  display: block; /* Visible by default on mobile */
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--color-surface);
  border-top: 1px solid var(--color-border);
  z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 64px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--color-text-muted);
  background: none;
  border: none;
  text-decoration: none;
  font-family: var(--font-sans);
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 8px 12px;
  transition: color 0.2s;
  cursor: pointer;
  min-width: 64px;
  min-height: 48px; /* Standard mobile touch target size */
}

.nav-item svg {
  transition: transform 0.2s, stroke-width 0.2s;
}

.nav-item:hover,
.nav-item.active {
  color: var(--color-text-main);
}

.nav-item.active svg {
  stroke-width: 2.5;
  transform: translateY(-2px);
}

@media (min-width: 768px) {
  .mobile-nav {
    display: none; /* Hide on tablets and desktops */
  }
}
</style>

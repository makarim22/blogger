<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'
import { useTheme } from '../composables/useTheme'
import GlobalSearch from './GlobalSearch.vue'

const router = useRouter()
const authStore = useAuthStore()
const { currentTheme, toggleTheme } = useTheme()

const showWriteMenu = ref(false)
const showExploreMenu = ref(false)
const showMobileMenu = ref(false)
const isAmbientPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

const dispatchCommandK = () => {
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
}

const toggleAmbient = () => {
  if (audioRef.value) {
    if (isAmbientPlaying.value) {
      audioRef.value.pause()
      isAmbientPlaying.value = false
    } else {
      audioRef.value.play().then(() => {
        isAmbientPlaying.value = true
      }).catch(() => {
        toast.error('Browser blocked autoplay.')
      })
    }
  }
}

const toggleWriteMenu = () => {
  showWriteMenu.value = !showWriteMenu.value
}

const closeWriteMenu = () => {
  showWriteMenu.value = false
}

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}

watch(showMobileMenu, (isOpen) => {
  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const handleLogout = () => {
  authStore.logout()
  toast.info('Logged out')
  router.push('/')
}

const onClickOutside = (e: Event) => {
  const target = e.target as HTMLElement
  if (!target.closest('.editor-menu-container')) {
    showWriteMenu.value = false
  }
}

onMounted(() => window.addEventListener('click', onClickOutside))
onUnmounted(() => window.removeEventListener('click', onClickOutside))
</script>

<template>
  <header class="header">
    <div class="header-content container">
      <div class="nav-brand">
        <RouterLink to="/" class="logo">LITERARY NOIR</RouterLink>
      </div>

      <nav class="nav-center">
        <RouterLink to="/movies" class="nav-link">Cinema</RouterLink>
        <RouterLink to="/books" class="nav-link">Literature</RouterLink>
        
        <div class="explore-dropdown-container" @mouseenter="showExploreMenu = true" @mouseleave="showExploreMenu = false">
          <button class="nav-link explore-btn">
            Explore
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 2px; vertical-align: middle;"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </button>
          
          <Transition name="dropdown">
            <div v-show="showExploreMenu" class="explore-dropdown">
              <RouterLink to="/timeline" class="dropdown-item">Timeline</RouterLink>
              <RouterLink to="/board" class="dropdown-item">Investigation</RouterLink>
              <RouterLink to="/vs" class="dropdown-item">Adaptations</RouterLink>
            </div>
          </Transition>
        </div>
      </nav>

      <div class="nav-right">
        <!-- Search Hint -->
        <div class="search-hint" @click="dispatchCommandK">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <span>Search</span>
          <kbd>⌘K</kbd>
        </div>

        <!-- Global Search -->
        <GlobalSearch class="global-search-component" />

        <!-- Ambient Soundscapes -->
        <button class="icon-btn theme-btn btn-ambient" @click="toggleAmbient" :title="isAmbientPlaying ? 'Pause Ambient Rain' : 'Play Ambient Rain'">
          <span v-if="isAmbientPlaying">🌧️</span>
          <span v-else style="filter: grayscale(100%); opacity: 0.5;">🌧️</span>
        </button>
        <audio ref="audioRef" loop>
          <source src="https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" type="audio/ogg">
        </audio>

        <!-- Theme Toggle -->
        <button class="icon-btn theme-btn" @click="toggleTheme" :title="`Current: ${currentTheme}`">
          <!-- Light icon (sun) -->
          <svg v-if="currentTheme === 'light'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
          <!-- Cinema icon (film) -->
          <svg v-else-if="currentTheme === 'cinema'" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
            <line x1="7" y1="2" x2="7" y2="22"></line>
            <line x1="17" y1="2" x2="17" y2="22"></line>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <line x1="2" y1="7" x2="7" y2="7"></line>
            <line x1="2" y1="17" x2="7" y2="17"></line>
            <line x1="17" y1="17" x2="22" y2="17"></line>
            <line x1="17" y1="7" x2="22" y2="7"></line>
          </svg>
          <!-- Literature icon (book) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
        </button>

        <!-- Write Dropdown (Editor only) -->
        <div v-if="authStore.isLoggedIn" class="editor-menu-container">
          <button @click.stop="toggleWriteMenu" class="btn-write" :class="{ active: showWriteMenu }">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; vertical-align: middle;">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Write
          </button>
          <Transition name="dropdown">
            <div v-if="showWriteMenu" class="write-dropdown">
              <RouterLink to="/write/movies" class="dropdown-item" @click="closeWriteMenu">
                <span class="dropdown-icon">🎬</span>
                Cinema Critique
              </RouterLink>
              <RouterLink to="/write/books" class="dropdown-item" @click="closeWriteMenu">
                <span class="dropdown-icon">📖</span>
                Literature Critique
              </RouterLink>
            </div>
          </Transition>
        </div>

        <template v-if="authStore.isLoggedIn">
          <RouterLink v-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'EDITOR'" to="/dossier" class="nav-link auth-link desktop-auth">Dashboard</RouterLink>
          <RouterLink to="/profile" class="nav-link auth-link desktop-auth">Profile</RouterLink>
          <button @click="handleLogout" class="nav-link auth-link btn-logout desktop-auth">Logout</button>
        </template>
        <RouterLink v-else to="/login" class="nav-link auth-link desktop-auth">Login</RouterLink>
        
        <!-- Mobile Menu Toggle -->
        <button class="icon-btn mobile-menu-btn" @click="toggleMobileMenu">
          <svg v-if="!showMobileMenu" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line></svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </div>
    <div class="header-border"></div>

    <!-- Mobile Full Screen Menu Overlay -->
    <Transition name="fade">
      <div v-if="showMobileMenu" class="mobile-menu-overlay">
        <nav class="mobile-nav-links">
          <RouterLink to="/" class="mobile-nav-item" @click="closeMobileMenu">Home</RouterLink>
          <RouterLink to="/movies" class="mobile-nav-item" @click="closeMobileMenu">Cinema</RouterLink>
          <RouterLink to="/books" class="mobile-nav-item" @click="closeMobileMenu">Literature</RouterLink>
          <div class="mobile-nav-divider"></div>
          <RouterLink to="/timeline" class="mobile-nav-item" @click="closeMobileMenu">Timeline</RouterLink>
          <RouterLink to="/board" class="mobile-nav-item" @click="closeMobileMenu">Investigation Board</RouterLink>
          <RouterLink to="/vs" class="mobile-nav-item" @click="closeMobileMenu">Adaptations</RouterLink>
          <div class="mobile-nav-divider"></div>
          <template v-if="authStore.isLoggedIn">
            <RouterLink v-if="authStore.user?.role === 'ADMIN' || authStore.user?.role === 'EDITOR'" to="/dossier" class="mobile-nav-item" @click="closeMobileMenu">Admin Dashboard</RouterLink>
            <RouterLink to="/profile" class="mobile-nav-item" @click="closeMobileMenu">Profile</RouterLink>
            <button @click="() => { handleLogout(); closeMobileMenu(); }" class="mobile-nav-item mobile-logout-btn">Logout</button>
          </template>
          <RouterLink v-else to="/login" class="mobile-nav-item" @click="closeMobileMenu">Login</RouterLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: var(--color-bg);
  transition: background-color 0.3s ease;
}

.header-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  height: 80px;
  position: relative;
}

.nav-brand {
  /* Let flex decide based on content */
  display: flex;
  align-items: center;
}

.logo {
  font-family: var(--font-serif);
  font-weight: 900;
  font-size: 1.5rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-main);
  transition: color 0.2s;
}

.logo:hover {
  color: var(--color-accent);
}

.nav-center {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.nav-right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
  min-width: max-content;
}

.global-search-component {
  margin-right: 8px;
  display: none;
}

.search-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: 0.85rem;
  color: var(--color-text-muted);
  transition: all 0.2s ease;
  margin-right: 8px;
}

.search-hint:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-main);
  border-color: var(--color-text-main);
}

.search-hint kbd {
  background: rgba(0, 0, 0, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-family: monospace;
  letter-spacing: 0.05em;
}

.nav-link {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text-main);
}

.explore-dropdown-container {
  position: relative;
  display: flex;
  align-items: center;
}

.explore-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
}

.explore-dropdown {
  position: absolute;
  top: calc(100% + 20px); /* Account for nav height */
  left: 50%;
  transform: translateX(-50%);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  z-index: 200;
  display: flex;
  flex-direction: column;
  min-width: 180px;
  overflow: hidden;
}

/* Connect the gap between button and dropdown so hover doesn't break */
.explore-dropdown-container::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  height: 25px;
}

.auth-link {
  font-size: 0.75rem;
}

/* Theme toggle button */
.icon-btn {
  background: none;
  border: 1px solid transparent;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: var(--color-text-main);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.icon-btn:hover {
  border-color: var(--color-border);
  background-color: var(--color-surface);
}

/* Write dropdown */
.editor-menu-container {
  position: relative;
}

.btn-write {
  display: flex;
  align-items: center;
  background: none;
  border: 1px solid var(--color-border);
  padding: 7px 14px;
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-write:hover,
.btn-write.active {
  border-color: var(--color-text-main);
  color: var(--color-text-main);
}

.write-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  background-color: var(--color-bg);
  border: 1px solid var(--color-text-main);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  display: flex;
  flex-direction: column;
  min-width: 200px;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  font-family: var(--font-sans);
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: background-color 0.15s, color 0.15s;
  border-bottom: none;
}

.dropdown-item:not(:last-child) {
  border-bottom: 1px solid var(--color-border);
}

.dropdown-item:hover {
  background-color: var(--color-text-main);
  color: var(--color-bg);
}

.dropdown-icon {
  font-size: 1rem;
  opacity: 1;
}

/* Dropdown animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.btn-logout {
  border: none;
  background: none;
  cursor: pointer;
}

.header-border {
  width: 100%;
  height: 1px;
  background-color: var(--color-border-dark);
}

.mobile-menu-btn {
  display: none;
  z-index: 100;
}

.mobile-menu-overlay {
  position: fixed;
  top: 61px; /* Below slimmer header */
  left: 0;
  width: 100%;
  height: calc(100vh - 61px);
  background-color: var(--color-bg);
  z-index: 90;
  display: flex;
  flex-direction: column;
  padding: 40px 24px;
  overflow-y: auto;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 32px;
}

.mobile-nav-item {
  font-family: var(--font-serif);
  font-size: 1.8rem;
  color: var(--color-text-main);
  text-decoration: none;
  font-weight: 700;
  transition: color 0.2s;
  background: none;
  border: none;
  text-align: center;
  cursor: pointer;
  padding: 0;
}

.mobile-nav-item:hover {
  color: var(--color-accent);
}

.mobile-logout-btn {
  color: var(--color-text-muted);
}

.mobile-nav-divider {
  width: 40px;
  height: 2px;
  background-color: var(--color-accent);
  margin: 8px 0;
  opacity: 1;
}

@media (max-width: 768px) {
  .nav-center,
  .search-hint,
  .btn-ambient,
  .desktop-auth {
    display: none !important;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .header-content {
    height: 60px; /* Slimmer header on mobile */
  }
}
</style>

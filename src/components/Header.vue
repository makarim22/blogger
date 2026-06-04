<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { toast } from 'vue3-toastify'
import { useTheme } from '../composables/useTheme'
import GlobalSearch from './GlobalSearch.vue'

const router = useRouter()
const authStore = useAuthStore()
const { isDark, toggleTheme } = useTheme()

const showWriteMenu = ref(false)
const isAmbientPlaying = ref(false)
const audioRef = ref<HTMLAudioElement | null>(null)

const toggleAmbient = () => {
  if (audioRef.value) {
    if (isAmbientPlaying.value) {
      audioRef.value.pause()
      isAmbientPlaying.value = false
    } else {
      audioRef.value.play().then(() => {
        isAmbientPlaying.value = true
      }).catch(e => {
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
        <RouterLink to="/timeline" class="nav-link">Timeline</RouterLink>
      </nav>

      <div class="nav-right">
        <!-- Global Search -->
        <GlobalSearch class="global-search-component" />

        <!-- Ambient Soundscapes -->
        <button class="icon-btn theme-btn" @click="toggleAmbient" :title="isAmbientPlaying ? 'Pause Ambient Rain' : 'Play Ambient Rain'">
          <span v-if="isAmbientPlaying">🌧️</span>
          <span v-else style="filter: grayscale(100%); opacity: 0.5;">🌧️</span>
        </button>
        <audio ref="audioRef" loop>
          <source src="https://actions.google.com/sounds/v1/weather/rain_on_roof.ogg" type="audio/ogg">
        </audio>

        <!-- Theme Toggle -->
        <button class="icon-btn theme-btn" @click="toggleTheme" :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <!-- Sun icon (light mode active) -->
          <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
          <!-- Moon icon (dark mode active) -->
          <svg v-else xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
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
          <RouterLink to="/profile" class="nav-link auth-link">Dossier</RouterLink>
          <button @click="handleLogout" class="nav-link auth-link btn-logout">Logout</button>
        </template>
        <RouterLink v-else to="/login" class="nav-link auth-link">Editor</RouterLink>
      </div>
    </div>
    <div class="header-border"></div>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.nav-brand {
  flex: 1;
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
  flex: 2;
  display: flex;
  justify-content: center;
  gap: 40px;
}

.nav-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

.global-search-component {
  margin-right: 8px;
}

.nav-link {
  font-family: var(--font-sans);
  font-weight: 500;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-text-muted);
  transition: color 0.2s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--color-text-main);
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
  opacity: 0.8;
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

@media (max-width: 900px) {
  .nav-center {
    display: none;
  }
}
</style>

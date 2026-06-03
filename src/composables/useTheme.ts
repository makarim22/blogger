import { ref } from 'vue'

// Shared state so all component instances are in sync
const isDark = ref(false)
let initialized = false

const applyTheme = (dark: boolean) => {
  isDark.value = dark
  if (dark) {
    document.documentElement.classList.add('dark-theme')
    document.body.classList.add('dark-theme')
  } else {
    document.documentElement.classList.remove('dark-theme')
    document.body.classList.remove('dark-theme')
  }
  localStorage.setItem('theme', dark ? 'dark' : 'light')
}

const initTheme = () => {
  if (initialized) return
  initialized = true
  const savedTheme = localStorage.getItem('theme')
  // Default to light mode if no saved preference
  applyTheme(savedTheme === 'dark')
}

export function useTheme() {
  const toggleTheme = () => {
    applyTheme(!isDark.value)
  }

  // Initialize once on first use
  if (typeof document !== 'undefined') {
    initTheme()
  }

  return { isDark, toggleTheme }
}


import { ref } from 'vue'

// Shared state so all component instances are in sync
const currentTheme = ref<'light' | 'cinema' | 'literature'>('light')
let initialized = false

const applyTheme = (theme: 'light' | 'cinema' | 'literature') => {
  currentTheme.value = theme
  document.documentElement.classList.remove('theme-light', 'theme-cinema', 'theme-literature', 'dark-theme')
  document.body.classList.remove('theme-light', 'theme-cinema', 'theme-literature', 'dark-theme')
  
  if (theme !== 'light') {
    document.documentElement.classList.add(`theme-${theme}`, 'dark-theme')
    document.body.classList.add(`theme-${theme}`, 'dark-theme')
  }
  
  localStorage.setItem('noir_theme', theme)
}

const initTheme = () => {
  if (initialized) return
  initialized = true
  const savedTheme = localStorage.getItem('noir_theme') as 'light' | 'cinema' | 'literature'
  // Default to light mode if no saved preference
  applyTheme(savedTheme || 'light')
}

export function useTheme() {
  const toggleTheme = () => {
    if (currentTheme.value === 'light') applyTheme('cinema')
    else if (currentTheme.value === 'cinema') applyTheme('literature')
    else applyTheme('light')
  }

  // Initialize once on first use
  if (typeof document !== 'undefined') {
    initTheme()
  }

  return { currentTheme, toggleTheme }
}


import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  // Default to cinema theme
  const currentTheme = ref<'cinema' | 'literature'>(
    (localStorage.getItem('noir_theme') as 'cinema' | 'literature') || 'cinema'
  )

  const toggleTheme = () => {
    currentTheme.value = currentTheme.value === 'cinema' ? 'literature' : 'cinema'
  }

  // Watch for changes and update the DOM
  watch(currentTheme, (newTheme) => {
    localStorage.setItem('noir_theme', newTheme)
    
    // Clean up old classes
    document.documentElement.classList.remove('theme-cinema', 'theme-literature', 'dark-theme')
    
    // Apply new theme class
    document.documentElement.classList.add(`theme-${newTheme}`)
  }, { immediate: true })

  return {
    currentTheme,
    toggleTheme
  }
})

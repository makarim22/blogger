import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDark = ref(true)

  const applyTheme = (dark: boolean) => {
    isDark.value = dark
    if (dark) {
      document.body.classList.remove('light-theme')
    } else {
      document.body.classList.add('light-theme')
    }
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    applyTheme(!isDark.value)
  }

  onMounted(() => {
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      applyTheme(savedTheme === 'dark')
    } else {
      // Default to dark
      applyTheme(true)
    }
  })

  return { isDark, toggleTheme }
}

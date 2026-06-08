import { createApp } from 'vue'
import './style.css'
import 'vue3-toastify/dist/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { VueQueryPlugin } from '@tanstack/vue-query'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import { createHead } from '@unhead/vue/client'
import { registerSW } from 'virtual:pwa-register'

registerSW({ immediate: true })

const app = createApp(App)
const pinia = createPinia()
const head = createHead()

app.use(router)
app.use(pinia)
app.use(VueQueryPlugin)
app.use(head)
app.use(Vue3Toastify, {
  autoClose: 3000,
  theme: 'dark',
} as ToastContainerOptions)

app.mount('#app')

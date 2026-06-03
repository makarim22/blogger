import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './views/HomePage.vue'
import PostPage from './views/PostPage.vue'
import LoginView from './views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/post/:id',
      name: 'post',
      component: PostPage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

export default router

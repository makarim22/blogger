import { createRouter, createWebHistory } from 'vue-router'
import BlogHomepage from './views/BlogHomepage.vue'
import CategoryPage from './views/CategoryPage.vue'
import ReviewDetail from './views/ReviewDetail.vue'
import LoginView from './views/LoginView.vue'
import StatsView from './views/StatsView.vue'
import WriteReviewPage from './views/WriteReviewPage.vue'
import ProfileView from './views/ProfileView.vue'
import TimelineView from './views/TimelineView.vue'
import AboutView from './views/AboutView.vue'
import PrivacyView from './views/PrivacyView.vue'
import TermsView from './views/TermsView.vue'
import GuidelinesView from './views/GuidelinesView.vue'
import RedStringBoard from './views/RedStringBoard.vue'
import VsModeView from './views/VsModeView.vue'
import AuthCallback from './views/AuthCallback.vue'
import AdminDashboard from './views/AdminDashboard.vue'

// Auth guard for editor-only routes
const requireAuth = (_to: any, _from: any, next: Function) => {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    next({ path: '/login' })
  } else {
    next()
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
  routes: [
    {
      path: '/',
      name: 'home',
      component: BlogHomepage
    },
    {
      path: '/movies',
      name: 'movies',
      component: CategoryPage,
      props: { type: 'movies' }
    },
    {
      path: '/books',
      name: 'books',
      component: CategoryPage,
      props: { type: 'books' }
    },
    {
      path: '/review/:type/:id',
      name: 'review',
      component: ReviewDetail
    },
    {
      path: '/write/:type',
      name: 'write',
      component: WriteReviewPage,
      beforeEnter: requireAuth
    },
    {
      path: '/edit/:type/:id',
      name: 'edit',
      component: WriteReviewPage,
      beforeEnter: requireAuth
    },
    {
      path: '/stats',
      name: 'stats',
      component: StatsView
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      beforeEnter: requireAuth
    },
    {
      path: '/timeline',
      name: 'timeline',
      component: TimelineView
    },
    {
      path: '/board',
      name: 'board',
      component: RedStringBoard
    },
    {
      path: '/vs',
      name: 'vs',
      component: VsModeView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/about',
      name: 'about',
      component: AboutView
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: PrivacyView
    },
    {
      path: '/terms',
      name: 'terms',
      component: TermsView
    },
    {
      path: '/guidelines',
      name: 'guidelines',
      component: GuidelinesView
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: AuthCallback
    },
    {
      path: '/dossier',
      name: 'dossier',
      component: AdminDashboard,
      beforeEnter: requireAuth
    }
  ]
})

export default router


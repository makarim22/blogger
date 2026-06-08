import { createRouter, createWebHistory } from 'vue-router'
// Lazy loaded views
const BlogHomepage = () => import('./views/BlogHomepage.vue')
const ForYouView = () => import('./views/ForYouView.vue')
const PostPage = () => import('./views/PostPage.vue')
const CategoryPage = () => import('./views/CategoryPage.vue')
const ReviewDetail = () => import('./views/ReviewDetail.vue')
const LoginView = () => import('./views/LoginView.vue')
const StatsView = () => import('./views/StatsView.vue')
const WriteReviewPage = () => import('./views/WriteReviewPage.vue')
const ProfileView = () => import('./views/ProfileView.vue')
const TimelineView = () => import('./views/TimelineView.vue')
const AboutView = () => import('./views/AboutView.vue')
const PrivacyView = () => import('./views/PrivacyView.vue')
const TermsView = () => import('./views/TermsView.vue')
const GuidelinesView = () => import('./views/GuidelinesView.vue')
const RedStringBoard = () => import('./views/RedStringBoard.vue')
const VsModeView = () => import('./views/VsModeView.vue')
const AuthCallback = () => import('./views/AuthCallback.vue')
const AdminDashboard = () => import('./views/AdminDashboard.vue')

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
      path: '/for-you',
      name: 'for-you',
      component: ForYouView
    },
    {
      path: '/post/:id',
      name: 'post',
      component: PostPage
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


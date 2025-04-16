

import { useAuthStore } from '@/features/auth/store'
import { Enable2FAView, RegisterView } from '@/features/auth/views'

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useToast } from 'vue-toast-notification'

const toast = useToast()
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@/features/auth/views/LoginView.vue'),
  },
  {
    path: '/register',
    component: () => RegisterView,
  },
  {
    path: '/mfa-challenge',
    component: () => import('@/features/auth/views/TwoFAView.vue'),
    meta: { requiresTempToken: true },
  },
  {
    path: '/enable-2fa',
    component: () => Enable2FAView,
    meta: { requiresAuth: true },
  },
  {
    path: '/groups',
    component: () => import('@/features/groups/views/HelloWorld.vue'),
  },
  {
    path: '/ilos',
    component: () => import('@/features/ilos/views/HelloWorld.vue'),
  },
  {
    path: '/roles',
    component: () => import('@/features/roles/views/HelloWorld.vue'),
  },
  {
    path: '/rooms',
    component: () => import('@/features/rooms/views/HelloWorld.vue'),
  },
  {
    path: '/servers',
    component: () => import('@/features/servers/views/HelloWorld.vue'),
  },
  {
    path: '/ups',
    component: () => import('@/features/ups/views/HelloWorld.vue'),
  },
  {
    path: '/users',
    component: () => import('@/features/users/views/HelloWorld.vue'),
  },
  {
    path: '/vms',
    component: () => import('@/features/vms/views/HelloWorld.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, _, next) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    const valid = await auth.checkTokenValidity()

    if (!valid) {
      return next('/login')
    }
  }

  if (to.meta.requiresTempToken) {
    const storedToken = localStorage.getItem('twoFactorToken')

    if (!storedToken) {
      return next('/login')
    }
  }

  next()
})

const handle2FASuccess = () => {
  toast.success('2FA activée avec succès !');
  router.push('/dashboard')
}

export default router
export { handle2FASuccess }
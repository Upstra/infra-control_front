import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from 'vue-router';
import { useAuthStore } from '@/features/auth/store';
import { Enable2FAView, RegisterView } from '@/features/auth/views';
import { useToast } from 'vue-toast-notification';
import { i18n } from '@/i18n';
import { usePresenceSocket } from '@/features/presence/composables/usePresenceSocket';
import { storeToRefs } from 'pinia';
import { usePresenceStore } from '@/features/presence/store';
import { setupRoutes } from '@/features/setup/router/router';
import { setupGuard } from '@/features/setup/router/guard';
import { useSetupStore } from '@/features/setup/store';

const toast = useToast();

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/features/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/login',
    component: () => import('@/features/auth/views/LoginView.vue'),
    meta: { layout: 'none' },
  },
  {
    path: '/register',
    component: () => RegisterView,
    meta: { layout: 'none' },
  },
  {
    path: '/dashboard',
    component: () => import('@/features/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/mfa-challenge',
    component: () => import('@/features/auth/views/TwoFAView.vue'),
    meta: { requiresTempToken: true, layout: 'none' },
  },
  {
    path: '/enable-2fa',
    name: 'Enable2FA',
    component: () => Enable2FAView,
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/profile',
    component: () => import('@/features/profile/views/ProfileView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/settings',
    component: () => import('@/features/settings/views/SettingsView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/groups',
    component: () => import('@/features/groups/views/HelloWorld.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/ilos',
    component: () => import('@/features/ilos/views/HelloWorld.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/rooms',
    component: () => import('@/features/rooms/views/RoomListView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/rooms/:id',
    component: () => import('@/features/rooms/views/RoomDetails.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/rooms/create',
    component: () => import('@/features/rooms/views/CreateRoom.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/servers',
    component: () => import('@/features/servers/views/ServerListView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/servers/create',
    component: () => import('@/features/servers/views/ServerCreateView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/servers/:id',
    component: () => import('@/features/servers/views/ServerDetailsView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/logs',
    component: () => import('@/features/logs/views/LogsView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/changelog',
    component: () => import('@/features/changelog/views/ChangelogView.vue'),
    meta: { layout: 'default' },
  },
  {
    path: '/ups',
    component: () => import('@/features/ups/views/UpsListView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/ups/:id',
    component: () => import('@/features/ups/views/UpsDetailsView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/ups/create',
    component: () => import('@/features/ups/views/CreateUps.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/admin',
    component: () => import('@/features/admin/views/AdminView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true, layout: 'default' },
    children: [
      {
        path: 'users',
        component: () => import('@/features/users/views/UserListView.vue'),
        meta: { requiresAuth: true, layout: 'default' },
      },
      {
        path: 'roles',
        component: () => import('@/features/roles/views/RolesAdminView.vue'),
        meta: { requiresAuth: true, requiresAdmin: true, layout: 'default' },
      },
      {
        path: 'history',
        component: () => import('@/features/history/views/HistoryListView.vue'),
        meta: { requiresAuth: true, layout: 'default' },
      },
      { path: '', redirect: '/admin/users' },
    ],
  },
  {
    path: '/users',
    component: () => import('@/features/users/views/UserListView.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  {
    path: '/vms',
    component: () => import('@/features/vms/views/HelloWorld.vue'),
    meta: { requiresAuth: true, layout: 'default' },
  },
  ...setupRoutes,
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/components/NotFound.vue'),
    meta: { layout: 'none' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();
  const hasToken = localStorage.getItem('token');
  const hasUser = !!auth.currentUser;
  const { connect } = usePresenceSocket();
  const { isConnected } = storeToRefs(usePresenceStore());
  const isAuthenticated = !!hasToken;

  const ensureUserLoaded = async () => {
    if (hasToken && !hasUser) {
      try {
        await auth.fetchCurrentUser();
      } catch {
        auth.resetAuthState();
        next('/login');
        return false;
      }
    }
    return true;
  };

  const handleSetupRoute = async () => {
    let skipSetup = localStorage.getItem('skipSetup');
    if (skipSetup) {
      next('/dashboard');
      return false;
    }
    const setupStore = useSetupStore();
    if (!setupStore.setupStatus) await setupStore.checkSetupStatus();
    const currentStep = setupStore.setupStatus?.currentStep;
    const expectedPath = `/setup/${currentStep}`;
    if (to.path !== expectedPath) {
      next(expectedPath);
      return false;
    }
    return true;
  };

  if (!(await ensureUserLoaded())) return;

  if (to.meta.requiresAuth) {
    const valid = await auth.checkTokenValidity();
    if (!valid) return next('/login');
    if (!isConnected.value) connect();
  }

  if (
    to.meta.requiresAdmin &&
    !auth.currentUser?.roles?.some((role) => role.isAdmin)
  ) {
    toast.error(i18n.global.t('errors.forbidden'));
    return next('/');
  }

  if (to.meta.requiresTempToken && !localStorage.getItem('twoFactorToken')) {
    return next('/login');
  }

  if (isAuthenticated && to.path.startsWith('/setup')) {
    await setupGuard(to, from, next);
    return;
  }

  if (to.path.startsWith('/setup/')) {
    if (!(await handleSetupRoute())) return;
  }

  next();
});

const handle2FASuccess = () => {
  toast.success(i18n.global.t('toast.twofa_enabled'));
  router.push('/dashboard');
};

export default router;
export { handle2FASuccess };

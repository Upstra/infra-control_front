import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { useAuthStore } from "@/features/auth/store";
import { Enable2FAView, RegisterView } from "@/features/auth/views";
import { useToast } from "vue-toast-notification";
import { usePresenceSocket } from "@/features/presence/composables/usePresenceSocket";
import { storeToRefs } from "pinia";
import { usePresenceStore } from "@/features/presence/store";

const toast = useToast();

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("@/features/dashboard/views/DashboardView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/login",
    component: () => import("@/features/auth/views/LoginView.vue"),
    meta: { layout: "none" },
  },
  {
    path: "/register",
    component: () => RegisterView,
    meta: { layout: "none" },
  },
  {
    path: "/dashboard",
    component: () => import("@/features/dashboard/views/DashboardView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/mfa-challenge",
    component: () => import("@/features/auth/views/TwoFAView.vue"),
    meta: { requiresTempToken: true, layout: "none" },
  },
  {
    path: "/enable-2fa",
    name: "Enable2FA",
    component: () => Enable2FAView,
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/profile",
    component: () => import("@/features/profile/views/ProfileView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/groups",
    component: () => import("@/features/groups/views/HelloWorld.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/ilos",
    component: () => import("@/features/ilos/views/HelloWorld.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/roles",
    component: () => import("@/features/roles/views/HelloWorld.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/rooms",
    component: () => import("@/features/rooms/views/RoomListView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/rooms/:id",
    component: () => import("@/features/rooms/views/RoomDetails.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/rooms/create",
    component: () => import("@/features/rooms/views/CreateRoom.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/servers",
    component: () => import("@/features/servers/views/ServerListView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/servers/create",
    component: () => import("@/features/servers/views/ServerCreateView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/servers/:id",
    component: () => import("@/features/servers/views/ServerDetailsView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/ups",
    component: () => import("@/features/ups/views/UpsListView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/ups/:id",
    component: () => import("@/features/ups/views/UpsDetailsView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/ups/create",
    component: () => import("@/features/ups/views/CreateUps.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/users",
    component: () => import("@/features/users/views/UserListView.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/vms",
    component: () => import("@/features/vms/views/HelloWorld.vue"),
    meta: { requiresAuth: true, layout: "default" },
  },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/components/NotFound.vue"),
    meta: { layout: "none" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _, next) => {
  const auth = useAuthStore();
  const hasToken = localStorage.getItem("token");
  const hasUser = !!auth.currentUser;
  const { connect } = usePresenceSocket();
  const { isConnected } = storeToRefs(usePresenceStore());

  if (hasToken && !hasUser) {
    try {
      await auth.fetchCurrentUser();
    } catch (err) {
      auth.resetAuthState();
      return next("/login");
    }
  }

  if (to.meta.requiresAuth) {
    const valid = await auth.checkTokenValidity();
    if (!valid) return next("/login");

    if (!isConnected.value) connect();
  }

  if (to.meta.requiresTempToken) {
    const storedToken = localStorage.getItem("twoFactorToken");
    if (!storedToken) return next("/login");
  }

  next();
});

const handle2FASuccess = () => {
  toast.success("2FA activée avec succès !");
  router.push("/dashboard");
};

export default router;
export { handle2FASuccess };

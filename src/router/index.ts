import LoginView from "@/features/auth/views/LoginView.vue";
import RegisterView from "@/features/auth/views/RegisterView.vue";
import TwoFAView from "@/features/auth/views/TwoFAView.vue";
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    component: () => LoginView,
  },
  {
    path: "/register",
    component: () => RegisterView,
  },
  {
    path: "/2fa",
    component: () => TwoFAView,
  },
  {
    path: "/groups",
    component: () => import("@/features/groups/views/HelloWorld.vue"),
  },
  {
    path: "/ilos",
    component: () => import("@/features/ilos/views/HelloWorld.vue"),
  },
  {
    path: "/roles",
    component: () => import("@/features/roles/views/HelloWorld.vue"),
  },
  {
    path: "/rooms",
    component: () => import("@/features/rooms/views/HelloWorld.vue"),
  },
  {
    path: "/servers",
    component: () => import("@/features/servers/views/ServerListView.vue"),
  },
  {
    path: "/servers/create",
    component: () => import("@/features/servers/views/ServerCreateView.vue"),
  },
  {
    path: "/servers/:id",
    component: () => import("@/features/servers/views/ServerDetailsView.vue"),
  },
  {
    path: "/ups",
    component: () => import("@/features/ups/views/HelloWorld.vue"),
  },
  {
    path: "/users",
    component: () => import("@/features/users/views/HelloWorld.vue"),
  },
  {
    path: "/vms",
    component: () => import("@/features/vms/views/HelloWorld.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

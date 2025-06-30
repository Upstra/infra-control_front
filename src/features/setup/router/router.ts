import type { RouteRecordRaw } from 'vue-router';
import SetupView from '../views/SetupView.vue';
import { SetupStep } from '../types';

export const setupRoutes: RouteRecordRaw[] = [
  {
    path: '/setup',
    component: SetupView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
    },
    children: [
      {
        path: '',
        redirect: `/setup/${SetupStep.WELCOME}`,
      },
      {
        path: SetupStep.WELCOME,
        name: 'setup-welcome',
        component: () => import('../components/steps/WelcomeStep.vue'),
      },
      {
        path: SetupStep.CREATE_ROOM,
        name: 'setup-create-room',
        component: () => import('../components/steps/CreateRoomStep.vue'),
      },
      {
        path: SetupStep.CREATE_UPS,
        name: 'setup-create-ups',
        component: () => import('../components/steps/CreateUpsStep.vue'),
      },
      {
        path: SetupStep.CREATE_SERVER,
        name: 'setup-create-server',
        component: () => import('../components/steps/CreateServerStep.vue'),
      },
      {
        path: SetupStep.VM_DISCOVERY,
        name: 'vm-discovery',
        component: () => import('../components/steps/VmDiscoveryStep.vue'),
      },
      {
        path: SetupStep.COMPLETE,
        name: 'setup-complete',
        component: () => import('../components/steps/CompleteStep.vue'),
        meta: { requiresAuth: true, layout: 'default' },
      },
    ],
  },
];

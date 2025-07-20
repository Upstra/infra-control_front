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
        path: SetupStep.RESOURCE_PLANNING,
        name: 'setup-planning',
        component: () => import('../components/steps/ResourcePlanningStep.vue'),
      },
      {
        path: SetupStep.ROOMS_CONFIG,
        name: 'setup-rooms',
        component: () => import('../components/steps/RoomsConfigStep.vue'),
      },
      {
        path: SetupStep.UPS_CONFIG,
        name: 'setup-ups',
        component: () => import('../components/steps/UpsConfigStep.vue'),
      },
      {
        path: SetupStep.SERVERS_CONFIG,
        name: 'setup-servers',
        component: () => import('../components/steps/ServersConfigStep.vue'),
      },
      {
        path: SetupStep.RELATIONSHIPS,
        name: 'setup-relationships',
        component: () => import('../components/steps/RelationshipsStep.vue'),
      },
      {
        path: SetupStep.REVIEW,
        name: 'setup-review',
        component: () => import('../components/steps/ReviewStep.vue'),
      },
      {
        path: 'vm-discovery',
        name: 'setup-vm-discovery',
        component: () => import('../components/steps/VmwareDiscoveryStep.vue'),
      },
      {
        path: SetupStep.COMPLETE,
        name: 'setup-complete',
        component: () => import('../components/steps/CompleteStep.vue'),
      },
      {
        path: SetupStep.CREATE_ROOM,
        redirect: SetupStep.ROOMS_CONFIG,
      },
      {
        path: SetupStep.CREATE_UPS,
        redirect: SetupStep.UPS_CONFIG,
      },
      {
        path: SetupStep.CREATE_SERVER,
        redirect: SetupStep.SERVERS_CONFIG,
      },
    ],
  },
];

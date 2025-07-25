<template>
  <Modal :open="show" size="xl" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
        {{ $t('permissions.createTitle') }}
      </h3>
    </template>

    <div class="space-y-6">
      <BitmaskExplanation :show-example="true" />

      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ $t('permissions.resourceType') }}
        </label>
        <div class="mt-2">
          <button
            @click="selectedType = 'server'"
            :class="[
              'w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all',
              selectedType === 'server'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/20 dark:text-indigo-300'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
            ]"
          >
            <svg
              class="mx-auto mb-1 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
              />
            </svg>
            {{ $t('permissions.servers') }}
          </button>
        </div>
      </div>

      <div v-if="selectedType">
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{
            $t('permissions.selectResource', {
              type: $t(`permissions.${selectedType}s`),
            })
          }}
        </label>
        <div class="mt-2">
          <div v-if="loading" class="flex items-center justify-center py-8">
            <svg
              class="h-8 w-8 animate-spin text-indigo-600"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </div>
          <div
            v-else-if="availableResources.length === 0"
            class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600"
          >
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ $t('permissions.noAvailableResources') }}
            </p>
          </div>
          <div
            v-else
            class="max-h-60 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <label
              v-for="resource in availableResources"
              :key="resource.id"
              class="flex cursor-pointer items-center border-b border-gray-200 px-4 py-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <input
                type="radio"
                v-model="selectedResourceId"
                :value="resource.id"
                class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span class="ml-3 flex-1">
                <span
                  class="block text-sm font-medium text-gray-900 dark:text-white"
                >
                  {{ resource.name }}
                </span>
                <span
                  v-if="resource.description"
                  class="block text-xs text-gray-500 dark:text-gray-400"
                >
                  {{ resource.description }}
                </span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div v-if="selectedResourceId">
        <div class="flex items-center justify-between">
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ $t('permissions.selectPermissions') }}
          </label>
          <div class="flex space-x-2">
            <button
              @click="selectAllPermissions"
              type="button"
              class="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {{ $t('permissions.selectAll') }}
            </button>
            <span class="text-xs text-gray-400">|</span>
            <button
              @click="deselectAllPermissions"
              type="button"
              class="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              {{ $t('permissions.deselectAll') }}
            </button>
          </div>
        </div>
        <div class="mt-2 space-y-4">
          <div
            v-for="perm in allPermissions"
            :key="perm.bit"
            class="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
          >
            <div class="flex items-center space-x-3">
              <i
                :class="perm.icon"
                class="text-lg text-gray-600 dark:text-gray-400"
              ></i>
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ $t(perm.label) }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ $t(perm.description) }}
                </p>
              </div>
            </div>
            <label class="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                :checked="selectedPermissions.includes(perm.bit)"
                @change="togglePermission(perm.bit)"
                class="peer sr-only"
              />
              <div
                class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-indigo-800"
              ></div>
            </label>
          </div>
        </div>
      </div>

      <div v-if="error" class="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-red-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-red-800 dark:text-red-200">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          type="button"
          class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="createPermission"
          :disabled="!canCreate || isSaving"
          type="button"
          class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <svg
            v-if="isSaving"
            class="-ml-1 mr-2 h-4 w-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          {{ $t('permissions.create') }}
        </button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from '@/composables/useToast';
import { useAuthStore } from '@/features/auth/store';
import { getServersAdmin } from '@/features/servers/api';
import { permissionServerApi } from '../permission-api';
import { PermissionUtils } from '@/shared/utils/permissions';
import Modal from '@/shared/components/Modal.vue';
import BitmaskExplanation from './BitmaskExplanation.vue';
import type { PermissionServerDto } from '../types';

interface Props {
  show: boolean;
  roleId: string;
  existingServerIds: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  created: [permission: PermissionServerDto];
}>();

const { t } = useI18n();
const { showToast } = useToast();
const authStore = useAuthStore();

const selectedType = ref<'server' | 'vm' | null>('server');
const selectedResourceId = ref<string | null>(null);
const selectedPermissions = ref<number[]>([]);
const availableResources = ref<
  { id: string; name: string; description?: string }[]
>([]);
const loading = ref(false);
const isSaving = ref(false);
const error = ref<string | null>(null);

const allPermissions = PermissionUtils.getAll().map((perm) => ({
  bit: perm,
  label: PermissionUtils.getPermissionLabel(perm),
  description: PermissionUtils.getPermissionLabel(perm) + '.description',
  icon: PermissionUtils.getPermissionIcon(perm),
}));

const canCreate = computed(() => {
  return (
    selectedType.value &&
    selectedResourceId.value &&
    selectedPermissions.value.length > 0
  );
});

const calculateBitmask = computed(() => {
  return selectedPermissions.value.reduce((acc, bit) => acc | bit, 0);
});

async function loadResources(type: string | null) {
  if (!type || type !== 'server') return;

  selectedResourceId.value = null;
  selectedPermissions.value = [];
  error.value = null;
  loading.value = true;

  try {
    const servers = await getServersAdmin();
    availableResources.value = servers
      .filter((s: any) => !props.existingServerIds.includes(s.id))
      .map((s: any) => ({
        id: s.id,
        name: s.name,
        description: s.host || s.ip,
      }));
  } catch (err) {
    error.value = t('permissions.loadResourcesError');
  } finally {
    loading.value = false;
  }
}

watch(selectedType, loadResources, { immediate: true });

function selectAllPermissions() {
  selectedPermissions.value = allPermissions.map((perm) => perm.bit);
}

function deselectAllPermissions() {
  selectedPermissions.value = [];
}

function togglePermission(bit: number) {
  const index = selectedPermissions.value.indexOf(bit);
  if (index === -1) {
    selectedPermissions.value.push(bit);
  } else {
    selectedPermissions.value.splice(index, 1);
  }
}

async function createPermission() {
  if (!canCreate.value) return;

  isSaving.value = true;
  error.value = null;

  try {
    const token = authStore.token!;
    const bitmask = calculateBitmask.value;

    const dto: PermissionServerDto = {
      roleId: props.roleId,
      serverId: selectedResourceId.value!,
      bitmask,
    };
    const created = await permissionServerApi.create(dto, token);
    emit('created', created);

    showToast(t('permissions.createSuccess'), { type: 'success' });
    emit('close');
  } catch (err: any) {
    error.value = err?.response?.data?.message || t('permissions.createError');
  } finally {
    isSaving.value = false;
  }
}
</script>

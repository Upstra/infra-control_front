<template>
  <Modal :open="show" size="xl" @close="$emit('close')">
    <template #header>
      <h3 class="text-lg font-semibold leading-6 text-text-strong">
        {{ $t('permissions.createTitle') }}
      </h3>
    </template>

    <div class="space-y-6">
      <BitmaskExplanation :show-example="true" />

      <div>
        <label
          class="block text-sm font-medium text-text"
        >
          {{ $t('permissions.resourceType') }}
        </label>
        <div class="mt-2">
          <button
            @click="selectedType = 'server'"
            :class="[
              'w-full rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all',
              selectedType === 'server'
                ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text'
                : 'border-border-control bg-surface text-text hover:bg-surface-sunken',
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
          class="block text-sm font-medium text-text"
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
              class="h-8 w-8 animate-spin text-primary-text"
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
            class="rounded-lg border-2 border-dashed border-border-control p-8 text-center"
          >
            <p class="text-sm text-text-muted">
              {{ $t('permissions.noAvailableResources') }}
            </p>
          </div>
          <div
            v-else
            class="max-h-60 overflow-y-auto rounded-lg border border-border"
          >
            <label
              v-for="resource in availableResources"
              :key="resource.id"
              class="flex cursor-pointer items-center border-b border-border px-4 py-3 hover:bg-surface-sunken"
            >
              <input
                type="radio"
                v-model="selectedResourceId"
                :value="resource.id"
                class="h-4 w-4 border-border-control text-primary-text focus:ring-primary"
              />
              <span class="ml-3 flex-1">
                <span
                  class="block text-sm font-medium text-text-strong"
                >
                  {{ resource.name }}
                </span>
                <span
                  v-if="resource.description"
                  class="block text-xs text-text-muted"
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
            class="block text-sm font-medium text-text"
          >
            {{ $t('permissions.selectPermissions') }}
          </label>
          <div class="flex space-x-2">
            <button
              @click="selectAllPermissions"
              type="button"
              class="text-xs text-primary-text hover:text-primary-text"
            >
              {{ $t('permissions.selectAll') }}
            </button>
            <span class="text-xs text-text-muted">|</span>
            <button
              @click="deselectAllPermissions"
              type="button"
              class="text-xs text-primary-text hover:text-primary-text"
            >
              {{ $t('permissions.deselectAll') }}
            </button>
          </div>
        </div>
        <div class="mt-2 space-y-4">
          <div
            v-for="perm in allPermissions"
            :key="perm.bit"
            class="flex items-center justify-between rounded-lg border border-border p-3"
          >
            <div class="flex items-center space-x-3">
              <i
                :class="perm.icon"
                class="text-lg text-text"
              ></i>
              <div>
                <p class="text-sm font-medium text-text-strong">
                  {{ $t(perm.label) }}
                </p>
                <p class="text-xs text-text-muted">
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
                class="peer h-6 w-11 rounded-full bg-surface-raised after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800"
              ></div>
            </label>
          </div>
        </div>
      </div>

      <div v-if="error" class="rounded-md bg-danger-surface p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg
              class="h-5 w-5 text-danger-text"
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
            <p class="text-sm text-danger-text">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('close')"
          type="button"
          class="rounded-md border border-border-control bg-surface px-4 py-2 text-sm font-medium text-text shadow-sm hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          {{ $t('common.cancel') }}
        </button>
        <button
          @click="createPermission"
          :disabled="!canCreate || isSaving"
          type="button"
          class="inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

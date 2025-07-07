<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div
        class="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0"
      >
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="$emit('cancel')"
        ></div>

        <span class="hidden sm:inline-block sm:h-screen sm:align-middle"
          >&#8203;</span
        >

        <div
          class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle dark:bg-gray-800"
        >
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 dark:bg-gray-800">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 w-full text-center sm:ml-4 sm:mt-0 sm:text-left">
                <h3
                  class="text-lg font-medium leading-6 text-gray-900 dark:text-white"
                >
                  {{ $t('permissions.editPermissions') }}
                </h3>
                <div class="mt-2">
                  <p class="text-sm text-gray-500 dark:text-gray-400">
                    {{ resourceName }}
                  </p>
                </div>

                <div v-if="props.error" class="mt-4 rounded-md bg-red-50 p-4 dark:bg-red-900/20">
                  <div class="flex">
                    <div class="flex-shrink-0">
                      <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                      </svg>
                    </div>
                    <div class="ml-3">
                      <p class="text-sm text-red-800 dark:text-red-200">{{ props.error }}</p>
                    </div>
                  </div>
                </div>

                <div class="mt-6 space-y-4">
                  <div
                    v-for="perm in allPermissions"
                    :key="perm"
                    class="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                  >
                    <div class="flex items-center space-x-3">
                      <i
                        :class="getPermissionIcon(perm)"
                        class="text-lg text-gray-600 dark:text-gray-400"
                      ></i>
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t(getPermissionLabel(perm)) }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t(`${getPermissionLabel(perm)}.description`) }}
                        </p>
                      </div>
                    </div>
                    <label
                      class="relative inline-flex cursor-pointer items-center"
                    >
                      <input
                        type="checkbox"
                        :checked="hasPermission(perm)"
                        @change="togglePermission(perm)"
                        class="peer sr-only"
                      />
                      <div
                        class="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-indigo-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:border-gray-600 dark:bg-gray-700 dark:peer-focus:ring-indigo-800"
                      ></div>
                    </label>
                  </div>
                </div>

                <div class="mt-6 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ $t('permissions.currentBitmask') }}:
                    {{ localPermission.bitmask }}
                  </p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <span
                      v-for="perm in activePermissions"
                      :key="perm"
                      class="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    >
                      <i :class="getPermissionIcon(perm)" class="text-sm"></i>
                      {{ $t(getPermissionLabel(perm)) }}
                    </span>
                    <span
                      v-if="activePermissions.length === 0"
                      class="text-sm text-gray-500 dark:text-gray-400"
                    >
                      {{ $t('permissions.noActivePermissions') }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6 dark:bg-gray-900"
          >
            <button
              type="button"
              @click="handleSave"
              :disabled="props.isSaving"
              class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:w-auto sm:text-sm"
            >
              <svg v-if="props.isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ props.isSaving ? $t('common.saving') : $t('common.save') }}
            </button>
            <button
              type="button"
              @click="$emit('cancel')"
              :disabled="props.isSaving"
              class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:mt-0 sm:w-auto sm:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {{ $t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PermissionBit, PermissionUtils } from '@/shared/utils/permissions';
import type { PermissionServerDto, PermissionVmDto } from '../types';

interface Props {
  type: 'server' | 'vm';
  permission: PermissionServerDto | PermissionVmDto;
  resourceName: string;
  isSaving?: boolean;
  error?: string | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  save: [permission: PermissionServerDto | PermissionVmDto];
  cancel: [];
}>();

const localPermission = ref({ ...props.permission });
const allPermissions = PermissionUtils.getAll();
const getPermissionLabel = PermissionUtils.getPermissionLabel;
const getPermissionIcon = PermissionUtils.getPermissionIcon;

const activePermissions = computed(() =>
  PermissionUtils.getActivePermissions(localPermission.value.bitmask),
);

function hasPermission(permission: PermissionBit): boolean {
  return PermissionUtils.has(localPermission.value.bitmask, permission);
}

function togglePermission(permission: PermissionBit) {
  localPermission.value.bitmask = PermissionUtils.toggle(
    localPermission.value.bitmask,
    permission,
  );
}

function handleSave() {
  emit('save', localPermission.value);
}
</script>

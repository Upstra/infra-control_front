<template>
  <div
    :class="[
      containerStyle
        ? 'rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:from-indigo-900/20 dark:to-purple-900/20'
        : '',
    ]"
  >
    <div class="flex items-start space-x-3">
      <div v-if="!hideIcon" class="flex-shrink-0">
        <svg
          class="h-6 w-6 text-indigo-600 dark:text-indigo-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <div class="flex-1">
        <h4
          v-if="!hideTitle"
          class="text-sm font-semibold text-gray-900 dark:text-white"
        >
          {{ $t('permissions.howItWorks') }}
        </h4>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {{ $t('permissions.bitmaskExplanation') }}
        </p>
        <div class="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div
            v-for="perm in allPermissions"
            :key="perm.bit"
            class="flex items-center space-x-2"
          >
            <span
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-medium text-indigo-600 dark:bg-gray-800 dark:text-indigo-400"
            >
              {{ perm.bit }}
            </span>
            <span class="text-xs text-gray-600 dark:text-gray-400">
              {{ $t(perm.label) }}
            </span>
          </div>
        </div>
        <div
          v-if="showExample"
          class="mt-4 border-t border-indigo-200 pt-4 dark:border-indigo-800"
        >
          <p class="text-xs font-medium text-gray-700 dark:text-gray-300">
            {{ $t('permissions.example') }}:
          </p>
          <p class="mt-1 text-xs text-gray-600 dark:text-gray-400">
            {{ $t('permissions.exampleDescription') }}
          </p>
          <code class="mt-1 block text-xs text-indigo-600 dark:text-indigo-400">
            READ (1) + WRITE (2) + RESTART (8) = 11
          </code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PermissionUtils } from '@/shared/utils/permissions';

interface Props {
  showExample?: boolean;
  containerStyle?: boolean;
  hideIcon?: boolean;
  hideTitle?: boolean;
}

withDefaults(defineProps<Props>(), {
  showExample: false,
  containerStyle: true,
  hideIcon: false,
  hideTitle: false,
});

const allPermissions = PermissionUtils.getAll().map((perm) => ({
  bit: perm,
  label: PermissionUtils.getPermissionLabel(perm),
}));
</script>

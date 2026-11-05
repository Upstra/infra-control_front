<script setup lang="ts">
import { useToast } from '@/shared/composables/useToast';
import { X, CircleCheck, CircleX, TriangleAlert, Info } from 'lucide-vue-next';

const { toasts, removeToast } = useToast();

const variants = {
  success: { icon: CircleCheck, tone: 'text-success' },
  error: { icon: CircleX, tone: 'text-danger' },
  warning: { icon: TriangleAlert, tone: 'text-warning' },
  info: { icon: Info, tone: 'text-primary-hover' },
} as const;

const variantOf = (type: string) =>
  variants[type as keyof typeof variants] ?? variants.info;
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2" aria-live="polite">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        role="status"
        class="relative flex min-w-[240px] items-start gap-3 rounded-lg border border-border bg-surface p-4 pr-10 shadow-lg"
      >
        <component
          :is="variantOf(toast.type).icon"
          :class="['h-5 w-5 flex-shrink-0', variantOf(toast.type).tone]"
          aria-hidden="true"
        />
        <p class="text-body text-text">{{ toast.message }}</p>
        <button
          type="button"
          :aria-label="$t('pulse.close')"
          @click="removeToast(toast.id)"
          class="absolute right-3 top-3 text-text-muted hover:text-text-strong"
        >
          <X class="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

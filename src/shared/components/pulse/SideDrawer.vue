<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { X } from 'lucide-vue-next';
import { focusableIn, trapTab } from './focusTrap';

const props = withDefaults(
  defineProps<{
    open: boolean;
    title: string;
    subtitle?: string;
    width?: number;
  }>(),
  { subtitle: undefined, width: 440 },
);

const emit = defineEmits<{ close: [] }>();

const { t } = useI18n();
const panel = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    event.stopPropagation();
    emit('close');
  } else if (event.key === 'Tab' && panel.value) {
    trapTab(panel.value, event);
  }
};

watch(
  () => props.open,
  async (open) => {
    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null;
      await nextTick();
      if (!panel.value) return;
      const firstField = focusableIn(panel.value).find(
        (el) => el.dataset.part !== 'close',
      );
      (firstField ?? panel.value).focus();
    } else {
      previouslyFocused?.focus?.();
      previouslyFocused = null;
    }
  },
  { immediate: true },
);
</script>

<template>
  <Teleport to="body">
    <template v-if="open">
      <div
        class="pulse-overlay fixed inset-0 z-40 bg-black/55"
        data-part="overlay"
        @click="emit('close')"
      />
      <aside
        ref="panel"
        role="dialog"
        aria-modal="true"
        :aria-label="title"
        tabindex="-1"
        class="pulse-drawer fixed inset-y-0 right-0 z-50 flex max-w-full flex-col gap-5 overflow-y-auto border-l border-border bg-surface px-6 py-7 shadow-xl"
        :style="{ width: `${width}px` }"
        @keydown="onKeydown"
      >
        <header class="flex items-start gap-3">
          <div class="flex flex-col gap-1">
            <h2 class="m-0 text-title text-text-strong">{{ title }}</h2>
            <span v-if="subtitle" class="text-text-muted">{{ subtitle }}</span>
          </div>
          <button
            type="button"
            class="pulse-press ml-auto grid h-8 w-8 place-items-center rounded-sm text-text-muted hover:bg-surface-raised"
            :aria-label="t('pulse.close')"
            data-part="close"
            @click="emit('close')"
          >
            <X class="h-4 w-4" aria-hidden="true" />
          </button>
        </header>
        <slot />
        <footer
          v-if="$slots.footer"
          class="mt-auto flex justify-end gap-2 border-t border-border pt-5"
        >
          <slot name="footer" />
        </footer>
      </aside>
    </template>
  </Teleport>
</template>

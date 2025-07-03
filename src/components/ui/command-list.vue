<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { ComboboxViewport, type ComboboxViewportProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<
  ComboboxViewportProps & {
    class?: HTMLAttributes['class'];
  }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ComboboxViewport
    v-bind="delegatedProps"
    :class="cn('max-h-[300px] overflow-y-auto overflow-x-hidden', props.class)"
  >
    <div role="presentation">
      <slot />
    </div>
  </ComboboxViewport>
</template>
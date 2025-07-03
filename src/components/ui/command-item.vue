<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import { ComboboxItem, type ComboboxItemProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<
  ComboboxItemProps & {
    class?: HTMLAttributes['class'];
  }
>();

const emits = defineEmits<ComboboxItemProps>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;
  return delegated;
});
</script>

<template>
  <ComboboxItem
    v-bind="delegatedProps"
    @select="emits('select', $event)"
    :class="cn('relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[highlighted]:bg-accent data-[highlighted]:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50', props.class)"
  >
    <slot />
  </ComboboxItem>
</template>
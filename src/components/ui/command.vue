<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import {
  ComboboxRoot,
  type ComboboxRootProps,
} from 'radix-vue';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<
    ComboboxRootProps & {
      class?: HTMLAttributes['class'];
      loop?: boolean;
    }
  >(),
  {
    open: true,
    loop: true,
  },
);

const emits = defineEmits<{
  'update:modelValue': [val: string | number | boolean | Record<string, any>];
  'update:open': [val: boolean];
  'update:searchTerm': [val: string];
}>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <ComboboxRoot
    v-bind="delegatedProps"
    :class="cn('flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground', props.class)"
    @update:modelValue="emits('update:modelValue', $event)"
    @update:open="emits('update:open', $event)"
    @update:searchTerm="emits('update:searchTerm', $event)"
  >
    <slot />
  </ComboboxRoot>
</template>
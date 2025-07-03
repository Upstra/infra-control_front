<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import {
  ComboboxAnchor,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxLabel,
  ComboboxRoot,
  ComboboxSeparator,
  ComboboxViewport,
  type ComboboxRootProps,
} from 'radix-vue';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-vue-next';

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

const emits = defineEmits<ComboboxRootProps>();

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
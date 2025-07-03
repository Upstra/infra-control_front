<script setup lang="ts">
import { type HTMLAttributes } from 'vue';
import { ComboboxEmpty, type ComboboxEmptyProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<
  ComboboxEmptyProps & {
    class?: HTMLAttributes['class'];
  }
>();
</script>

<template>
  <ComboboxEmpty
    :class="cn('py-6 text-center text-sm', props.class)"
  >
    <slot />
  </ComboboxEmpty>
</template>
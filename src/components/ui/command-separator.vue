<script setup lang="ts">
import { type HTMLAttributes } from 'vue';
import { ComboboxSeparator, type ComboboxSeparatorProps } from 'radix-vue';
import { cn } from '@/lib/utils';

const props = defineProps<
  ComboboxSeparatorProps & {
    class?: HTMLAttributes['class'];
  }
>();
</script>

<template>
  <ComboboxSeparator
    :class="cn('-mx-1 h-px bg-border', props.class)"
  />
</template>
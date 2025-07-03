<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue';
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  type DialogRootProps,
} from 'radix-vue';
import { X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

const props = defineProps<DialogRootProps>();
const emits = defineEmits<DialogRootProps>();
</script>

<template>
  <DialogRoot v-bind="props" @update:open="emits('update:open', $event)">
    <slot />
  </DialogRoot>
</template>
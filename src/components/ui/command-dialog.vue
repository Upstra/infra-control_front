<script setup lang="ts">
import { computed } from 'vue';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Command } from '@/components/ui/command';

const props = defineProps<{
  open?: boolean;
}>();

const emits = defineEmits<{
  'update:open': [value: boolean];
}>();

const isOpen = computed({
  get: () => props.open,
  set: (value) => emits('update:open', value),
});
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="overflow-hidden p-0 shadow-lg">
      <Command class="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
        <slot />
      </Command>
    </DialogContent>
  </Dialog>
</template>
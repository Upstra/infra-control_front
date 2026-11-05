<template>
  <transition name="fade">
    <div
      class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center"
    >
      <div
        class="bg-surface rounded-xl shadow-xl w-full max-w-md p-6 relative"
      >
        <button
          class="absolute top-3 right-3 text-text-muted hover:text-text"
          @click="$emit('close')"
        >
          ×
        </button>
        <h3 class="text-lg font-bold mb-3 text-text-strong">
          Renommer la VM
        </h3>
        <form @submit.prevent="save">
          <div>
            <label
              for="vm-name-input"
              class="block text-sm font-medium mb-2 text-text-strong"
              >Nouveau nom</label
            >
            <input
              id="vm-name-input"
              v-model="localName"
              class="w-full border border-border-control bg-surface text-text-strong rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              autofocus
              required
              maxlength="64"
            />
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded bg-surface-raised text-text hover:bg-surface-raised"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!localName.trim()"
              class="px-4 py-2 rounded bg-primary text-white hover:bg-primary-dark font-semibold"
            >
              Enregistrer
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
const props = defineProps<{ vm: any }>();
const emit = defineEmits(['close', 'save']);

const localName = ref(props.vm.name);
watch(
  () => props.vm.name,
  (n) => (localName.value = n),
);

const save = () => {
  if (!localName.value.trim()) return;
  emit('save', { ...props.vm, name: localName.value.trim() });
};
</script>

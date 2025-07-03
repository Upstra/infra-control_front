<template>
  <transition name="fade">
    <div
      class="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center"
    >
      <div class="bg-white dark:bg-neutral-800 rounded-xl shadow-xl w-full max-w-md p-6 relative">
        <button
          class="absolute top-3 right-3 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
          @click="$emit('close')"
        >
          ×
        </button>
        <h3 class="text-lg font-bold mb-3 text-neutral-darker dark:text-white">
          Renommer la VM
        </h3>
        <form @submit.prevent="save">
          <div>
            <label
              for="vm-name-input"
              class="block text-sm font-medium mb-2 text-neutral-dark dark:text-neutral-300"
              >Nouveau nom</label
            >
            <input
              id="vm-name-input"
              v-model="localName"
              class="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
              autofocus
              required
              maxlength="64"
            />
          </div>
          <div class="flex gap-3 justify-end mt-6">
            <button
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-600"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!localName.trim()"
              class="px-4 py-2 rounded bg-primary dark:bg-primary text-white hover:bg-primary-dark dark:hover:bg-primary-dark font-semibold"
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

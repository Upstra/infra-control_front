<template>
  <div class="w-full max-w-xl">
    <div class="mb-6 text-center">
      <h2
        class="text-2xl font-bold text-neutral-darker dark:text-white tracking-tight"
      >
        {{ t('rooms.create_title') }}
      </h2>
      <p class="mt-2 text-base text-neutral-dark dark:text-neutral-400">
        {{ t('rooms.create_description') }}
      </p>
    </div>

    <form
      @submit.prevent="handleSubmit"
      class="bg-white dark:bg-neutral-800 rounded-2xl shadow-md border border-neutral-100 dark:border-neutral-700 p-8 flex flex-col gap-6"
      autocomplete="off"
    >
      <div>
        <label
          for="name"
          class="block font-medium text-neutral-darker dark:text-white flex items-center gap-2 mb-1"
        >
          <Building2 :size="18" class="text-primary dark:text-blue-400" />
          {{ t('rooms.name') }}
        </label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          class="block w-full border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
          :placeholder="t('rooms.name_placeholder')"
          required
          maxlength="64"
          autocomplete="off"
        />
        <span class="text-xs text-neutral dark:text-neutral-400 mt-1 block">
          {{ t('rooms.name_hint') }}
        </span>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="px-6 py-2 text-neutral-700 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="inline-flex items-center justify-center gap-2 bg-primary dark:bg-blue-700 text-white font-semibold rounded-lg px-6 py-2 shadow-md hover:bg-primary-dark dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition disabled:opacity-60"
        >
          <Building2 v-if="!isSubmitting" :size="18" />
          <div
            v-else
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"
          ></div>
          {{ isSubmitting ? t('rooms.submitting') : t('rooms.submit') }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { Building2 } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';

interface Props {
  isSubmitting?: boolean;
}

interface Emits {
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const toast = useToast();
const { t } = useI18n();

const form = reactive({
  name: '',
});

const handleSubmit = async () => {
  if (!form.name?.trim()) return toast.error(t('rooms.name_required'));

  const creationDto = {
    name: form.name.trim(),
  };

  emit('submit', creationDto);
};
</script>

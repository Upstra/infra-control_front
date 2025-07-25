<template>
  <transition name="modal-fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 px-4"
      @click.self="$emit('close')"
    >
      <div
        ref="modalRef"
        class="relative w-full max-w-4xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-neutral-800 dark:to-neutral-900 rounded-3xl shadow-2xl"
        @click.stop
      >
        <div
          class="sticky top-0 z-10 bg-white/95 dark:bg-neutral-800/95 backdrop-blur-sm border-b border-neutral-200 dark:border-neutral-700 px-6 py-4 rounded-t-3xl"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                <BatteryCharging
                  :size="24"
                  class="text-primary dark:text-blue-400"
                />
              </div>
              <div>
                <h2
                  class="text-xl font-bold text-neutral-darker dark:text-white"
                >
                  {{ t('ups.create_title') }}
                </h2>
                <p class="text-sm text-neutral-dark dark:text-neutral-400">
                  {{ t('ups.create_modal_subtitle') }}
                </p>
              </div>
            </div>
            <button
              @click="$emit('close')"
              class="p-2 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-all"
            >
              <X :size="20" />
            </button>
          </div>
        </div>

        <div class="p-6 flex justify-center">
          <CreateUps
            :is-submitting="isSubmitting"
            @submit="handleSubmit"
            @cancel="$emit('close')"
          />
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { BatteryCharging, X } from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { onClickOutside } from '@vueuse/core';
import CreateUps from './CreateUps.vue';
import { upsApi } from '../api';

interface Props {
  isOpen: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'created', ups: any): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const { t } = useI18n();
const toast = useToast();
const modalRef = ref<HTMLElement | null>(null);
const isSubmitting = ref(false);

onClickOutside(modalRef, () => emit('close'));

const handleSubmit = async (data: any) => {
  try {
    isSubmitting.value = true;
    const createdUps = await upsApi.create(data);

    toast.success(t('toast.ups_created'));
    emit('created', createdUps);
    emit('close');
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error.message || t('ups.creation_error');
    toast.error(errorMessage);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .relative,
.modal-fade-leave-active .relative {
  transition: transform 0.3s ease;
}

.modal-fade-enter-from .relative,
.modal-fade-leave-to .relative {
  transform: scale(0.95) translateY(-20px);
}
</style>

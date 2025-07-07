<template>
  <TransitionRoot :show="isOpen" as="template">
    <Dialog as="div" class="relative z-50" @close="close">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30 dark:bg-black/50" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 shadow-xl transition-all"
            >
              <div class="p-6">
                <div class="flex items-center gap-4">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
                  >
                    <ExclamationTriangleIcon
                      class="h-6 w-6 text-red-600 dark:text-red-400"
                    />
                  </div>
                  <div class="flex-1">
                    <DialogTitle
                      as="h3"
                      class="text-lg font-semibold text-gray-900 dark:text-white"
                    >
                      {{ t('users.delete.title') }}
                    </DialogTitle>
                    <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {{
                        t('users.delete.confirm', {
                          username: user?.username || '',
                        })
                      }}
                    </p>
                  </div>
                </div>

                <div
                  class="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg"
                >
                  <div class="flex gap-2">
                    <InformationCircleIcon
                      class="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
                    />
                    <div class="text-sm text-amber-700 dark:text-amber-300">
                      <p class="font-medium">
                        {{ t('users.delete.warning_title') }}
                      </p>
                      <p class="mt-1">
                        {{ t('users.delete.warning_message') }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-4">
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {{ t('users.delete.reason_optional') }}
                  </label>
                  <textarea
                    v-model="deleteReason"
                    rows="3"
                    class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400"
                    :placeholder="t('users.delete.reason_placeholder')"
                  />
                </div>

                <div class="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    @click="close"
                    class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                  >
                    {{ t('profile.cancel') }}
                  </button>
                  <button
                    type="button"
                    @click="
                      () => {
                        handleConfirm();
                      }
                    "
                    :disabled="props.isDeleting"
                    class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <ArrowPathIcon
                      v-if="props.isDeleting"
                      class="w-4 h-4 animate-spin"
                    />
                    {{ t('users.delete.confirm_button') }}
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';
import {
  ExclamationTriangleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
} from '@heroicons/vue/24/outline';
import type { User } from '../types';

interface Props {
  isOpen: boolean;
  user: User | null;
  isDeleting?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isDeleting: false,
});

const emit = defineEmits<{
  close: [];
  confirm: [data: { userId: string; reason?: string; details?: string }];
}>();

const { t } = useI18n();
const deleteReason = ref('');

const close = () => {
  deleteReason.value = '';
  emit('close');
};

const handleConfirm = () => {
  if (props.user) {
    emit('confirm', {
      userId: props.user.id,
      reason: 'admin_action',
      details: deleteReason.value || undefined,
    });
  }
};
</script>

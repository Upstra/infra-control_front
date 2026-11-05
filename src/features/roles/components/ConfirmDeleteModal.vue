<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-surface bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="close"
      ></div>

      <div
        class="inline-block align-bottom bg-surface rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div class="sm:flex sm:items-start">
          <div
            class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-danger-surface sm:mx-0 sm:h-10 sm:w-10"
          >
            <ExclamationTriangleIcon
              class="h-6 w-6 text-danger-text"
            />
          </div>
          <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
            <h3
              class="text-lg leading-6 font-medium text-text-strong"
              id="modal-title"
            >
              {{ t('roles.delete_role_title') }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-text-muted">
                {{ t('roles.delete_role_confirm', { role: role?.name }) }}
              </p>

              <div
                v-if="role && role.userCount > 0"
                class="mt-4 p-4 bg-warning-surface rounded-lg"
              >
                <div class="flex">
                  <div class="flex-shrink-0">
                    <ExclamationTriangleIcon
                      class="h-5 w-5 text-warning-text"
                    />
                  </div>
                  <div class="ml-3">
                    <h3
                      class="text-sm font-medium text-warning-text"
                    >
                      {{ t('roles.impact_warning') }}
                    </h3>
                    <div
                      class="mt-2 text-sm text-warning-text"
                    >
                      <p>
                        {{
                          t('roles.delete_role_warning', {
                            count: role.userCount,
                            userLabel:
                              role.userCount === 1
                                ? t('roles.user')
                                : t('roles.users'),
                          })
                        }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="role && role.users.length > 0" class="mt-4">
                <h4
                  class="text-sm font-medium text-text-strong mb-2"
                >
                  {{ t('roles.affected_users') }}
                </h4>
                <div
                  class="max-h-32 overflow-y-auto border border-border rounded-md bg-surface"
                >
                  <div class="divide-y divide-border">
                    <div
                      v-for="user in role.users"
                      :key="user.id"
                      class="px-3 py-2 text-sm"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-text-strong"
                          >{{ user.firstName }} {{ user.lastName }}</span
                        >
                        <span class="text-text-muted">{{
                          user.email
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <label
                  for="confirmDelete"
                  class="block text-sm font-medium text-text"
                >
                  {{ t('roles.type_to_confirm', { role: role?.name }) }}
                </label>
                <div class="mt-1">
                  <input
                    id="confirmDelete"
                    v-model="confirmText"
                    type="text"
                    class="shadow-sm focus:ring-danger focus:border-danger block w-full sm:text-sm border-border-control bg-surface text-text-strong rounded-md"
                    :placeholder="t('roles.type_here', { role: role?.name })"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <ErrorAlert v-if="props.error" :message="props.error" />

        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            @click="handleConfirm"
            :disabled="!canDelete"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-danger-solid text-base font-medium text-white hover:bg-danger-solid focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ t('roles.delete_role_title') }}
          </button>
          <button
            type="button"
            @click="close"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-border-control shadow-sm px-4 py-2 bg-surface text-base font-medium text-text hover:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm"
          >
            {{ t('roles.cancel') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RoleWithUsers } from '../types';
import { ExclamationTriangleIcon } from '@heroicons/vue/24/outline';
import ErrorAlert from '@/shared/components/ErrorAlert.vue';

interface Props {
  isOpen: boolean;
  role?: RoleWithUsers | null;
  error?: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'confirm'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const confirmText = ref('');

const { t } = useI18n();

const canDelete = computed(() => {
  if (!props.role) return false;
  return confirmText.value === props.role.name;
});

const handleConfirm = async () => {
  if (!canDelete.value) return;

  emit('confirm');
};

const close = () => {
  confirmText.value = '';
  emit('close');
};
</script>

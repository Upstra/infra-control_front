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
        class="fixed inset-0 bg-gray-500 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="close"
      ></div>

      <div
        class="inline-block align-bottom bg-white dark:bg-neutral-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div>
          <div
            class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30"
          >
            <ShieldCheckIcon class="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3
              class="text-lg leading-6 font-medium text-gray-900 dark:text-white"
              id="modal-title"
            >
              {{ isEdit ? t('roles.edit_role') : t('roles.create_role') }}
            </h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{
                  isEdit
                    ? t('roles.update_role_details')
                    : t('roles.new_role_details')
                }}
              </p>
            </div>
          </div>
        </div>

        <ErrorAlert v-if="props.error" :message="props.error" />

        <form @submit.prevent="handleSubmit" class="mt-6">
          <div class="space-y-4">
            <div>
              <label
                for="roleName"
                class="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {{ t('roles.role_name') }}
              </label>
              <div class="mt-1">
                <input
                  id="roleName"
                  v-model="form.name"
                  type="text"
                  required
                  class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 bg-white dark:bg-neutral-700 text-gray-900 dark:text-white rounded-md"
                  :placeholder="t('roles.role_name_placeholder')"
                />
              </div>
              <p
                v-if="errors.name"
                class="mt-1 text-sm text-red-600 dark:text-red-400"
              >
                {{ errors.name }}
              </p>
            </div>

            <div class="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
              <h4
                class="text-sm font-medium text-gray-900 dark:text-white mb-3"
              >
                {{ t('roles.permissions') }}
              </h4>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input
                    id="canCreateServer"
                    v-model="form.canCreateServer"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    :disabled="form.isAdmin"
                  />
                  <label
                    for="canCreateServer"
                    class="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    {{ t('roles.can_create_servers') }}
                    <span class="text-gray-500 dark:text-gray-400">{{
                      t('roles.server_creation')
                    }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 sm:mt-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 dark:bg-blue-700 text-base font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div
                v-if="loading"
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white border-2 border-white border-t-transparent rounded-full"
              ></div>
              {{ isEdit ? t('roles.update_role') : t('roles.create_role') }}
            </button>
            <button
              type="button"
              @click="close"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-neutral-700 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
            >
              {{ t('roles.cancel') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { RoleWithUsers, AdminRoleCreationDto } from '../types';
import { ShieldCheckIcon } from '@heroicons/vue/24/outline';
import ErrorAlert from '@/shared/components/ErrorAlert.vue';

interface Props {
  isOpen: boolean;
  role?: RoleWithUsers | null;
  error?: string;
}

interface Emits {
  (e: 'close'): void;
  (e: 'save', data: AdminRoleCreationDto): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const loading = ref(false);

const { t } = useI18n();

const form = reactive({
  name: '',
  isAdmin: false,
  canCreateServer: false,
});

const errors = reactive({
  name: '',
});

const isEdit = computed(() => !!props.role);

const resetForm = () => {
  form.name = '';
  form.isAdmin = false;
  form.canCreateServer = false;
  errors.name = '';
};

const validateForm = () => {
  errors.name = '';

  if (!form.name.trim()) {
    errors.name = t('roles.role_name_required');
    return false;
  }

  if (form.name.trim().length < 2) {
    errors.name = t('roles.role_name_min');
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  if (!validateForm()) return;

  loading.value = true;
  try {
    const roleData: AdminRoleCreationDto = {
      name: form.name.trim(),
      isAdmin: form.isAdmin,
      canCreateServer: form.canCreateServer,
    };

    emit('save', roleData);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.role,
  (newRole) => {
    if (newRole) {
      form.name = newRole.name;
      form.isAdmin = newRole.isAdmin;
      form.canCreateServer = newRole.canCreateServer;
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

watch(
  () => form.isAdmin,
  (isAdmin) => {
    if (isAdmin) {
      form.canCreateServer = true;
    }
  },
);

const close = () => {
  resetForm();
  emit('close');
};
</script>

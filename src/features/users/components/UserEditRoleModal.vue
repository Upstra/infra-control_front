<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import type { User, UserUpdateDto } from '../types';
import type { Role } from '@/features/roles/types';
import { updateUser } from '../api';
import { updateUserRoles } from '@/features/roles/api';
import { useAuthStore } from '@/features/auth/store';

interface Props {
  user: User | null;
  isOpen: boolean;
  roles: Role[];
  initialTab?: 'info' | 'roles';
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  userUpdated: [user: User];
}>();

const { t } = useI18n();
const authStore = useAuthStore();

const form = ref<UserUpdateDto>({
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  roleIds: [],
});

const roleIds = ref<string[]>([]);

const loading = ref(false);
const error = ref('');
const activeTab = ref<'info' | 'roles'>('info');

const isFormValid = computed(() => {
  if (activeTab.value === 'info') {
    return (
      form.value.firstName?.trim() &&
      form.value.lastName?.trim() &&
      form.value.email?.trim()
    );
  } else {
    return roleIds.value.length > 0;
  }
});

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen && props.initialTab) {
      activeTab.value = props.initialTab;
    }
  },
);

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.value = {
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        roleIds: newUser.roles.map((role) => role.id),
      };
      roleIds.value = newUser.roles.map((role) => role.id);
    }
  },
  { immediate: true },
);

const handleClose = () => {
  activeTab.value = 'info';
  error.value = '';
  emit('close');
};

const handleSubmit = async () => {
  if (!props.user || !isFormValid.value) return;

  loading.value = true;
  error.value = '';

  try {
    if (activeTab.value === 'info') {
      const { roleIds: _, username: __, ...updatePayload } = form.value;
      const updatedUser = await updateUser(
        props.user.id,
        updatePayload,
        authStore.token!,
      );
      emit('userUpdated', updatedUser);
    } else {
      await updateUserRoles(props.user.id, roleIds.value);
      emit('userUpdated', {
        ...props.user,
        roles: props.roles.filter((r) => roleIds.value.includes(r.id)),
      });
    }
    handleClose();
  } catch (err: any) {
    console.error('Failed to update user:', err);
    error.value =
      err.message || err.toString() || err.error || t('common.error_occurred');
  } finally {
    loading.value = false;
  }
};

const toggleRole = (roleId: string) => {
  const index = roleIds.value.indexOf(roleId);
  if (index > -1) {
    roleIds.value.splice(index, 1);
  } else {
    roleIds.value.push(roleId);
  }
};

const isRoleSelected = (roleId: string) => {
  return roleIds.value.includes(roleId);
};
</script>

<template>
  <transition name="modal">
    <div
      v-if="isOpen && user"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      @click.self="handleClose"
    >
      <div
        class="bg-surface rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all"
      >
        <div
          class="flex items-center justify-between p-6 border-b border-border"
        >
          <div>
            <h2 class="text-xl font-semibold text-text-strong">
              {{ t('users.edit_user_and_roles') }}
            </h2>
            <p class="text-sm text-text mt-1">
              {{ t('users.edit_user_and_roles_description') }}
            </p>
          </div>
          <button
            @click="handleClose"
            class="text-text-muted hover:text-text transition-colors"
          >
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <div class="flex border-b border-border">
          <button
            @click="activeTab = 'info'"
            :class="[
              'flex-1 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'info'
                ? 'text-primary-text border-b-2 border-primary'
                : 'text-text hover:text-text-strong',
            ]"
          >
            {{ t('users.user_info') }}
          </button>
          <button
            @click="activeTab = 'roles'"
            :class="[
              'flex-1 px-6 py-3 text-sm font-medium transition-colors',
              activeTab === 'roles'
                ? 'text-primary-text border-b-2 border-primary'
                : 'text-text hover:text-text-strong',
            ]"
          >
            {{ t('users.user_roles_tab') }}
          </button>
        </div>

        <form @submit.prevent="handleSubmit" class="p-6">
          <div
            v-if="error"
            class="mb-6 bg-danger-surface border border-danger-border rounded-lg p-4"
          >
            <p class="text-danger-text text-sm">{{ error }}</p>
          </div>

          <div v-if="activeTab === 'info'" class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  class="block text-sm font-medium text-text mb-2"
                >
                  {{ t('users.username') }} *
                </label>
                <input
                  v-model="form.username"
                  type="text"
                  disabled
                  class="w-full px-4 py-3 border border-border-control rounded-lg bg-surface-raised text-text cursor-not-allowed"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-text mb-2"
                >
                  {{ t('users.email') }} *
                </label>
                <input
                  v-model="form.email"
                  type="email"
                  required
                  class="w-full px-4 py-3 border border-border-control rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-strong"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-text mb-2"
                >
                  {{ t('users.first_name') }} *
                </label>
                <input
                  v-model="form.firstName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-border-control rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-strong"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-text mb-2"
                >
                  {{ t('users.last_name') }} *
                </label>
                <input
                  v-model="form.lastName"
                  type="text"
                  required
                  class="w-full px-4 py-3 border border-border-control rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-surface text-text-strong"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeTab === 'roles'" class="space-y-4">
            <p class="text-sm text-text mb-4">
              {{ t('users.select_roles_description') }}
            </p>
            <div class="space-y-3 max-h-64 overflow-y-auto">
              <label
                v-for="role in roles"
                :key="role.id"
                class="flex items-center p-4 rounded-lg border cursor-pointer transition-all"
                :class="
                  isRoleSelected(role.id)
                    ? 'border-primary bg-[rgb(var(--c-primary-hover)/0.1)]'
                    : 'border-border-control hover:bg-surface-sunken'
                "
              >
                <input
                  type="checkbox"
                  :checked="isRoleSelected(role.id)"
                  @change="toggleRole(role.id)"
                  class="h-4 w-4 text-primary-text border-border-control rounded focus:ring-primary"
                />
                <div class="ml-3 flex-1">
                  <p
                    class="text-sm font-medium"
                    :class="
                      isRoleSelected(role.id)
                        ? 'text-primary-text'
                        : 'text-text-strong'
                    "
                  >
                    {{ role.name }}
                    <span
                      v-if="role.isAdmin"
                      class="text-xs text-primary-text ml-2"
                      >({{ t('users.admin') }})</span
                    >
                  </p>
                  <p
                    class="text-xs mt-1"
                    :class="
                      isRoleSelected(role.id)
                        ? 'text-primary-text'
                        : 'text-text-muted'
                    "
                  >
                    {{
                      role.canCreateServer
                        ? t('users.can_create_servers')
                        : t('users.cannot_create_servers')
                    }}
                  </p>
                </div>
              </label>
            </div>
            <div
              v-if="!roleIds.length"
              class="text-sm text-danger-text"
            >
              {{ t('users.select_at_least_one_role') }}
            </div>
          </div>

          <div
            class="flex justify-end space-x-3 pt-6 border-t border-border mt-6"
          >
            <button
              type="button"
              @click="handleClose"
              class="px-6 py-3 border border-border-control rounded-lg text-text hover:bg-surface-sunken transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
            <button
              type="submit"
              :disabled="!isFormValid || loading"
              class="px-6 py-3 bg-primary hover:bg-primary disabled:bg-border-strong text-white rounded-lg transition-colors disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                v-if="loading"
                class="animate-spin h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {{ loading ? t('common.saving') : t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

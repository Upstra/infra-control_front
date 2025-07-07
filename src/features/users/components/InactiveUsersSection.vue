<script setup lang="ts">
import { ref, computed } from 'vue';
import type { User } from '../types';
import type { Role } from '@/features/roles/types';
import {
  CheckIcon,
  UserPlusIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/vue/24/outline';
import UserAvatar from '@/features/users/components/UserAvatar.vue';
import UserRolesDisplay from '@/shared/components/UserRolesDisplay.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  users: User[];
  roles: Role[];
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'activateUser', user: User): void;
  (e: 'activateSelected', users: User[]): void;
  (e: 'editUser', user: User): void;
}>();

const { t } = useI18n();

const selectedUsers = ref<Set<string>>(new Set());
const isExpanded = ref(true);

const allSelected = computed(
  () =>
    props.users.length > 0 && selectedUsers.value.size === props.users.length,
);

const someSelected = computed(
  () =>
    selectedUsers.value.size > 0 &&
    selectedUsers.value.size < props.users.length,
);

const selectedUsersList = computed(() =>
  props.users.filter((user) => selectedUsers.value.has(user.id)),
);

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedUsers.value.clear();
  } else {
    props.users.forEach((user) => selectedUsers.value.add(user.id));
  }
};

const toggleSelectUser = (userId: string) => {
  if (selectedUsers.value.has(userId)) {
    selectedUsers.value.delete(userId);
  } else {
    selectedUsers.value.add(userId);
  }
};

const activateSelected = () => {
  emit('activateSelected', selectedUsersList.value);
  selectedUsers.value.clear();
};
</script>

<template>
  <div
    class="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-6 border border-orange-200 dark:border-orange-800"
  >
    <button
      @click="isExpanded = !isExpanded"
      class="flex items-center justify-between w-full mb-4"
    >
      <div class="flex items-center gap-3">
        <ExclamationTriangleIcon
          class="w-6 h-6 text-orange-600 dark:text-orange-400"
        />
        <h3 class="text-lg font-semibold text-neutral-darker dark:text-white">
          {{ t('users.inactive_users') }}
        </h3>
        <span
          class="px-2 py-1 text-sm font-medium bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 rounded-full"
        >
          {{ users.length }}
        </span>
      </div>
      <ChevronDownIcon v-if="isExpanded" class="w-5 h-5 text-neutral-500" />
      <ChevronRightIcon v-else class="w-5 h-5 text-neutral-500" />
    </button>

    <transition name="expand">
      <div v-if="isExpanded">
        <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
          {{ t('users.inactive_users_description') }}
        </p>

        <div v-if="users.length > 0" class="space-y-4">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  :checked="allSelected"
                  :indeterminate="someSelected"
                  @change="toggleSelectAll"
                  class="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                />
                <span
                  class="text-sm font-medium text-neutral-700 dark:text-neutral-300"
                >
                  {{ t('users.select_all') }}
                </span>
              </label>
              <span
                v-if="selectedUsers.size > 0"
                class="text-sm text-neutral-500"
              >
                ({{ selectedUsers.size }} {{ t('users.selected') }})
              </span>
            </div>

            <button
              v-if="selectedUsers.size > 0"
              @click="activateSelected"
              class="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <UserPlusIcon class="w-4 h-4" />
              {{ t('users.activate_selected') }}
            </button>
          </div>

          <div
            class="bg-white dark:bg-neutral-800 rounded-lg overflow-hidden ring-1 ring-orange-200 dark:ring-orange-800"
          >
            <table class="w-full text-sm">
              <thead class="bg-orange-100 dark:bg-orange-900/20">
                <tr>
                  <th class="p-3 text-left w-10"></th>
                  <th class="p-3 text-left">{{ t('users.headers.user') }}</th>
                  <th class="p-3 text-left">{{ t('users.headers.email') }}</th>
                  <th class="p-3 text-left">{{ t('users.headers.role') }}</th>
                  <th class="p-3 text-center">
                    {{ t('users.headers.actions') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="border-t border-orange-200 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition"
                >
                  <td class="p-3">
                    <input
                      type="checkbox"
                      :checked="selectedUsers.has(user.id)"
                      @change="toggleSelectUser(user.id)"
                      class="w-4 h-4 text-primary border-neutral-300 rounded focus:ring-primary"
                    />
                  </td>
                  <td class="p-3">
                    <div class="flex items-center gap-3">
                      <UserAvatar :user="user" size="sm" :pulse="false" />
                      <div>
                        <p
                          class="font-medium text-neutral-darker dark:text-white"
                        >
                          {{ user.firstName }} {{ user.lastName }}
                        </p>
                        <p
                          class="text-xs text-neutral-500 dark:text-neutral-400"
                        >
                          @{{ user.username }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="p-3 text-neutral-600 dark:text-neutral-400">
                    {{ user.email }}
                  </td>
                  <td class="p-3">
                    <UserRolesDisplay :user="user" :max-visible-roles="1" />
                  </td>
                  <td class="p-3 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        @click="emit('activateUser', user)"
                        class="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/30 transition"
                      >
                        <CheckIcon class="w-3 h-3" />
                        {{ t('users.activate') }}
                      </button>
                      <button
                        @click="emit('editUser', user)"
                        class="text-xs text-neutral-600 dark:text-neutral-400 hover:text-primary dark:hover:text-blue-400 transition"
                      >
                        {{ t('users.edit_user') }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-else
          class="text-center py-8 text-neutral-500 dark:text-neutral-400"
        >
          <UserPlusIcon class="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{{ t('users.no_inactive_users') }}</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  max-height: 2000px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>

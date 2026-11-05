<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import { useUsers } from '@/features/users/composables/useUsers';
import { usePresenceStore } from '@/features/presence/store';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import router from '@/router';
import UserEditModal from '@/features/users/components/UserEditModal.vue';
import ResetPasswordModal from '../components/ResetPasswordModal.vue';
import DeleteAccountModal from '../components/DeleteAccountModal.vue';
import ProfileTab from '../components/ProfileTab.vue';
import ProfileStat from '../components/ProfileStat.vue';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
import {
  User,
  Shield,
  Mail,
  Calendar,
  Clock,
  UserCheck,
  AlertTriangle,
  Trash2,
  Key,
  Smartphone,
  RefreshCw,
} from 'lucide-vue-next';

const toast = useToast();
const auth = useAuthStore();
const presenceStore = usePresenceStore();
const { updateCurrentUser } = useUsers();
const { t } = useI18n();

const loading = ref(true);
const activeTab = ref('overview');
const isEditModalOpen = ref(false);
const isResetPasswordModalOpen = ref(false);
const isDeleteModalOpen = ref(false);

const user = computed(() => auth.currentUser);

const profileTabs = [
  {
    id: 'overview',
    label: t('profile.tabs.overview'),
    icon: User,
  },
  {
    id: 'security',
    label: t('profile.tabs.security'),
    icon: Shield,
  },
];

const stats = computed(() => {
  if (!user.value) return [];

  const createdDate = new Date(user.value.createdAt);
  const daysSinceCreation = Math.floor(
    (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return [
    {
      label: t('profile.stats.member_since'),
      value: daysSinceCreation + ' ' + t('profile.stats.days'),
    },
    {
      label: t('profile.stats.security_score'),
      value: user.value.isTwoFactorEnabled ? '95%' : '60%',
    },
  ];
});

onMounted(async () => {
  try {
    if (!user.value) {
      await auth.fetchCurrentUser();
    }
    if (user.value?.id) {
      await presenceStore.fetchPresence(user.value.id);
    }
  } finally {
    loading.value = false;
  }
});

const handleSubmit = async (updatedUser: any) => {
  try {
    await updateCurrentUser(updatedUser);
    isEditModalOpen.value = false;
    toast.success(t('toast.profile_updated'));
  } catch (error: any) {
    toast.error(
      error?.response?.data?.message ?? t('toast.profile_update_error'),
    );
  }
};

const handleToggle2FA = async () => {
  if (!user.value) return;
  if (user.value.isTwoFactorEnabled) {
    if (await auth.disable2FAUser()) {
      toast.success(t('toast.twofa_disabled'));
    }
  } else {
    router.push({ name: 'Enable2FA' });
  }
};

const handlePasswordReset = () => {
  isResetPasswordModalOpen.value = false;
  toast.success(t('toast.password_reset'));
};

const handleDeleteAccount = () => {
  isDeleteModalOpen.value = false;
  auth.resetAuthState();
  router.push({ name: 'Login' });
};
</script>

<template>
  <div class="min-h-screen bg-surface-sunken">
    <div
      v-if="loading"
      class="flex items-center justify-center h-64 text-text-muted"
    >
      <RefreshCw class="h-6 w-6 animate-spin mr-2" />
      {{ t('profile.loading_profile') }}
    </div>

    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        class="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden"
      >
        <div
          class="bg-gradient-to-r from-primary/10 to-primary/5 px-6 sm:px-8 py-8"
        >
          <div
            class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6"
          >
            <div class="relative">
              <img
                :src="`https://ui-avatars.com/api/?name=${user?.username}&size=128&background=6366f1&color=fff`"
                :alt="user?.username"
                class="h-24 w-24 rounded-2xl shadow-lg ring-4 ring-white"
              />
              <span
                v-if="user"
                class="absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-border"
                :class="{
                  'bg-success': presenceStore.statuses[user.id],
                  'bg-border-strong': !presenceStore.statuses[user.id],
                }"
              />
            </div>
            <div class="flex-1 text-center sm:text-left">
              <h1 class="text-2xl font-bold text-text-strong">
                {{ user?.firstName }} {{ user?.lastName }}
              </h1>
              <p
                class="text-text flex items-center justify-center sm:justify-start mt-1"
              >
                <Mail class="h-4 w-4 mr-2" />
                {{ user?.email }}
              </p>
              <div
                class="flex items-center justify-center sm:justify-start space-x-4 mt-3"
              >
                <span
                  v-if="user"
                  class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-success-surface text-success-text':
                      presenceStore.statuses[user.id],
                    'bg-surface-raised text-text-strong':
                      !presenceStore.statuses[user.id],
                  }"
                >
                  <span
                    class="h-2 w-2 rounded-full mr-1.5"
                    :class="{
                      'bg-success animate-pulse':
                        presenceStore.statuses[user.id],
                      'bg-surface': !presenceStore.statuses[user.id],
                    }"
                  ></span>
                  {{
                    presenceStore.statuses[user.id]
                      ? t('servers.online')
                      : t('servers.offline')
                  }}
                </span>
                <button
                  @click="isEditModalOpen = true"
                  class="text-primary hover:text-primary-dark font-medium text-sm transition-colors"
                >
                  {{ t('common.edit') }}
                </button>
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
              <ProfileStat
                v-for="stat in stats"
                :key="stat.label"
                :label="stat.label"
                :value="stat.value"
              />
            </div>
          </div>
        </div>

        <div class="border-b border-border">
          <nav class="flex space-x-1 px-6 sm:px-8" aria-label="Tabs">
            <ProfileTab
              v-for="tab in profileTabs"
              :key="tab.id"
              :label="tab.label"
              :icon="tab.icon"
              :is-active="activeTab === tab.id"
              @click="activeTab = tab.id"
            />
          </nav>
        </div>

        <div class="p-6 sm:p-8">
          <transition name="fade-slide" mode="out-in">
            <div
              v-if="activeTab === 'overview'"
              key="overview"
              class="space-y-6"
            >
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div class="bg-surface-sunken rounded-xl p-6">
                  <h3
                    class="text-lg font-semibold text-text-strong mb-4 flex items-center"
                  >
                    <User class="h-5 w-5 mr-2 text-primary" />
                    {{ t('profile.personal_info') }}
                  </h3>
                  <dl class="space-y-3">
                    <div>
                      <dt
                        class="text-sm font-medium text-text-muted"
                      >
                        {{ t('profile.username') }}
                      </dt>
                      <dd class="mt-1 text-sm text-text-strong">
                        @{{ user?.username }}
                      </dd>
                    </div>
                    <div>
                      <dt
                        class="text-sm font-medium text-text-muted"
                      >
                        {{ t('profile.email') }}
                      </dt>
                      <dd class="mt-1 text-sm text-text-strong">
                        {{ user?.email }}
                      </dd>
                    </div>
                    <div>
                      <dt
                        class="text-sm font-medium text-text-muted"
                      >
                        {{ t('profile.member_since') }}
                      </dt>
                      <dd
                        class="mt-1 text-sm text-text-strong flex items-center"
                      >
                        <Calendar class="h-4 w-4 mr-1 text-text-muted" />
                        {{
                          user?.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : ''
                        }}
                      </dd>
                    </div>
                    <div>
                      <dt
                        class="text-sm font-medium text-text-muted"
                      >
                        {{ t('profile.last_updated') }}
                      </dt>
                      <dd
                        class="mt-1 text-sm text-text-strong flex items-center"
                      >
                        <Clock class="h-4 w-4 mr-1 text-text-muted" />
                        {{
                          user?.updatedAt
                            ? new Date(user.updatedAt).toLocaleDateString()
                            : ''
                        }}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div class="bg-surface-sunken rounded-xl p-6">
                  <h3
                    class="text-lg font-semibold text-text-strong mb-4 flex items-center"
                  >
                    <UserCheck class="h-5 w-5 mr-2 text-primary" />
                    {{ t('profile.roles_permissions') }}
                  </h3>
                  <div class="space-y-3">
                    <div v-if="user?.roles && user.roles.length > 0">
                      <div class="flex flex-wrap gap-2">
                        <span
                          v-for="role in user.roles"
                          :key="role.id"
                          class="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-primary/10 text-primary"
                        >
                          {{ role.name }}
                        </span>
                      </div>
                    </div>
                    <div
                      v-else
                      class="text-sm text-text-muted"
                    >
                      {{ t('profile.no_roles') }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeTab === 'security'"
              key="security"
              class="space-y-6"
            >
              <div class="bg-surface-sunken rounded-xl p-6">
                <h3
                  class="text-lg font-semibold text-text-strong mb-6 flex items-center"
                >
                  <Shield class="h-5 w-5 mr-2 text-primary" />
                  {{ t('profile.security_settings') }}
                </h3>

                <div class="space-y-4">
                  <div
                    class="flex items-center justify-between p-4 bg-surface rounded-lg"
                  >
                    <div class="flex items-center">
                      <Smartphone class="h-5 w-5 text-text-muted mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-text-strong"
                        >
                          {{ t('profile.two_factor_auth') }}
                        </p>
                        <p class="text-xs text-text-muted">
                          {{
                            user?.isTwoFactorEnabled
                              ? t('profile.2fa_enabled_desc')
                              : t('profile.2fa_disabled_desc')
                          }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      :model-value="user?.isTwoFactorEnabled || false"
                      @update:model-value="handleToggle2FA"
                    />
                  </div>

                  <div
                    class="flex items-center justify-between p-4 bg-surface rounded-lg"
                  >
                    <div class="flex items-center">
                      <Key class="h-5 w-5 text-text-muted mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-text-strong"
                        >
                          {{ t('profile.password') }}
                        </p>
                        <p class="text-xs text-text-muted">
                          {{ t('profile.password_desc') }}
                        </p>
                      </div>
                    </div>
                    <button
                      @click="isResetPasswordModalOpen = true"
                      class="px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                    >
                      {{ t('profile.change_password') }}
                    </button>
                  </div>
                </div>
              </div>

              <div
                class="bg-danger-surface rounded-xl p-6 border border-danger-border"
              >
                <h3
                  class="text-lg font-semibold text-danger-text mb-4 flex items-center"
                >
                  <AlertTriangle class="h-5 w-5 mr-2" />
                  {{ t('profile.danger_zone') }}
                </h3>
                <p class="text-sm text-danger-text mb-4">
                  {{ t('profile.danger_zone_desc') }}
                </p>
                <div class="flex flex-col sm:flex-row gap-3">
                  <button
                    @click="isDeleteModalOpen = true"
                    class="inline-flex items-center justify-center px-4 py-2 bg-danger-solid text-white rounded-lg text-sm font-medium hover:bg-danger-solid transition-colors"
                  >
                    <Trash2 class="h-4 w-4 mr-2" />
                    {{ t('profile.delete_account') }}
                  </button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>

    <UserEditModal
      :isOpen="isEditModalOpen"
      :user="user"
      @close="isEditModalOpen = false"
      @submit="handleSubmit"
    />

    <ResetPasswordModal
      :open="isResetPasswordModalOpen"
      @close="isResetPasswordModalOpen = false"
      @success="handlePasswordReset"
    />

    <DeleteAccountModal
      :open="isDeleteModalOpen"
      :username="user?.username"
      @close="isDeleteModalOpen = false"
      @success="handleDeleteAccount"
    />
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>

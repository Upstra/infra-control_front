<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import ProfileHeader from '../components/ProfileHeader.vue';
import ProfileInfoCard from '../components/ProfileInfoCard.vue';
import ProfileSecurityCard from '../components/ProfileSecurityCard.vue';
import ProfileDangerZone from '../components/ProfileDangerZone.vue';
import UserEditModal from '@/features/users/components/UserEditModal.vue';
import { useAuthStore } from '@/features/auth/store';
import { useUsers } from '@/features/users/composables/useUsers';
import router from '@/router';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

const toast = useToast();
const auth = useAuthStore();
const { updateCurrentUser } = useUsers();
const { t } = useI18n();

const loading = ref(true);
onMounted(async () => {
  try {
    await auth.fetchCurrentUser();
  } finally {
    loading.value = false;
  }
});

const isEditModalOpen = ref(false);
const user = computed(() => auth.currentUser);

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
    if (await auth.disable2FAUser()) user.value.isTwoFactorEnabled = false;
  } else {
    router.push({ name: 'Enable2FA' });
  }
};
</script>

<template>
  <div v-if="loading" class="text-center text-neutral-500 dark:text-neutral-400">
    {{ t('profile.loading_profile') }}
  </div>
  <div v-else class="max-w-5xl mx-auto p-6 space-y-6">
    <ProfileHeader :user="user" @edit="isEditModalOpen = true" />
    <div class="grid gap-6 lg:grid-cols-2">
      <ProfileInfoCard :user="user" />
      <ProfileSecurityCard
        :user="user"
        @toggle2fa="handleToggle2FA"
        @reset-success="toast.success(t('toast.password_reset'))"
      />
    </div>
    <ProfileDangerZone :user="user" />
  </div>
  <UserEditModal
    :isOpen="isEditModalOpen"
    :user="user"
    :roles="[]"
    @close="isEditModalOpen = false"
    @submit="handleSubmit"
  />
</template>

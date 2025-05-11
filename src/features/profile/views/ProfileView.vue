<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ProfileHeader from '../components/ProfileHeader.vue'
import ProfileInfoCard from '../components/ProfileInfoCard.vue'
import ProfileSecurityCard from '../components/ProfileSecurityCard.vue'
import ProfileDangerZone from '../components/ProfileDangerZone.vue'
import UserEditModal from '@/features/users/components/UserEditModal.vue'
import { useAuthStore } from '@/features/auth/store'

const auth = useAuthStore()
const loading = ref(true)

onMounted(async () => {
  try {
    console.log('Chargement du profil')
    await auth.fetchCurrentUser()
  } catch (e) {
    console.error('Erreur de chargement', e)
  } finally {
    loading.value = false
  }
})

const isEditModalOpen = ref(false)
const user = computed(() => auth.currentUser)
    
const openEdit = () => (isEditModalOpen.value = true)
const closeEdit = () => (isEditModalOpen.value = false)
const handleSave = (u: any) => {
  //updateProfile(u)
  console.log('User updated:', u)
  isEditModalOpen.value = false
}
</script>

<template>
  <div v-if="loading" class="text-center text-neutral-500">Chargement du profil...</div>
  <div v-else class="max-w-5xl mx-auto p-6 space-y-6">
    <ProfileHeader :user="user" @edit="openEdit" />

    <div class="grid gap-6 lg:grid-cols-2">
      <ProfileInfoCard :user="user" class="lg:col-span-1" />
      <ProfileSecurityCard :user="user" class="lg:col-span-1" />
    </div>

    <ProfileDangerZone :user="user" class="pt-4" />
  </div>

  <UserEditModal
    :isOpen="isEditModalOpen"
    :user="user"
    :roles="[]"
    @close="closeEdit"
    @submit="handleSave"
  />
</template>

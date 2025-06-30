<script setup lang="ts">
import { ref } from 'vue';
import { createServer } from '../api';
import type { CreateServerPayload } from '../types';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const form = ref<CreateServerPayload>({
  name: '',
  state: 'active',
  grace_period_on: 10,
  grace_period_off: 10,
  adminUrl: '',
  ip: '',
  login: '',
  password: '',
  type: 'physical',
  priority: 1,
  roomId: '',
  groupId: '',
  upsId: '',
  ilo: {
    name: '',
    ip: '',
    login: '',
    password: '',
  },
});

const isSubmitting = ref(false);
const successMessage = ref('');
const errorMessage = ref('');

const handleSubmit = async () => {
  isSubmitting.value = true;
  successMessage.value = '';
  errorMessage.value = '';

  try {
    await createServer(form.value);
    successMessage.value = t('servers.created_success');
    setTimeout(() => router.push('/servers'), 1000);
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.message || t('servers.creation_error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">
      {{ t('servers.create_title') }}
    </h1>

    <form @submit.prevent="handleSubmit" class="grid gap-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.name') }}
            <input v-model="form.name" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.state') }}
            <select v-model="form.state" class="input">
              <option value="active">{{ t('servers.active') }}</option>
              <option value="inactive">{{ t('servers.inactive') }}</option>
            </select>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.ip') }}
            <input v-model="form.ip" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.admin_url') }}
            <input v-model="form.adminUrl" type="url" class="input" />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.login') }}
            <input v-model="form.login" type="text" class="input" />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.password') }}
            <input v-model="form.password" type="password" class="input" />
          </label>
        </div>

        <div>
          {{ t('servers.type') }}
          <label class="block text-sm font-medium">
            <select v-model="form.type" class="input">
              <option value="physical">{{ t('servers.physical') }}</option>
              <option value="virtual">{{ t('servers.virtual') }}</option>
            </select>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.priority') }}
            <input
              v-model.number="form.priority"
              type="number"
              min="1"
              class="input"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.shutdown_delay') }} (s)
            <input
              v-model.number="form.grace_period_off"
              type="number"
              min="0"
              class="input"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.startup_delay') }} (s)
            <input
              v-model.number="form.grace_period_on"
              type="number"
              min="0"
              class="input"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.room') }}
            <input v-model="form.roomId" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            {{ t('servers.group') }}
            <input v-model="form.groupId" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium"
            >{{ t('servers.ups') }}
            <input v-model="form.upsId" type="text" class="input" />
          </label>
        </div>
      </div>

      <fieldset class="border-t pt-4">
        <legend class="text-lg font-medium text-neutral-dark">
          {{ t('servers.ilo_section') }}
        </legend>

        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label class="block text-sm font-medium"
              >{{ t('servers.ilo_name') }}
              <input v-model="form.ilo.name" type="text" class="input" />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium"
              >{{ t('servers.ilo_ip') }}
              <input v-model="form.ilo.ip" type="text" class="input" />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium"
              >{{ t('servers.ilo_login') }}
              <input v-model="form.ilo.login" type="text" class="input" />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium"
              >{{ t('servers.ilo_password') }}
              <input
                v-model="form.ilo.password"
                type="password"
                class="input"
              />
            </label>
          </div>
        </div>
      </fieldset>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="bg-primary text-white font-medium px-6 py-2 rounded-lg hover:bg-primary-dark transition"
      >
        {{ isSubmitting ? t('servers.creating') : t('servers.create_button') }}
      </button>

      <p v-if="successMessage" class="text-success font-medium mt-2">
        ✅ {{ successMessage }}
      </p>
      <p v-if="errorMessage" class="text-danger font-medium mt-2">
        ❌ {{ errorMessage }}
      </p>
    </form>
  </div>
</template>

<style scoped>
.input {
  @apply w-full border rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-primary;
}
</style>

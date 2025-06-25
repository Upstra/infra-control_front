<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'

const name = ref("");
const location = ref("");
const router = useRouter();
const { t } = useI18n();

const submitRoom = () => {
  router.push("/rooms");
};
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">
      {{ t('rooms.create_title') }}
    </h1>

    <form @submit.prevent="submitRoom" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >
        <input
          v-model="name"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          :placeholder="t('rooms.name_placeholder')"
          required
        />
        {{ t('rooms.name_label') }}
      </label>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >
          <input
          v-model="location"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          :placeholder="t('rooms.location_placeholder')"
        />
        {{ t('rooms.location_label') }}
        </label>
      </div>

      <button
        type="submit"
        class="w-full py-3 mt-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition"
      >
        {{ t('rooms.create_button') }}
      </button>
    </form>
  </div>
</template>

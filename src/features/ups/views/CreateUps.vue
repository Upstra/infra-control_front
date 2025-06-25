<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from 'vue-i18n'

const name = ref("");
const ip = ref("");
const roomId = ref("");
const gracePeriodOn = ref(0);
const gracePeriodOff = ref(0);

const router = useRouter();
const { t } = useI18n();

const submitUps = () => {
  router.push("/ups");
};
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">
      {{ t('ups.create_title') }}
    </h1>

    <form @submit.prevent="submitUps" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >Nom
          <input
          v-model="name"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          :placeholder="t('setup_ups.name_placeholder')"
          required
        />
          </label>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >{{ t('ups.ip') }}
          <input
          v-model="ip"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          :placeholder="t('setup_ups.ip_placeholder')"
          required
        />
          </label>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >{{ t('ups.room_id') }}
          <input
          v-model="roomId"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          :placeholder="t('ups.room_id_placeholder')"
          required
        />
          </label>

      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-neutral-dark"
            >{{ t('ups.start_delay_label') }}
            <input
            v-model.number="gracePeriodOn"
            type="number"
            min="0"
            class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium mb-1 text-neutral-dark"
            >{{ t('ups.stop_delay_label') }}
            <input
            v-model.number="gracePeriodOff"
            type="number"
            min="0"
            class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          />
          </label >
        </div>
      </div>

      <button
        type="submit"
        class="w-full py-3 mt-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition"
      >
        {{ t('ups.create_button') }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const ip = ref("");
const roomId = ref("");
const gracePeriodOn = ref(0);
const gracePeriodOff = ref(0);

const router = useRouter();

const submitUps = () => {
  router.push("/ups");
};
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">
      Créer un nouvel Onduleur (UPS)
    </h1>

    <form @submit.prevent="submitUps" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >Nom
          <input
          v-model="name"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          placeholder="Ex: UPS Principal"
          required
        />
          </label>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >IP
          <input
          v-model="ip"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          placeholder="Ex: 192.168.1.10"
          required
        />
          </label>
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >ID de la Salle
          <input
          v-model="roomId"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          placeholder="Ex: room-1"
          required
        />
          </label>

      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium mb-1 text-neutral-dark"
            >Délai démarrage (s)
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
            >Délai arrêt (s)
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
        Créer l'Onduleur
      </button>
    </form>
  </div>
</template>

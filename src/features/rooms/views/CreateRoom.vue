<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const location = ref("");
const router = useRouter();

const submitRoom = () => {
  console.log("Room créée :", { name: name.value, location: location.value });
  router.push("/rooms");
};
</script>

<template>
  <div class="p-6 max-w-xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">
      Créer une nouvelle Salle
    </h1>

    <form @submit.prevent="submitRoom" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >Nom</label
        >
        <input
          v-model="name"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          placeholder="Ex: Salle Serveurs 1"
          required
        />
      </div>

      <div>
        <label class="block text-sm font-medium mb-1 text-neutral-dark"
          >Localisation</label
        >
        <input
          v-model="location"
          type="text"
          class="w-full px-4 py-2 border rounded-xl bg-white shadow-sm focus:ring-primary focus:outline-none"
          placeholder="Ex: Bâtiment A"
        />
      </div>

      <button
        type="submit"
        class="w-full py-3 mt-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition"
      >
        Créer la Salle
      </button>
    </form>
  </div>
</template>

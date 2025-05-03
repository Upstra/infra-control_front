<script setup lang="ts">
import { ref } from "vue";
import { createServer } from "../api";
import type { CreateServerPayload } from "../types";
import { useRouter } from "vue-router";

const router = useRouter();

const form = ref<CreateServerPayload>({
  name: "",
  state: "active",
  grace_period_on: 10,
  grace_period_off: 10,
  adminUrl: "",
  ip: "",
  login: "",
  password: "",
  type: "physical",
  priority: 1,
  roomId: "",
  groupId: "",
  upsId: "",
  ilo: {
    name: "",
    ip: "",
    login: "",
    password: "",
  },
});

const isSubmitting = ref(false);
const successMessage = ref("");
const errorMessage = ref("");

const handleSubmit = async () => {
  isSubmitting.value = true;
  successMessage.value = "";
  errorMessage.value = "";

  try {
    await createServer(form.value);
    successMessage.value = "Serveur créé avec succès 🎉";
    setTimeout(() => router.push("/servers"), 1000);
  } catch (err: any) {
    errorMessage.value =
      err?.response?.data?.message || "Erreur lors de la création";
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="p-6 max-w-3xl mx-auto space-y-6">
    <h1 class="text-2xl font-bold text-neutral-darker">Ajouter un serveur</h1>

    <form @submit.prevent="handleSubmit" class="grid gap-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium">
            Nom
            <input v-model="form.name" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            État
            <select v-model="form.state" class="input">
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
            </select>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            Adresse IP
            <input v-model="form.ip" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            URL d'admin
            <input v-model="form.adminUrl" type="url" class="input" />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            Login
            <input v-model="form.login" type="text" class="input" />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            Mot de passe
            <input v-model="form.password" type="password" class="input" />
          </label>
        </div>

        <div>
          Type
          <label class="block text-sm font-medium">
            <select v-model="form.type" class="input">
              <option value="physical">Physique</option>
              <option value="virtual">Virtuel</option>
            </select>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            Priorité
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
            Délai d’arrêt (s)
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
            Délai de démarrage (s)
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
            Salle
            <input v-model="form.roomId" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium">
            Groupe
            <input v-model="form.groupId" type="text" class="input" required />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium"
            >Onduleur
            <input v-model="form.upsId" type="text" class="input" />
          </label>
        </div>
      </div>

      <fieldset class="border-t pt-4">
        <legend class="text-lg font-medium text-neutral-dark">
          Informations iLO
        </legend>

        <div class="grid grid-cols-2 gap-4 mt-2">
          <div>
            <label class="block text-sm font-medium"
              >Nom iLO
              <input v-model="form.ilo.name" type="text" class="input" />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium"
              >IP iLO
              <input v-model="form.ilo.ip" type="text" class="input" />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium"
              >Login iLO
              <input v-model="form.ilo.login" type="text" class="input" />
            </label>
          </div>
          <div>
            <label class="block text-sm font-medium"
              >Mot de passe iLO
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
        {{ isSubmitting ? "Création en cours..." : "Créer le serveur" }}
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

<script setup lang="ts">
import RegisterForm from '../components/RegisterForm.vue'
</script>

<template>
  <div class="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-neutral-200">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-darker">Créer un compte</h1>
        <p class="text-sm text-neutral-dark mt-1">Rejoins l’aventure Upstra dès maintenant</p>
      </div>

      <RegisterForm />

      <p class="mt-6 text-sm text-center text-neutral-dark">
        Déjà un compte ?
        <router-link to="/login" class="text-primary hover:underline font-medium">
          Connectez-vous
        </router-link>
      </p>
    </div>
  </div>
</template>

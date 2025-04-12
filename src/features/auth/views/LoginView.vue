<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue'
</script>

<template>
  <div class="min-h-screen bg-neutral-light flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-neutral-200">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-neutral-darker">Bienvenue sur Upstra</h1>
        <p class="text-sm text-neutral-dark mt-1">Connecte-toi pour accéder à ton espace de gestion</p>
      </div>

      <LoginForm />

      <p class="mt-6 text-sm text-center text-neutral-dark">
        Vous n’avez pas de compte ?
        <router-link to="/register" class="text-primary hover:underline font-medium">
          Inscrivez-vous
        </router-link>
      </p>
    </div>
  </div>
</template>

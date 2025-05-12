<script setup lang="ts">
import { useRouter } from "vue-router";
import {
  ExclamationTriangleIcon,
  HomeIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
} from "@heroicons/vue/24/outline";

const router = useRouter();

const goHome = () => router.push({ path: "/" });
const goBack = () => router.back();
</script>

<template>
  <div
    class="min-h-screen flex flex-col items-center justify-center bg-neutral-50 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-primary/5 via-indigo-50 to-transparent px-6">
    <div class="relative">
      <span
        class="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse-slow"></span>
      <ExclamationTriangleIcon
        class="relative w-20 h-20 text-primary drop-shadow-md" />
    </div>

    <h1 class="mt-6 text-5xl font-extrabold text-neutral-800 tracking-tight">
      404
    </h1>

    <p class="mt-2 text-neutral-500 text-center max-w-md">
      Oups ! La page que vous cherchez semble introuvable.<br />
      Elle est peut-être déplacée ou n’existe plus.
    </p>

    <div class="mt-6 flex flex-col sm:flex-row gap-3">
      <button
        @click="goHome"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark focus-visible:ring-2 focus-visible:ring-primary transition">
        <HomeIcon class="w-5 h-5" /> Retour à l’accueil
      </button>

      <a
        href="mailto:support@exemple.com"
        class="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 focus-visible:ring-2 focus-visible:ring-primary transition">
        <EnvelopeIcon class="w-5 h-5" /> Contacter le support
      </a>
    </div>

    <button
      @click="goBack"
      class="mt-4 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-primary transition">
      <ArrowLeftIcon class="w-4 h-4" /> Retour à la page précédente
    </button>
  </div>
</template>

<style scoped>
@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}
.animate-pulse-slow {
  animation: pulse-slow 3s ease-in-out infinite;
}
</style>

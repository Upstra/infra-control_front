<template>
    <div role="alert"
        class="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-2xl mb-8 flex gap-4 items-start transition-opacity duration-200">
        <Rocket :size="24" />
        <div>
            <h3 class="text-lg font-semibold mb-2">Première installation détectée !</h3>
            <p class="opacity-90 mb-4">
                Aucun administrateur n'existe. Le premier utilisateur inscrit deviendra automatiquement administrateur.
            </p>
            <router-link to="/register"
                class="inline-flex items-center gap-1 font-medium hover:underline focus:outline-none focus:ring-1 focus:ring-white">
                Créer le compte administrateur →
            </router-link>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Rocket } from 'lucide-vue-next';
</script>

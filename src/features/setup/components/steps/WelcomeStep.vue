<template>
    <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10">
        <div class="mb-8 text-center">
            <h1 class="text-3xl md:text-4xl font-bold text-neutral-darker tracking-tight">
                Bienvenue dans Upstra&nbsp;! <span class="inline-block animate-bounce">🚀</span>
            </h1>
            <p class="mt-2 text-base md:text-lg text-neutral-dark max-w-lg mx-auto">
                Félicitations, vous êtes le <span class="font-semibold text-primary">premier administrateur</span> de
                cette installation.
                On va configurer votre infrastructure étape par étape&nbsp;!
            </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mb-10">
            <div
                class="flex flex-col items-center bg-white rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100">
                <div class="bg-primary/10 rounded-full p-3 mb-4">
                    <Building2 :size="32" class="text-primary" />
                </div>
                <h3 class="text-base font-semibold text-neutral-darker mb-1">Salles serveurs</h3>
                <p class="text-sm text-neutral text-center">Définissez vos espaces physiques et leur capacité</p>
            </div>
            <div
                class="flex flex-col items-center bg-white rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100">
                <div class="bg-primary/10 rounded-full p-3 mb-4">
                    <BatteryCharging :size="32" class="text-primary" />
                </div>
                <h3 class="text-base font-semibold text-neutral-darker mb-1">Onduleurs (UPS)</h3>
                <p class="text-sm text-neutral text-center">Gérez la protection électrique de vos équipements</p>
            </div>
            <div
                class="flex flex-col items-center bg-white rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100">
                <div class="bg-primary/10 rounded-full p-3 mb-4">
                    <Server :size="32" class="text-primary" />
                </div>
                <h3 class="text-base font-semibold text-neutral-darker mb-1">Serveurs</h3>
                <p class="text-sm text-neutral text-center">Supervisez vos serveurs physiques et virtuels</p>
            </div>
            <div
                class="flex flex-col items-center bg-white rounded-xl shadow-md p-6 transition hover:scale-[1.03] hover:shadow-lg border border-neutral-100">
                <div class="bg-primary/10 rounded-full p-3 mb-4">
                    <Users :size="32" class="text-primary" />
                </div>
                <h3 class="text-base font-semibold text-neutral-darker mb-1">Équipe</h3>
                <p class="text-sm text-neutral text-center">Invitez d'autres administrateurs plus tard</p>
            </div>
        </div>

        <div
            class="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mb-8 w-full max-w-lg">
            <Info :size="20" class="text-primary-dark" />
            <p class="text-sm text-neutral-dark">
                Cette configuration prend environ <strong class="font-semibold text-primary-dark">5 minutes</strong>.
                <span class="hidden sm:inline">Vous pourrez modifier tous ces paramètres plus tard.</span>
            </p>
        </div>

        <button type="button" @click="goToNext"
            class="inline-flex items-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95"
            aria-label="Passer à l'étape suivante : créer une salle serveur">
            <Building2 :size="20" />
            Commencer la configuration
        </button>
    </div>
</template>

<script setup lang="ts">
import {
    Building2,
    BatteryCharging,
    Server,
    Users,
    Info
} from 'lucide-vue-next';

import { useSetupStore } from '@/features/setup/store';

const setupStore = useSetupStore();


async function goToNext() {
    await setupStore.completeCurrentStep();
}
</script>

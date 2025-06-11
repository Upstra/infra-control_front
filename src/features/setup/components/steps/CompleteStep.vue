<template>
    <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10">
        <div class="mb-6">
            <CheckCircle :size="64" class="text-success animate-[scaleIn_0.5s_ease-out] drop-shadow-lg" />
        </div>

        <h1 class="text-3xl md:text-4xl font-bold text-neutral-darker mb-2 tracking-tight">
            Configuration terminée&nbsp;! <span class="inline-block animate-bounce">🎉</span>
        </h1>
        <p class="mb-10 text-base md:text-lg text-neutral-dark max-w-xl text-center">
            Votre infrastructure est maintenant prête.<br class="hidden sm:block" />
            Vous pouvez commencer à utiliser <span class="text-primary font-semibold">Upstra</span>.
        </p>

        <div v-if="isLoading" class="w-full max-w-2xl mb-10">
            <div class="bg-white rounded-2xl shadow border border-neutral-100 p-6">
                <div class="animate-pulse">
                    <div class="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div class="space-y-3">
                        <div class="h-8 bg-gray-100 rounded"></div>
                        <div class="h-8 bg-gray-100 rounded"></div>
                        <div class="h-8 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else
            class="w-full max-w-2xl mb-10 bg-white rounded-2xl shadow border border-neutral-100 p-6 flex flex-col gap-4">
            <h3 class="text-lg font-semibold text-neutral-darker mb-2">Récapitulatif de votre configuration</h3>
            <div class="divide-y divide-neutral-100">
                <div class="flex items-center gap-3 py-3">
                    <Building2 :size="22" class="text-primary" />
                    <div class="flex-1">
                        <span class="font-medium text-neutral-dark">Salle créée&nbsp;:</span>
                        <span class="ml-2 text-neutral">{{ configSummary.roomName }}</span>
                        <span v-if="configSummary.roomLocation" class="ml-2 text-sm text-neutral/70">
                            ({{ configSummary.roomLocation }})
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-3 py-3">
                    <BatteryCharging :size="22" class="text-primary" />
                    <div class="flex-1">
                        <span class="font-medium text-neutral-dark">Onduleur ajouté&nbsp;:</span>
                        <span class="ml-2 text-neutral">{{ configSummary.upsName }}</span>
                        <span v-if="configSummary.upsCapacity" class="ml-2 text-sm text-neutral/70">
                            ({{ configSummary.upsCapacity }} kVA)
                        </span>
                    </div>
                </div>
                <div class="flex items-center gap-3 py-3">
                    <Server :size="22" class="text-primary" />
                    <div class="flex-1">
                        <span class="font-medium text-neutral-dark">Serveur configuré&nbsp;:</span>
                        <span class="ml-2 text-neutral">{{ configSummary.serverName }}</span>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm text-neutral/70">
                                IP: {{ configSummary.serverIp }}
                            </span>
                            <span class="text-sm text-neutral/70">•</span>
                            <span class="text-sm text-neutral/70">
                                Type: {{ configSummary.serverType === 'physical' ? 'Physique' : 'Virtuel' }}
                            </span>
                            <span class="text-sm text-neutral/70">•</span>
                            <span :class="[
                                'text-sm font-medium',
                                configSummary.serverState === 'active' ? 'text-success' : 'text-neutral'
                            ]">
                                {{ configSummary.serverState === 'active' ? 'Actif' : 'Inactif' }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="fetchError" class="mt-2 text-sm text-yellow-600 bg-yellow-50 p-3 rounded-lg">
                <AlertTriangle :size="16" class="inline mr-1" />
                Certaines informations n'ont pas pu être récupérées depuis le serveur.
            </div>
        </div>

        <div class="w-full max-w-3xl mb-10">
            <h3 class="text-lg font-semibold text-neutral-darker mb-4">Prochaines étapes</h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div
                    class="flex flex-col items-center bg-primary/5 rounded-xl p-5 text-center shadow-sm border border-neutral-100 hover:shadow-lg transition">
                    <Users :size="28" class="text-primary mb-2" />
                    <h4 class="text-base font-semibold text-neutral-dark mb-1">Inviter votre équipe</h4>
                    <p class="text-sm text-neutral">Ajoutez d'autres administrateurs pour gérer l'infrastructure</p>
                </div>
                <div
                    class="flex flex-col items-center bg-primary/5 rounded-xl p-5 text-center shadow-sm border border-neutral-100 hover:shadow-lg transition">
                    <Plus :size="28" class="text-primary mb-2" />
                    <h4 class="text-base font-semibold text-neutral-dark mb-1">Ajouter plus d'équipements</h4>
                    <p class="text-sm text-neutral">Créez d'autres salles, onduleurs et serveurs</p>
                </div>
                <div
                    class="flex flex-col items-center bg-primary/5 rounded-xl p-5 text-center shadow-sm border border-neutral-100 hover:shadow-lg transition">
                    <Activity :size="28" class="text-primary mb-2" />
                    <h4 class="text-base font-semibold text-neutral-dark mb-1">Surveiller vos ressources</h4>
                    <p class="text-sm text-neutral">Suivez l'état de vos serveurs en temps réel</p>
                </div>
            </div>
        </div>

        <button type="button"
            class="inline-flex items-center gap-2 bg-success hover:bg-success/90 text-white font-semibold rounded-2xl px-8 py-3 shadow-lg transition focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2 active:scale-95 text-lg"
            @click="goToDashboard" aria-label="Aller au tableau de bord">
            <LayoutDashboard :size="24" />
            Aller au tableau de bord
        </button>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import {
    CheckCircle,
    Building2,
    BatteryCharging,
    Server,
    Users,
    Plus,
    Activity,
    LayoutDashboard,
    AlertTriangle
} from 'lucide-vue-next';
import { SetupStep } from '../../types';
import { useSetupStore } from '../../store';
import { fetchServers } from '@/features/servers/api';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import type { Server as ServerType } from '@/features/servers/types';

const router = useRouter();
const setupStore = useSetupStore();

const isLoading = ref(true);
const fetchError = ref(false);
const configSummary = reactive({
    roomName: 'Chargement...',
    roomLocation: '',
    upsName: 'Chargement...',
    upsCapacity: null as number | null,
    serverName: 'Chargement...',
    serverIp: '',
    serverType: 'physical' as 'physical' | 'virtual',
    serverState: 'inactive' as 'active' | 'inactive',
});

const roomData = setupStore.getStepData(SetupStep.CREATE_ROOM) || {};
const upsData = setupStore.getStepData(SetupStep.CREATE_UPS) || {};
const serverData = setupStore.getStepData(SetupStep.CREATE_SERVER) || {};

const fetchConfigurationDetails = async () => {
    try {
        isLoading.value = true;
        fetchError.value = false;

        configSummary.roomName = roomData.name || 'Salle principale';
        configSummary.roomLocation = roomData.location || '';
        configSummary.upsName = upsData.name || 'UPS principal';
        configSummary.upsCapacity = upsData.capacity || null;
        configSummary.serverName = serverData.name || 'Serveur principal';
        configSummary.serverIp = serverData.ip || '';
        configSummary.serverType = serverData.type || 'physical';
        configSummary.serverState = serverData.state || 'inactive';

        const servers = await fetchServers();

        console.log('Détails de la configuration récupérés:', {
            roomData,
            upsData,
            serverData,
            servers
        });

        if (servers.data && servers.data.length > 0) {
            let createdServer: ServerType | undefined;

            if (serverData.name) {
                createdServer = servers.data.find((s: ServerType) => s.name === serverData.name);
            }

            if (!createdServer) {
                createdServer = servers.data.sort((a: ServerType, b: ServerType) => {
                    const dateA = new Date(a.createdAt || 0).getTime();
                    const dateB = new Date(b.createdAt || 0).getTime();
                    return dateB - dateA;
                })[0];
            }

            if (createdServer) {
                configSummary.serverName = createdServer.name;
                configSummary.serverIp = createdServer.ip;
                configSummary.serverType = createdServer.type;
                configSummary.serverState = createdServer.state;

                if (createdServer.roomId) {
                    try {
                        const room = await roomApi.fetchRoomById(createdServer.roomId);
                        if (room) {
                            configSummary.roomName = room.name;
                            configSummary.roomLocation = '';
                        }
                    } catch (error) {
                        console.error('Erreur lors de la récupération de la salle:', error);
                    }
                }

                if (createdServer.upsId) {
                    try {
                        const ups = await upsApi.getById(createdServer.upsId);
                        if (ups) {
                            configSummary.upsName = ups.name;
                            configSummary.upsCapacity = null;
                        }
                    } catch (error) {
                        console.error('Erreur lors de la récupération de l\'UPS:', error);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des détails:', error);
        fetchError.value = true;
    } finally {
        isLoading.value = false;
    }
};

onMounted(() => {
    fetchConfigurationDetails();
});

const goToDashboard = () => {
    localStorage.setItem('setup_completed', 'true');
    localStorage.removeItem('setup_skipped');
    setupStore.resetSetup();
    router.push('/dashboard');
};
</script>

<style>
@keyframes scaleIn {
    from {
        transform: scale(0);
        opacity: 0;
    }

    to {
        transform: scale(1);
        opacity: 1;
    }
}

.animate-\[scaleIn_0\.5s_ease-out\] {
    animation: scaleIn 0.5s ease-out;
}
</style>
<template>
    <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10">
        <div class="mb-8 text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-neutral-darker tracking-tight">
                Ajoute ton serveur
            </h2>
            <p class="mt-2 text-base md:text-lg text-neutral-dark max-w-lg mx-auto">
                Configure un serveur pour commencer à superviser ton infra.
            </p>
        </div>

        <form @submit.prevent="handleSubmit"
            class="w-full max-w-2xl bg-white rounded-2xl shadow-md border border-neutral-100 p-8 flex flex-col gap-8"
            autocomplete="off">

            <div>
                <h3 class="text-lg font-semibold text-neutral-darker mb-4 border-b border-neutral-200 pb-2">
                    Localisation et alimentation
                </h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="roomId" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Building2 :size="18" class="text-primary" />
                            Salle
                        </label>
                        <select id="roomId" v-model="form.roomId"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            :class="{ 'bg-gray-100': !canSelectRoom }" :disabled="!canSelectRoom" required>
                            <option v-if="!availableRooms.length" disabled value="">
                                Aucune salle disponible
                            </option>
                            <option v-for="room in availableRooms" :key="room.id" :value="room.id">
                                {{ room.name }}
                            </option>
                        </select>

                        <span v-if="isUsingSetupRoom" class="text-xs text-primary mt-1 block">
                            <CheckCircle :size="14" class="inline mr-1" />
                            Salle créée à l'étape précédente
                        </span>
                        <span v-else-if="availableRooms.length > 1" class="text-xs text-neutral mt-1 block">
                            Sélectionnez la salle où se trouve ce serveur
                        </span>
                    </div>

                    <div>
                        <label for="upsId" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <BatteryCharging :size="18" class="text-primary" />
                            Onduleur associé
                        </label>
                        <select id="upsId" v-model="form.upsId"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            :class="{ 'bg-gray-100': !canSelectUps }" :disabled="!canSelectUps" required>
                            <option v-if="!availableUps.length" disabled value="">
                                Aucun onduleur disponible
                            </option>
                            <option v-for="ups in availableUps" :key="ups.id" :value="ups.id">
                                {{ ups.name }}
                            </option>
                        </select>

                        <span v-if="isUsingSetupUps" class="text-xs text-primary mt-1 block">
                            <CheckCircle :size="14" class="inline mr-1" />
                            Onduleur créé à l'étape précédente
                        </span>
                        <span v-else-if="availableUps.length > 1" class="text-xs text-neutral mt-1 block">
                            Sélectionnez l'onduleur qui protège ce serveur
                        </span>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-neutral-darker mb-4 border-b border-neutral-200 pb-2">
                    Informations générales
                </h3>
                <div class="mb-6">
                    <label for="name" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <Server :size="18" class="text-primary" />
                        Nom du serveur
                    </label>
                    <input id="name" v-model="form.name" type="text"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="ex: PROD-DB-01" required maxlength="64" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="type" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Cpu :size="18" class="text-primary" />
                            Type de serveur
                        </label>
                        <select id="type" v-model="form.type"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required>
                            <option value="physical">Physique</option>
                            <option value="virtual">Virtuel</option>
                        </select>
                    </div>
                    <div>
                        <label for="state" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Power :size="18" class="text-primary" />
                            État initial
                        </label>
                        <select id="state" v-model="form.state"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base bg-white focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required>
                            <option value="active">Allumé</option>
                            <option value="inactive">Éteint</option>
                        </select>
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-neutral-darker mb-4 border-b border-neutral-200 pb-2">
                    Configuration réseau
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="ip" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Network :size="18" class="text-primary" />
                            Adresse IP du serveur
                        </label>
                        <input id="ip" v-model="form.ip" type="text"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="ex: 192.168.1.100" pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$" required />
                        <span class="text-xs text-neutral mt-1 block">Format IPv4, ex: 192.168.1.100</span>
                    </div>
                    <div>
                        <label for="adminUrl"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Globe :size="18" class="text-primary" />
                            URL d'administration
                        </label>
                        <input id="adminUrl" v-model="form.adminUrl" type="url"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="https://192.168.1.100:8443" required />
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-neutral-darker mb-4 border-b border-neutral-200 pb-2">
                    Accès OS / Agent
                </h3>
                <p class="text-xs text-neutral mb-3">Identifiants distincts de ceux de l'ILO/IPMI.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="os-login"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <User :size="18" class="text-primary" />
                            Login OS / Agent
                        </label>
                        <input id="os-login" v-model="form.osLogin" type="text"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="ex: admin-os" required />
                    </div>
                    <div>
                        <label for="os-password"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Lock :size="18" class="text-primary" />
                            Mot de passe OS / Agent
                        </label>
                        <input id="os-password" v-model="form.osPassword" type="password"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="••••••••" required />
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-neutral-darker mb-4 border-b border-neutral-200 pb-2">
                    Configuration ILO / IPMI
                </h3>
                <p class="text-xs text-neutral mb-3">Identifiants dédiés, distincts de l'accès OS.</p>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="ilo-name"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Server :size="18" class="text-primary" />
                            Nom de l'interface ILO/IPMI
                        </label>
                        <input id="ilo-name" v-model="form.ilo.name" type="text"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="ex: ILO-PROD-DB-01" required />
                        <span class="text-xs text-neutral mt-1 block">Permet d'identifier cette interface dans la liste
                            ILO.</span>
                    </div>
                    <div>
                        <label for="ilo-ip" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Network :size="18" class="text-primary" />
                            Adresse IP ILO/IPMI
                        </label>
                        <input id="ilo-ip" v-model="form.ilo.ip" type="text"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="ex: 192.168.1.150" pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$" required />
                        <span class="text-xs text-neutral mt-1 block">Format IPv4, ex: 192.168.1.150</span>
                    </div>
                    <div>
                        <label for="ilo-login"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <User :size="18" class="text-primary" />
                            Login ILO/IPMI
                        </label>
                        <input id="ilo-login" v-model="form.ilo.login" type="text"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="ex: ilo-admin" required />
                    </div>
                    <div>
                        <label for="ilo-password"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Lock :size="18" class="text-primary" />
                            Mot de passe ILO/IPMI
                        </label>
                        <input id="ilo-password" v-model="form.ilo.password" type="password"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            placeholder="••••••••" required />
                    </div>
                </div>
            </div>

            <div>
                <h3 class="text-lg font-semibold text-neutral-darker mb-4 border-b border-neutral-200 pb-2">
                    Configuration avancée
                </h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label for="grace_period_on"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <Timer :size="18" class="text-primary" />
                            Délai avant arrêt forcé (s)
                        </label>
                        <input id="grace_period_on" v-model.number="form.grace_period_on" type="number" min="10"
                            max="300"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required />
                        <span class="text-xs text-neutral mt-1 block">Temps avant arrêt brutal</span>
                    </div>
                    <div>
                        <label for="grace_period_off"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <TimerOff :size="18" class="text-primary" />
                            Délai de redémarrage (s)
                        </label>
                        <input id="grace_period_off" v-model.number="form.grace_period_off" type="number" min="10"
                            max="300"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            required />
                        <span class="text-xs text-neutral mt-1 block">Temps avant redémarrage</span>
                    </div>
                    <div>
                        <label for="priority"
                            class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                            <ArrowUpDown :size="18" class="text-primary" />
                            Priorité
                        </label>
                        <input id="priority" v-model.number="form.priority" type="number"
                            class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                            min="1" max="10" required />
                        <span class="text-xs text-neutral mt-1 block">1 = plus haute priorité</span>
                    </div>
                </div>
            </div>

            <div
                class="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-lg px-4 py-3 mt-2 text-primary-dark text-sm">
                <Info :size="18" class="flex-shrink-0" />
                <span>
                    Ce serveur sera ton serveur de référence. Tu pourras ajouter d'autres serveurs et créer des groupes
                    depuis le tableau de bord.
                </span>
            </div>

            <button type="submit" :disabled="isSubmitting || setupStore.isLoading"
                class="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95 disabled:opacity-60">
                <Server :size="20" />
                {{ isSubmitting ? 'Envoi en cours...' : "Valider et passer à l'étape suivante" }}
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import {
    Server, Cpu, Power, Network, Globe, User, Lock,
    Timer, TimerOff, ArrowUpDown, BatteryCharging, Info, Building2,
    CheckCircle
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { useSetupStore } from '../../store';
import { SetupStep } from '../../types';
import { createServer } from '@/features/servers/api';
import { roomApi } from '@/features/rooms/api';
import { upsApi } from '@/features/ups/api';
import type { ServerState, ServerType } from '@/features/servers/types';

const setupStore = useSetupStore();
const toast = useToast();

const availableRooms = ref<any[]>([]);
const availableUps = ref<any[]>([]);
const isLoadingRooms = ref(false);
const isLoadingUps = ref(false);

const roomData = setupStore.getStepData(SetupStep.CREATE_ROOM);
const upsData = setupStore.getStepData(SetupStep.CREATE_UPS);

const isUsingSetupRoom = computed(() =>
    roomData.id && form.roomId === roomData.id
);

const isUsingSetupUps = computed(() =>
    upsData.id && form.upsId === upsData.id
);

const canSelectRoom = computed(() =>
    availableRooms.value.length > 0 && !isLoadingRooms.value
);

const canSelectUps = computed(() =>
    availableUps.value.length > 0 && !isLoadingUps.value
);

const form = reactive({
    name: '',
    state: 'active',
    type: 'physical',
    ip: '',
    adminUrl: '',
    osLogin: '',
    osPassword: '',
    ilo: {
        name: '',
        ip: '',
        login: '',
        password: '',
    },
    grace_period_on: 60,
    grace_period_off: 30,
    priority: 1,
    roomId: roomData.id || '',
    upsId: upsData.id || '',
});

const isSubmitting = ref(false);

const loadAvailableResources = async () => {
    try {
        isLoadingRooms.value = true;
        const rooms = await roomApi.fetchRooms();
        availableRooms.value = rooms || [];

        if (roomData.id && !availableRooms.value.find(r => r.id === roomData.id)) {
            availableRooms.value.unshift({
                id: roomData.id,
                name: roomData.name || 'Salle créée pendant le setup'
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des salles:', error);
        if (roomData.id) {
            availableRooms.value = [{
                id: roomData.id,
                name: roomData.name || 'Salle principale'
            }];
        }
    } finally {
        isLoadingRooms.value = false;
    }

    try {
        isLoadingUps.value = true;
        const upsList = await upsApi.getAll();
        availableUps.value = upsList || [];

        if (upsData.id && !availableUps.value.find(u => u.id === upsData.id)) {
            availableUps.value.unshift({
                id: upsData.id,
                name: upsData.name || 'UPS créé pendant le setup'
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des UPS:', error);
        if (upsData.id) {
            availableUps.value = [{
                id: upsData.id,
                name: upsData.name || 'UPS principal'
            }];
        }
    } finally {
        isLoadingUps.value = false;
    }
};

onMounted(() => {
    loadAvailableResources();
});

const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Le nom du serveur est requis.");
    if (!form.ip.match(/^(?:\d{1,3}\.){3}\d{1,3}$/)) return toast.error("IP du serveur invalide.");
    if (!form.adminUrl) return toast.error("L'URL d'administration est requise.");
    if (!form.osLogin.trim() || !form.osPassword) return toast.error("Identifiants OS / Agent requis.");
    if (!form.ilo.name.trim()) return toast.error("Nom de l'interface ILO requis.");
    if (!form.ilo.ip.match(/^(?:\d{1,3}\.){3}\d{1,3}$/)) return toast.error("IP ILO invalide.");
    if (!form.ilo.login.trim() || !form.ilo.password) return toast.error("Identifiants ILO/IPMI requis.");
    if (!form.roomId) return toast.error("Veuillez sélectionner une salle.");
    if (!form.upsId) return toast.error("Veuillez sélectionner un onduleur.");

    if (form.osLogin.trim() === form.ilo.login.trim()) {
        toast.warning("Attention : il est déconseillé d'utiliser le même login pour l'OS et l'ILO.");
    }
    if (form.osPassword && form.osPassword === form.ilo.password) {
        toast.warning("Attention : il est déconseillé d'utiliser le même mot de passe pour l'OS et l'ILO.");
    }

    const payload = {
        name: form.name.trim(),
        ip: form.ip.trim(),
        state: form.state as ServerState,
        adminUrl: form.adminUrl.trim(),
        login: form.osLogin.trim(),
        password: form.osPassword,
        type: form.type as ServerType,
        priority: form.priority,
        grace_period_on: form.grace_period_on,
        grace_period_off: form.grace_period_off,
        roomId: form.roomId,
        upsId: form.upsId,
        ilo: {
            name: form.ilo.name.trim(),
            ip: form.ilo.ip.trim(),
            login: form.ilo.login.trim(),
            password: form.ilo.password,
        },
    };

    try {
        isSubmitting.value = true;
        setupStore.isLoading = true;

        const serverCreated = await createServer(payload);
        await setupStore.completeSetupStep(SetupStep.CREATE_SERVER, {
            ...form,
            id: serverCreated.id,
        });
        toast.success('Serveur ajouté avec succès !');
    } catch (error: any) {
        console.error(error);
        toast.error(error.response?.data?.message || error.message || "Erreur lors de l'ajout du serveur");
    } finally {
        isSubmitting.value = false;
        setupStore.isLoading = false;
    }
};
</script>
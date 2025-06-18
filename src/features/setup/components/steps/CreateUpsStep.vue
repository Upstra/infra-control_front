<template>
    <div class="flex flex-col items-center justify-center min-h-[70vh] px-4 py-10">
        <div class="mb-8 text-center">
            <h2 class="text-2xl md:text-3xl font-bold text-neutral-darker tracking-tight">
                Ajoutez un onduleur (UPS)
            </h2>
            <p class="mt-2 text-base md:text-lg text-neutral-dark max-w-lg mx-auto">
                L'onduleur protège vos serveurs contre les coupures de courant et les variations électriques.
            </p>
        </div>

        <form @submit.prevent="handleSubmit"
            class="w-full max-w-xl bg-white rounded-2xl shadow-md border border-neutral-100 p-8 flex flex-col gap-6"
            autocomplete="off">

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
                    Sélectionnez la salle où sera installé cet onduleur
                </span>
                <span v-else-if="isLoadingRooms" class="text-xs text-neutral mt-1 block">
                    Chargement des salles...
                </span>
            </div>

            <div>
                <label for="name" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                    <BatteryCharging :size="18" class="text-primary" />
                    Nom de l'onduleur
                </label>
                <input id="name" v-model="form.name" type="text"
                    class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                    placeholder="ex: UPS Principal DC-01" required maxlength="64" />
                <span class="text-xs text-neutral mt-1 block">Identifiant unique pour cet onduleur</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="ip" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <Zap :size="18" class="text-primary" />
                        Adresse IP
                    </label>
                    <input id="ip" v-model="form.ip" type="text"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="ex: 192.168.1.200" pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$" required />
                    <span class="text-xs text-neutral mt-1 block">Adresse IP de l'onduleur</span>
                </div>
                <div>
                    <label for="login" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <User :size="18" class="text-primary" />
                        Login
                    </label>
                    <input id="login" v-model="form.login" type="text"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="Nom d'utilisateur" required />
                </div>
            </div>

            <div>
                <label for="password" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                    <Key :size="18" class="text-primary" />
                    Mot de passe
                </label>
                <input id="password" v-model="form.password" type="password"
                    class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                    placeholder="Mot de passe" required />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="grace_period_on"
                        class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <Clock :size="18" class="text-primary" />
                        Délai avant coupure (s)
                    </label>
                    <input id="grace_period_on" v-model.number="form.grace_period_on" type="number" min="0"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="ex: 60" required />
                    <span class="text-xs text-neutral mt-1 block">Temps avant coupure lors d'une panne</span>
                </div>
                <div>
                    <label for="grace_period_off"
                        class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <Clock :size="18" class="text-primary" />
                        Délai après retour secteur (s)
                    </label>
                    <input id="grace_period_off" v-model.number="form.grace_period_off" type="number" min="0"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="ex: 30" required />
                    <span class="text-xs text-neutral mt-1 block">Temps après retour secteur</span>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label for="brand" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <Package :size="18" class="text-primary" />
                        Marque
                    </label>
                    <select id="brand" v-model="form.brand"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base bg-white focus:ring-2 focus:ring-primary focus:border-primary transition">
                        <option value="">Sélectionner une marque</option>
                        <option value="APC">APC</option>
                        <option value="Eaton">Eaton</option>
                        <option value="Schneider">Schneider Electric</option>
                        <option value="Vertiv">Vertiv</option>
                        <option value="ABB">ABB</option>
                        <option value="Other">Autre</option>
                    </select>
                </div>
                <div>
                    <label for="model" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                        <Hash :size="18" class="text-primary" />
                        Modèle
                    </label>
                    <input id="model" v-model="form.model" type="text"
                        class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                        placeholder="ex: Smart-UPS 3000" />
                </div>
            </div>

            <div>
                <label for="capacity" class="block font-medium text-neutral-darker flex items-center gap-2 mb-1">
                    <Zap :size="18" class="text-primary" />
                    Capacité (kVA)
                </label>
                <input id="capacity" v-model.number="form.capacity" type="number"
                    class="block w-full border border-neutral-300 rounded-lg px-3 py-2 text-base focus:ring-2 focus:ring-primary focus:border-primary transition"
                    min="1" step="0.1" placeholder="ex: 3" />
                <span class="text-xs text-neutral mt-1 block">Puissance en kilovolt-ampères</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div class="flex items-center gap-3 bg-primary/5 rounded-lg p-4">
                    <Clock :size="22" class="text-primary" />
                    <div>
                        <span class="font-semibold text-neutral-dark">Autonomie typique</span>
                        <p class="text-xs text-neutral mt-1">{{ estimatedRuntime }} minutes à 50% de charge</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 bg-primary/5 rounded-lg p-4">
                    <Server :size="22" class="text-primary" />
                    <div>
                        <span class="font-semibold text-neutral-dark">Capacité serveurs</span>
                        <p class="text-xs text-neutral mt-1">Environ {{ estimatedServerCapacity }} serveurs standards
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="flex items-center gap-3 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-3 mt-2 text-yellow-900 text-sm">
                <AlertTriangle :size="18" class="flex-shrink-0 text-yellow-500" />
                <span>
                    Assurez-vous que la capacité de l'onduleur est suffisante pour protéger tous vos équipements
                    critiques avec une marge de sécurité.
                </span>
            </div>

            <button type="submit" :disabled="isSubmitting || setupStore.isLoading"
                class="mt-8 inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold rounded-2xl px-8 py-3 shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition active:scale-95 disabled:opacity-60">
                <BatteryCharging :size="20" />
                {{ isSubmitting ? "Envoi en cours..." : "Valider et passer à l'étape suivante" }}
            </button>
        </form>
    </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import {
    BatteryCharging, Package, Hash, Zap, Building2,
    Clock, Server, AlertTriangle, User, Key, CheckCircle
} from 'lucide-vue-next';
import { useToast } from 'vue-toast-notification';
import { useSetupStore } from '../../store';
import { SetupStep } from '../../types';
import { upsApi } from '@/features/ups/api';
import { roomApi } from '@/features/rooms/api';

const setupStore = useSetupStore();
const toast = useToast();

const availableRooms = ref<any[]>([]);
const isLoadingRooms = ref(false);
const isSubmitting = ref(false);

const roomData = setupStore.getStepData(SetupStep.CREATE_ROOM);

const isUsingSetupRoom = computed(() =>
    roomData.id && form.roomId === roomData.id
);

const canSelectRoom = computed(() =>
    availableRooms.value.length > 0 && !isLoadingRooms.value
);

const form = reactive({
    name: '',
    ip: '',
    login: '',
    password: '',
    grace_period_on: 60,
    grace_period_off: 30,
    roomId: roomData.id || '',
    brand: '',
    model: '',
    capacity: 3,
});

const estimatedRuntime = computed(() => Math.round(form.capacity * 10));
const estimatedServerCapacity = computed(() => Math.floor(form.capacity / 0.5));

const loadAvailableRooms = async () => {
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

        if (availableRooms.value.length === 1) {
            form.roomId = availableRooms.value[0].id;
        }
    } catch (error) {
        //TODO: gérer les erreurs de chargement de salles si besoin
        if (roomData.id) {
            availableRooms.value = [{
                id: roomData.id,
                name: roomData.name || 'Salle principale'
            }];
            form.roomId = roomData.id;
        } else {
            toast.error("Impossible de charger les salles disponibles");
        }
    } finally {
        isLoadingRooms.value = false;
    }
};

onMounted(() => {
    loadAvailableRooms();
});

const handleSubmit = async () => {
    if (!form.name?.trim()) return toast.error("Le nom de l'onduleur est requis");
    if (!form.ip?.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/)) return toast.error("L'adresse IP est invalide");
    if (!form.login?.trim()) return toast.error("Le login est requis");
    if (!form.password) return toast.error("Le mot de passe est requis");
    if (!form.roomId) return toast.error("Veuillez sélectionner une salle");
    if (form.grace_period_on < 0 || form.grace_period_off < 0) return toast.error("Les délais ne peuvent pas être négatifs");

    const creationDto = {
        name: form.name.trim(),
        ip: form.ip.trim(),
        login: form.login.trim(),
        password: form.password,
        grace_period_on: form.grace_period_on,
        grace_period_off: form.grace_period_off,
        roomId: form.roomId,
        //TODO: voir si on garde ou en optionnel
        //...(form.brand && { brand: form.brand }),
        //...(form.model && { model: form.model }),
        //...(form.capacity && { capacity: form.capacity }),
    };

    try {
        isSubmitting.value = true;
        setupStore.isLoading = true;

        const createdUps = await upsApi.create(creationDto);

        //TODO: envoyer que les champs stricts ou toute la form (voir backend)
        await setupStore.completeSetupStep(SetupStep.CREATE_UPS, {
            ...form,
            id: createdUps.id,
        });

        toast.success('Onduleur ajouté avec succès !');
        //TODO: gestion navigation selon backend (redirigé auto ou non)
    } catch (error: any) {
        //TODO: améliorer gestion des erreurs si besoin
        const errorMessage = error.response?.data?.message || error.message || "Erreur lors de l'ajout de l'onduleur";
        toast.error(errorMessage);
    } finally {
        isSubmitting.value = false;
        setupStore.isLoading = false;
    }
};
</script>
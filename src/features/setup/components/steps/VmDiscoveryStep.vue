<template>
    <div class="max-w-4xl mx-auto py-10 px-2">
        <h2 class="text-2xl font-bold mb-2 text-neutral-darker">Découverte des VMs sur l’hôte</h2>
        <p class="mb-6 text-neutral-dark">Recherche en cours… Les machines virtuelles sont découvertes et s’affichent
            automatiquement ci-dessous.</p>

        <p v-if="!isLoading && vms.length === 0" class="text-neutral-dark text-center">
            Aucune machine virtuelle trouvée sur cet hôte.
            <br />
            Assurez-vous que l’hôte est en ligne et que les services de découverte sont actifs
            <br />
        </p>

        <VmTable v-else :vms="vms" @edit="openEdit" />

        <VmEditModal v-if="editVm" :vm="editVm" @close="editVm = null" @save="handleSave" />

        <div class="text-right mt-8">
            <button @click="nextStep" :disabled="isLoading"
                class="bg-primary text-white px-6 py-2 rounded-xl font-semibold shadow hover:bg-primary-dark transition disabled:opacity-50">
                Terminer la découverte
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import VmTable from './VmTable.vue'
import VmEditModal from './VmEditModal.vue'
import { useSetupStore } from '../../store'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toast-notification'
import { SetupStep } from '../../types'

const router = useRouter()
const toast = useToast()

const isLoading = ref(true)
const vms = ref<{ id: string; name: string; ip: string; state: string }[]>([])
const editVm = ref<{ id: string; name: string; ip: string; state: string } | null>(null)
const setupStore = useSetupStore()
const serverId = ref<string | null>(null);

onMounted(async () => {
    const steps = await setupStore.getSetupProgress();
    const serverStep = steps.find((step: any) => step.step === SetupStep.CREATE_SERVER);

    serverId.value = serverStep?.metadata?.id ?? null;
    if (!serverId.value) {
        isLoading.value = false;
        toast.error("Aucun serveur trouvé. Veuillez d'abord créer un serveur.");
        router.push('/setup/create-server');
        return;
    }
    
    console.log('Découverte des VMs pour le serveur:', serverId);
});

const MOCK_VMS = [
    { id: 'vm-1', name: 'PROD-WEB-01', ip: '192.168.1.201', state: 'active' },
    { id: 'vm-2', name: 'DB-INT-02', ip: '192.168.1.202', state: 'inactive' },
    { id: 'vm-3', name: 'APP-BACK-03', ip: '192.168.1.203', state: 'active' },
]

setTimeout(() => {
    vms.value.push(MOCK_VMS[0])
}, 1000)
setTimeout(() => {
    vms.value.push(MOCK_VMS[1])
}, 1700)
setTimeout(() => {
    vms.value.push(MOCK_VMS[2])
    isLoading.value = false
}, 2300)

const openEdit = (vm: { id: string; name: string; ip: string; state: string }) => {
    editVm.value = { ...vm }
}
const handleSave = (updated: { id: string; name: string }) => {
    const i = vms.value.findIndex(vm => vm.id === updated.id)
    if (i !== -1) vms.value[i].name = updated.name
    editVm.value = null
}
const nextStep = async () => {
  if (!serverId.value) {
    toast.error("Aucun serveur sélectionné.");
    return;
  }
  await setupStore.completeVmDiscovery(
    serverId.value,
    vms.value.map(vm => vm.id)
  )
}
</script>

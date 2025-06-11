<template>
    <div class="max-w-4xl mx-auto py-10 px-2">
        <h2 class="text-2xl font-bold mb-2 text-neutral-darker">Découverte des VMs sur l’hôte</h2>
        <p class="mb-6 text-neutral-dark">Recherche en cours… Les machines virtuelles sont découvertes et s’affichent
            automatiquement ci-dessous.</p>

        <LoaderSkeleton v-if="isLoading" :count="3" />

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
import { ref } from 'vue'
import LoaderSkeleton from '@/components/LoaderSkeleton.vue'
import VmTable from './VmTable.vue'
import VmEditModal from './VmEditModal.vue'

const isLoading = ref(true)
const vms = ref<{ id: string; name: string; ip: string; state: string }[]>([])
const editVm = ref<any>(null)

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

const openEdit = (vm: any) => {
    editVm.value = { ...vm }
}
const handleSave = (updated: any) => {
    const i = vms.value.findIndex(vm => vm.id === updated.id)
    if (i !== -1) vms.value[i].name = updated.name
    editVm.value = null
}
const nextStep = () => {
    // ...passe à l’étape suivante du setup
}
</script>

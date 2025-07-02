<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  CubeIcon,
  CheckCircleIcon,
  StopIcon,
  CircleStackIcon,
} from '@heroicons/vue/24/outline';
import VirtualMachineCard from './VirtualMachineCard.vue';

interface VirtualMachine {
  id: string;
  name: string;
  state: string;
  cpu: number;
  memory: number;
  storage: number;
  ip: string;
  os: string;
}

interface Props {
  vms: VirtualMachine[];
}

interface Emits {
  (e: 'vm-action', vmId: string, action: 'start' | 'stop' | 'restart'): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const { t } = useI18n();

const vmStats = computed(() => ({
  total: props.vms.length,
  running: props.vms.filter((vm) => vm.state === 'running').length,
  stopped: props.vms.filter((vm) => vm.state === 'stopped').length,
  totalCpu: props.vms.reduce((sum, vm) => sum + vm.cpu, 0),
  totalMemory: props.vms.reduce((sum, vm) => sum + vm.memory, 0),
}));
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">{{ t('servers.total_vms') }}</p>
            <p class="text-2xl font-bold text-slate-900">
              {{ vmStats.total }}
            </p>
          </div>
          <CubeIcon class="h-8 w-8 text-blue-600" />
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">{{ t('servers.running_vms') }}</p>
            <p class="text-2xl font-bold text-emerald-600">
              {{ vmStats.running }}
            </p>
          </div>
          <CheckCircleIcon class="h-8 w-8 text-emerald-600" />
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">{{ t('servers.stopped_vms') }}</p>
            <p class="text-2xl font-bold text-red-600">
              {{ vmStats.stopped }}
            </p>
          </div>
          <StopIcon class="h-8 w-8 text-red-600" />
        </div>
      </div>

      <div class="bg-white border border-slate-200 rounded-xl p-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-600">{{ t('servers.total_ram') }}</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ (vmStats.totalMemory / 1024).toFixed(1) }}GB
            </p>
          </div>
          <CircleStackIcon class="h-8 w-8 text-purple-600" />
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-slate-900">
        {{ t('servers.virtual_machines') }}
      </h3>

      <div class="grid grid-cols-1 gap-4">
        <VirtualMachineCard
          v-for="vm in vms"
          :key="vm.id"
          :vm="vm"
          @vm-action="(vmId, action) => $emit('vm-action', vmId, action)"
        />
      </div>
    </div>
  </div>
</template>
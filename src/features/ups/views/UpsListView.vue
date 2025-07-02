<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import {
  BoltIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline';
import { BoltIcon as BoltIconSolid } from '@heroicons/vue/24/solid';
import UpsCard from '../components/UpsCard.vue';
import UpsCreateModal from '../components/UpsCreateModal.vue';
import { useUpsStore } from '../store';

const router = useRouter();
const upsStore = useUpsStore();
const { list, loading } = storeToRefs(upsStore);
const { fetchUps } = upsStore;

const showCreateModal = ref(false);
const searchQuery = ref('');
const selectedRoom = ref('all');
const { t } = useI18n();

const filteredUps = computed(() => {
  let filtered = list.value;

  if (searchQuery.value) {
    filtered = filtered.filter(
      (ups) =>
        ups.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        ups.ip.includes(searchQuery.value),
    );
  }

  if (selectedRoom.value !== 'all') {
    filtered = filtered.filter((ups) => ups.roomId === selectedRoom.value);
  }

  return filtered;
});

const upsStats = computed(() => ({
  total: list.value.length,
  online: Math.floor(list.value.length * 0.9),
  offline: Math.ceil(list.value.length * 0.1),
  rooms: [...new Set(list.value.map((ups) => ups.roomId))].length,
}));

const rooms = computed(() => {
  const uniqueRooms = [...new Set(list.value.map((ups) => ups.roomId))];
  return uniqueRooms.map((id) => ({ id, name: `Room ${id}` }));
});

const handleCreated = () => {
  showCreateModal.value = false;
  fetchUps();
};

const handleUpsClick = (upsId: string) => {
  router.push(`/ups/${upsId}`);
};

onMounted(fetchUps);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <div class="bg-white border-b border-slate-200 shadow-sm">
      <div class="max-w-7xl mx-auto px-6 py-6">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="p-2 bg-amber-100 rounded-lg">
              <BoltIconSolid class="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-slate-900">
                {{ t('ups.list_title') }}
              </h1>
              <p class="text-sm text-slate-600">
                {{ t('ups.manage_power_infrastructure') }}
              </p>
            </div>
          </div>

          <button
            @click="showCreateModal = true"
            class="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors shadow-sm"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            {{ t('ups.add_ups') }}
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600">
                {{ t('ups.stats.total') }}
              </p>
              <p class="text-2xl font-bold text-slate-900">
                {{ upsStats.total }}
              </p>
            </div>
            <div class="p-3 bg-amber-100 rounded-xl">
              <BoltIcon class="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600">
                {{ t('ups.stats.online') }}
              </p>
              <p class="text-2xl font-bold text-emerald-600">
                {{ upsStats.online }}
              </p>
            </div>
            <div class="p-3 bg-emerald-100 rounded-xl">
              <ShieldCheckIcon class="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600">
                {{ t('ups.stats.offline') }}
              </p>
              <p class="text-2xl font-bold text-red-600">
                {{ upsStats.offline }}
              </p>
            </div>
            <div class="p-3 bg-red-100 rounded-xl">
              <ExclamationTriangleIcon class="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-slate-600">
                {{ t('ups.stats.rooms_covered') }}
              </p>
              <p class="text-2xl font-bold text-blue-600">
                {{ upsStats.rooms }}
              </p>
            </div>
            <div class="p-3 bg-blue-100 rounded-xl">
              <BuildingOffice2Icon class="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8"
      >
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <MagnifyingGlassIcon
                class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400"
              />
              <input
                v-model="searchQuery"
                type="text"
                :placeholder="t('ups.search_placeholder')"
                class="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div class="flex items-center space-x-3">
            <div class="flex items-center space-x-2">
              <FunnelIcon class="h-4 w-4 text-slate-500" />
              <select
                v-model="selectedRoom"
                class="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">{{ t('ups.all_rooms') }}</option>
                <option v-for="room in rooms" :key="room.id" :value="room.id">
                  {{ room.name }}
                </option>
              </select>
            </div>

            <div
              class="text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg"
            >
              {{ filteredUps.length }} {{ t('ups.results') }}
            </div>
          </div>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-20">
        <div class="text-center space-y-4">
          <div
            class="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"
          ></div>
          <p class="text-slate-600">{{ t('ups.loading') }}</p>
        </div>
      </div>

      <div
        v-else-if="filteredUps.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <div
          v-for="ups in filteredUps"
          :key="ups.id"
          @click="handleUpsClick(ups.id)"
          class="cursor-pointer hover:scale-[1.02] transition-transform duration-200"
        >
          <UpsCard :ups="ups" />
        </div>
      </div>

      <div v-else class="text-center py-20">
        <div class="bg-white rounded-2xl border border-slate-200 p-12">
          <BoltIcon class="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-slate-900 mb-2">
            {{ searchQuery ? t('ups.no_results') : t('ups.no_ups_found') }}
          </h3>
          <p class="text-slate-500 mb-6">
            {{
              searchQuery
                ? t('ups.try_different_search')
                : t('ups.add_first_ups')
            }}
          </p>
          <button
            v-if="!searchQuery"
            @click="showCreateModal = true"
            class="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <PlusIcon class="h-4 w-4 mr-2" />
            {{ t('ups.add_ups') }}
          </button>
        </div>
      </div>
    </div>

    <UpsCreateModal
      :is-open="showCreateModal"
      @close="showCreateModal = false"
      @created="handleCreated"
    />
  </div>
</template>

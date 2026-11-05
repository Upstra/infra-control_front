<template>
  <div class="flex h-full">
    <div
      class="w-full lg:w-1/2 xl:w-2/5 px-8 py-6 border-r border-border overflow-y-auto"
    >
      <div class="space-y-6">
        <div>
          <label
            class="block text-sm font-medium text-text mb-2"
          >
            {{ t('groups.form.name') }}
          </label>
          <input
            :value="formData.name"
            @input="
              updateFormData({
                ...formData,
                name: ($event.target as HTMLInputElement).value,
              })
            "
            type="text"
            required
            class="w-full px-4 py-3 border border-border-control rounded-xl bg-surface text-text-strong focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            :placeholder="t('groups.form.namePlaceholder')"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-text mb-2"
          >
            {{ t('groups.form.description') }}
          </label>
          <textarea
            :value="formData.description"
            @input="
              updateFormData({
                ...formData,
                description: ($event.target as HTMLTextAreaElement).value,
              })
            "
            rows="4"
            class="w-full px-4 py-3 border border-border-control rounded-xl bg-surface text-text-strong focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
            :placeholder="t('groups.form.descriptionPlaceholder')"
          />
        </div>

        <div v-if="mode === 'create'">
          <label
            class="block text-sm font-medium text-text mb-3"
          >
            {{ t('groups.form.type') }}
          </label>
          <div class="grid grid-cols-2 gap-3">
            <label
              :class="[
                'relative flex flex-col items-center justify-center px-4 py-6 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105',
                formData.type === 'SERVER'
                  ? 'border-primary bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg shadow-blue-500/20'
                  : 'border-border-control hover:border-border-control bg-surface',
              ]"
            >
              <input
                type="radio"
                :value="'SERVER'"
                :checked="formData.type === 'SERVER'"
                @change="updateFormData({ ...formData, type: 'SERVER' })"
                class="sr-only"
              />
              <ServerIcon
                :class="[
                  'w-8 h-8 mb-2',
                  formData.type === 'SERVER'
                    ? 'text-primary-text'
                    : 'text-text-muted',
                ]"
              />
              <span
                :class="[
                  'font-medium',
                  formData.type === 'SERVER'
                    ? 'text-primary-text'
                    : 'text-text',
                ]"
              >
                {{ t('groups.serverGroup') }}
              </span>
            </label>

            <label
              :class="[
                'relative flex flex-col items-center justify-center px-4 py-6 border-2 rounded-xl cursor-pointer transition-all transform hover:scale-105',
                formData.type === 'VM'
                  ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg shadow-purple-500/20'
                  : 'border-border-control hover:border-border-control bg-surface',
              ]"
            >
              <input
                type="radio"
                :value="'VM'"
                :checked="formData.type === 'VM'"
                @change="updateFormData({ ...formData, type: 'VM' })"
                class="sr-only"
              />
              <CpuChipIcon
                :class="[
                  'w-8 h-8 mb-2',
                  formData.type === 'VM'
                    ? 'text-purple-600'
                    : 'text-text-muted',
                ]"
              />
              <span
                :class="[
                  'font-medium',
                  formData.type === 'VM'
                    ? 'text-purple-900'
                    : 'text-text',
                ]"
              >
                {{ t('groups.vmGroup') }}
              </span>
            </label>
          </div>
        </div>

        <div
          v-else
          class="bg-page rounded-xl p-4"
        >
          <div class="flex items-center gap-3">
            <div
              :class="[
                'inline-flex items-center justify-center w-12 h-12 rounded-lg',
                formData.type === 'SERVER'
                  ? 'bg-[rgb(var(--c-primary-hover)/0.1)] text-primary-text'
                  : 'bg-purple-100 text-purple-600',
              ]"
            >
              <component
                :is="formData.type === 'SERVER' ? ServerIcon : CpuChipIcon"
                class="w-6 h-6"
              />
            </div>
            <div>
              <p class="text-xs text-text-muted">
                {{ t('groups.form.type') }}
              </p>
              <p class="font-medium text-text-strong">
                {{
                  formData.type === 'SERVER'
                    ? t('groups.serverGroup')
                    : t('groups.vmGroup')
                }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-primary-text">
                {{ t('groups.form.selectedResources') }}
              </p>
              <p class="text-xs text-primary-text mt-1">
                {{
                  formData.type === 'SERVER'
                    ? t('groups.form.serversSelected', {
                        count: selectedServerIds.length,
                      })
                    : t('groups.form.vmsSelected', {
                        count: selectedVmIds.length,
                      })
                }}
              </p>
            </div>
            <div class="text-3xl font-bold text-primary-text">
              {{
                formData.type === 'SERVER'
                  ? selectedServerIds.length
                  : selectedVmIds.length
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="flex-1 px-8 py-6 overflow-y-auto">
      <div class="mb-6">
        <h3 class="text-lg font-semibold text-text-strong">
          {{
            formData.type === 'SERVER'
              ? t('groups.form.selectServers')
              : t('groups.form.selectVms')
          }}
        </h3>
        <p class="text-sm text-text-muted mt-1">
          {{ t('groups.form.selectResourcesHelp') }}
        </p>
      </div>

      <ResourceSelector
        v-if="availableResources.length > 0 || loadingResources"
        :key="`${formData.type}-${selectedServerIds.length}-${selectedVmIds.length}`"
        :model-value="
          formData.type === 'SERVER' ? selectedServerIds : selectedVmIds
        "
        :type="formData.type === 'SERVER' ? 'server' : 'vm'"
        :available-resources="availableResources"
        :loading="loadingResources"
        @update:model-value="handleResourceSelection"
      />

      <div v-else class="flex items-center justify-center h-64">
        <div class="text-center">
          <div
            class="mx-auto w-24 h-24 bg-surface-raised rounded-full flex items-center justify-center mb-4"
          >
            <component
              :is="formData.type === 'SERVER' ? ServerIcon : CpuChipIcon"
              class="w-12 h-12 text-text-muted"
            />
          </div>
          <p class="text-text">
            {{
              formData.type === 'SERVER'
                ? t('groups.form.noServersAvailable')
                : t('groups.form.noVmsAvailable')
            }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ServerIcon, CpuChipIcon } from '@heroicons/vue/24/outline';
import { useI18n } from 'vue-i18n';
import type { GroupResponseDto, CreateGroupDto, GroupType } from '../../types';
import ResourceSelector from '../ResourceSelector.vue';

interface Props {
  group?: GroupResponseDto | null;
  mode: 'create' | 'edit';
  formData: CreateGroupDto & { type: GroupType };
  availableResources: any[];
  loadingResources: boolean;
  selectedServerIds: string[];
  selectedVmIds: string[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:formData': [data: CreateGroupDto & { type: GroupType }];
  'update:selectedServerIds': [ids: string[]];
  'update:selectedVmIds': [ids: string[]];
}>();

const { t } = useI18n();

const updateFormData = (data: CreateGroupDto & { type: GroupType }) => {
  emit('update:formData', data);
};

const handleResourceSelection = (resourceIds: string[]) => {
  if (props.formData.type === 'SERVER') {
    emit('update:selectedServerIds', resourceIds);
  } else {
    emit('update:selectedVmIds', resourceIds);
  }
};
</script>

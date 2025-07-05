<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">
        {{ t('dashboard.layouts.title') }}
      </h3>
      <div class="flex items-center space-x-2">
        <button
          @click="showTemplates = true"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          <Icon name="layout-template" class="mr-2 h-4 w-4" />
          {{ t('dashboard.layouts.fromTemplate') }}
        </button>
        <button
          @click="createNewLayout"
          class="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <Icon name="plus" class="mr-2 h-4 w-4" />
          {{ t('dashboard.layouts.create') }}
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="layout in layouts"
        :key="layout.id"
        :class="[
          'relative rounded-lg border-2 p-4 cursor-pointer transition-all',
          layout.id === activeLayoutId
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
        ]"
        @click="selectLayout(layout.id)"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ layout.name }}
              <span
                v-if="layout.isDefault"
                class="ml-2 text-xs text-primary-600 dark:text-primary-400"
              >
                ({{ t('dashboard.layouts.default') }})
              </span>
            </h4>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ layout.widgets.length }} {{ t('dashboard.layouts.widgets') }}
            </p>
          </div>

          <div class="relative">
            <button
              @click.stop="toggleMenu(layout.id)"
              data-menu-toggle
              class="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon name="more-vertical" class="h-4 w-4 text-gray-500" />
            </button>

            <div
              v-if="menuOpen === layout.id"
              data-menu-dropdown
              class="absolute right-0 z-10 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800"
            >
              <div class="py-1">
                <button
                  v-if="!layout.isDefault"
                  @click.stop="setAsDefault(layout.id)"
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Icon name="star" class="inline mr-2 h-4 w-4" />
                  {{ t('dashboard.layouts.setDefault') }}
                </button>
                <button
                  @click.stop="editLayout(layout)"
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Icon name="edit" class="inline mr-2 h-4 w-4" />
                  {{ t('dashboard.layouts.edit') }}
                </button>
                <button
                  @click.stop="duplicateLayout(layout)"
                  class="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <Icon name="copy" class="inline mr-2 h-4 w-4" />
                  {{ t('dashboard.layouts.duplicate') }}
                </button>
                <button
                  v-if="layouts.length > 1"
                  @click.stop="confirmDelete(layout)"
                  class="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Icon name="trash" class="inline mr-2 h-4 w-4" />
                  {{ t('dashboard.layouts.delete') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-3 grid grid-cols-4 gap-1">
          <div
            v-for="i in 12"
            :key="i"
            :class="[
              'h-8 rounded',
              i <= layout.widgets.length
                ? 'bg-primary-200 dark:bg-primary-800'
                : 'bg-gray-200 dark:bg-gray-700',
            ]"
          ></div>
        </div>
      </div>
    </div>

    <!-- Edit Layout Modal -->
    <Modal v-if="editingLayout" @close="editingLayout = null">
      <template #header>
        {{ t('dashboard.layouts.editTitle') }}
      </template>

      <div class="space-y-4">
        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('dashboard.layouts.name') }}
          </label>
          <input
            v-model="editForm.name"
            type="text"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('dashboard.layouts.columns') }}
          </label>
          <select
            v-model.number="editForm.columns"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          >
            <option :value="8">8</option>
            <option :value="12">12</option>
            <option :value="16">16</option>
          </select>
        </div>

        <div>
          <label
            class="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {{ t('dashboard.layouts.rowHeight') }}
          </label>
          <input
            v-model.number="editForm.rowHeight"
            type="number"
            min="40"
            max="200"
            step="10"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700"
          />
        </div>
      </div>

      <template #footer>
        <button
          @click="editingLayout = null"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          @click="saveLayoutEdit"
          class="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          {{ t('common.save') }}
        </button>
      </template>
    </Modal>

    <!-- Templates Modal -->
    <TemplatesModal
      v-if="showTemplates"
      @close="showTemplates = false"
      @select="createFromTemplate"
    />

    <!-- Delete Confirmation -->
    <ConfirmModal
      v-if="deletingLayout"
      :title="t('dashboard.layouts.deleteConfirm.title')"
      :message="
        t('dashboard.layouts.deleteConfirm.message', {
          name: deletingLayout.name,
        })
      "
      :confirm-text="t('common.delete')"
      :cancel-text="t('common.cancel')"
      variant="danger"
      @confirm="deleteLayout"
      @cancel="deletingLayout = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../../store';
import Modal from '@/shared/components/Modal.vue';
import ConfirmModal from '@/shared/components/ConfirmModal.vue';
import Icon from '@/shared/components/Icon.vue';
import TemplatesModal from './TemplatesModal.vue';
import type { DashboardLayout } from '../../types';

const { t } = useI18n();
const dashboardStore = useDashboardStore();

const layouts = computed(() => dashboardStore.layouts);
const activeLayoutId = computed(() => dashboardStore.activeLayoutId);

const menuOpen = ref<string | null>(null);
const editingLayout = ref<DashboardLayout | null>(null);
const deletingLayout = ref<DashboardLayout | null>(null);
const showTemplates = ref(false);

const editForm = ref({
  name: '',
  columns: 12,
  rowHeight: 80,
});

const toggleMenu = (layoutId: string) => {
  menuOpen.value = menuOpen.value === layoutId ? null : layoutId;
};

const selectLayout = async (layoutId: string) => {
  await dashboardStore.setActiveLayout(layoutId);
};

const setAsDefault = async (layoutId: string) => {
  await dashboardStore.setDefaultLayout(layoutId);
  menuOpen.value = null;
};

const createNewLayout = async () => {
  const newLayout = await dashboardStore.addLayout({
    name: t('dashboard.layouts.newLayout'),
    columns: 12,
    rowHeight: 80,
    isDefault: false,
    widgets: [],
  });
  await dashboardStore.setActiveLayout(newLayout.id);
};

const editLayout = (layout: DashboardLayout) => {
  editingLayout.value = layout;
  editForm.value = {
    name: layout.name,
    columns: layout.columns,
    rowHeight: layout.rowHeight,
  };
  menuOpen.value = null;
};

const saveLayoutEdit = async () => {
  if (!editingLayout.value) return;

  await dashboardStore.updateLayout(editingLayout.value.id, editForm.value);
  editingLayout.value = null;
};

const duplicateLayout = async (layout: DashboardLayout) => {
  const newLayout = await dashboardStore.addLayout({
    name: `${layout.name} (${t('dashboard.layouts.copy')})`,
    columns: layout.columns,
    rowHeight: layout.rowHeight,
    isDefault: false,
    widgets: [...layout.widgets],
  });
  await dashboardStore.setActiveLayout(newLayout.id);
  menuOpen.value = null;
};

const confirmDelete = (layout: DashboardLayout) => {
  deletingLayout.value = layout;
  menuOpen.value = null;
};

const deleteLayout = async () => {
  if (!deletingLayout.value) return;

  await dashboardStore.deleteLayout(deletingLayout.value.id);
  deletingLayout.value = null;
};

const createFromTemplate = async (templateId: string, name: string) => {
  const newLayout = await dashboardStore.createLayoutFromTemplate(
    templateId,
    name,
  );
  await dashboardStore.setActiveLayout(newLayout.id);
  showTemplates.value = false;
};

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  const isMenuButton = target.closest('button[data-menu-toggle]');
  const isMenuDropdown = target.closest('[data-menu-dropdown]');

  if (!isMenuButton && !isMenuDropdown) {
    menuOpen.value = null;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

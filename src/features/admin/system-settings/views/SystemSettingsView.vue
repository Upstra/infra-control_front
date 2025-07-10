<template>
  <div class="system-settings-view">
    <div class="header mb-6">
      <h1 class="text-3xl font-bold dark:text-gray-100">
        {{ $t('admin.systemSettings.title') }}
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mt-2">
        {{ $t('admin.systemSettings.description') }}
      </p>
    </div>

    <div
      v-if="error"
      class="error-message bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
    >
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
      <button
        @click="store.clearError()"
        class="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2"
      >
        {{ $t('common.dismiss') }}
      </button>
    </div>

    <div class="actions-bar flex justify-between items-center mb-6">
      <div class="flex gap-2">
        <button
          @click="handleRefresh"
          :disabled="loading"
          class="btn btn-secondary flex items-center gap-2"
        >
          <ArrowPathIcon class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          {{ $t('common.refresh') }}
        </button>
      </div>
      <div class="flex gap-2">
        <button
          @click="showImportExport = true"
          class="btn btn-secondary flex items-center gap-2"
        >
          <ArrowDownTrayIcon class="w-4 h-4" />
          {{ $t('admin.systemSettings.importExport') }}
        </button>
      </div>
    </div>

    <div v-if="loading && !settings" class="loading-state text-center py-12">
      <div class="inline-flex items-center gap-2">
        <ArrowPathIcon
          class="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400"
        />
        <span class="text-gray-600 dark:text-gray-400">{{
          $t('common.loading')
        }}</span>
      </div>
    </div>

    <div v-else-if="settings" class="settings-content">
      <el-tabs v-model="activeTab" class="settings-tabs">
        <el-tab-pane
          :label="$t('admin.systemSettings.tabs.security')"
          name="security"
        >
          <SecuritySettings
            :settings="settings.security"
            @update="handleUpdate('security', $event)"
            @reset="handleReset('security')"
          />
        </el-tab-pane>

        <el-tab-pane
          :label="$t('admin.systemSettings.tabs.system')"
          name="system"
        >
          <SystemSettings
            :settings="settings.system"
            @update="handleUpdate('system', $event)"
            @reset="handleReset('system')"
          />
        </el-tab-pane>

        <el-tab-pane
          :label="$t('admin.systemSettings.tabs.email')"
          name="email"
        >
          <EmailSettings
            :settings="settings.email"
            @update="handleUpdate('email', $event)"
            @reset="handleReset('email')"
            @test="handleTestEmail"
          />
        </el-tab-pane>

        <el-tab-pane
          :label="$t('admin.systemSettings.tabs.backup')"
          name="backup"
        >
          <BackupSettings
            :settings="settings.backup"
            @update="handleUpdate('backup', $event)"
            @reset="handleReset('backup')"
          />
        </el-tab-pane>

        <el-tab-pane
          :label="$t('admin.systemSettings.tabs.logging')"
          name="logging"
        >
          <LoggingSettings
            :settings="settings.logging"
            @update="handleUpdate('logging', $event)"
            @reset="handleReset('logging')"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <ImportExportModal
      v-if="showImportExport"
      @close="showImportExport = false"
      @export="handleExport"
      @import="handleImport"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { storeToRefs } from 'pinia';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useSystemSettingsStore } from '../store';
import { ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/vue/24/outline';
import SecuritySettings from '../components/SecuritySettings.vue';
import SystemSettings from '../components/SystemSettings.vue';
import EmailSettings from '../components/EmailSettings.vue';
import BackupSettings from '../components/BackupSettings.vue';
import LoggingSettings from '../components/LoggingSettings.vue';
import ImportExportModal from '../components/ImportExportModal.vue';
import type { SettingsCategory, ImportSettingsDto } from '../types';

const { t } = useI18n();
const store = useSystemSettingsStore();

const activeTab = ref<SettingsCategory>('security');
const showImportExport = ref(false);

const { settings, loading, error } = storeToRefs(store);

onMounted(async () => {
  await store.fetchSettings();
});

const handleRefresh = async () => {
  await store.fetchSettings(true);
  ElMessage.success(t('admin.systemSettings.messages.refreshed'));
};

const handleUpdate = async (category: SettingsCategory, data: any) => {
  try {
    await store.updateSettings({ [category]: data });
    ElMessage.success(t('admin.systemSettings.messages.saved'));
  } catch (error) {
    ElMessage.error(t('admin.systemSettings.messages.saveFailed'));
  }
};

const handleReset = async (category: SettingsCategory) => {
  try {
    await ElMessageBox.confirm(
      t('admin.systemSettings.messages.resetConfirm', { category }),
      t('common.confirm'),
      {
        type: 'warning',
        confirmButtonText: t('common.reset'),
        cancelButtonText: t('common.cancel'),
      },
    );

    await store.resetCategory(category);
    ElMessage.success(t('admin.systemSettings.messages.resetSuccess'));
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(t('admin.systemSettings.messages.resetFailed'));
    }
  }
};

const handleTestEmail = async (to: string) => {
  try {
    await store.testEmail(to);
    ElMessage.success(t('admin.systemSettings.messages.emailTestSent'));
  } catch (error) {
    ElMessage.error(t('admin.systemSettings.messages.emailTestFailed'));
  }
};

const handleExport = async () => {
  try {
    const data = await store.exportSettings();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    ElMessage.success(t('admin.systemSettings.messages.exportSuccess'));
  } catch (error) {
    ElMessage.error(t('admin.systemSettings.messages.exportFailed'));
  }
};

const handleImport = async (data: ImportSettingsDto) => {
  try {
    await store.importSettings(data);
    ElMessage.success(t('admin.systemSettings.messages.importSuccess'));
    showImportExport.value = false;
  } catch (error) {
    ElMessage.error(t('admin.systemSettings.messages.importFailed'));
  }
};

const beforeUnload = (e: BeforeUnloadEvent) => {
  if (store.unsavedChanges) {
    e.preventDefault();
    e.returnValue = '';
  }
};

onMounted(() => {
  window.addEventListener('beforeunload', beforeUnload);
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', beforeUnload);
});
</script>

<style scoped>
.system-settings-view {
  @apply max-w-7xl mx-auto p-6;
}

.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700;
}

.settings-tabs :deep(.el-tabs__header) {
  @apply border-b dark:border-gray-700;
}

.settings-tabs :deep(.el-tabs__item) {
  @apply dark:text-gray-400;
}

.settings-tabs :deep(.el-tabs__item.is-active) {
  @apply dark:text-blue-400;
}
</style>

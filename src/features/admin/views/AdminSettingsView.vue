<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { storeToRefs } from 'pinia';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';
import { useSystemSettingsStore } from '../system-settings/store';
import {
  Shield,
  Server,
  Mail,
  Database,
  FileText,
  UserPlus,
  Lock,
  AlertTriangle,
  HardDrive,
  MailCheck,
  Activity,
  Clock,
  Users,
  FileType,
  Zap,
  Wifi,
  Download,
  RefreshCw,
} from 'lucide-vue-next';
import ImportExportModal from '../system-settings/components/ImportExportModal.vue';
import type {
  SettingsCategory,
  ImportSettingsDto,
} from '../system-settings/types';

const toast = useToast();
const { t } = useI18n();
const store = useSystemSettingsStore();

const { settings, loading, error } = storeToRefs(store);
const showImportExport = ref(false);

const settingsSections: Array<{
  id: SettingsCategory;
  icon: any;
  title: string;
  description: string;
}> = [
  {
    id: 'security',
    icon: Shield,
    title: 'admin.settings.security.title',
    description: 'admin.settings.security.description',
  },
  {
    id: 'system',
    icon: Server,
    title: 'admin.settings.system.title',
    description: 'admin.settings.system.description',
  },
  {
    id: 'email',
    icon: Mail,
    title: 'admin.settings.email.title',
    description: 'admin.settings.email.description',
  },
  {
    id: 'backup',
    icon: Database,
    title: 'admin.settings.backup.title',
    description: 'admin.settings.backup.description',
  },
  {
    id: 'logging',
    icon: FileText,
    title: 'admin.settings.logging.title',
    description: 'admin.settings.logging.description',
  },
];

const activeSection = ref<SettingsCategory>('security');

const localSettings = computed(() => {
  if (!settings.value) return null;
  return {
    security: { ...settings.value.security },
    system: { ...settings.value.system },
    email: { ...settings.value.email },
    backup: { ...settings.value.backup },
    logging: { ...settings.value.logging },
  };
});

onMounted(async () => {
  await store.fetchSettings();
});

const saveSettings = async () => {
  if (!localSettings.value) return;

  try {
    await store.updateSettings({
      [activeSection.value]: localSettings.value[activeSection.value],
    });
    toast.success(t('admin.settings.saved'));
  } catch (error) {
    toast.error(t('admin.settings.save_error'));
  }
};

const resetSection = async () => {
  try {
    await store.resetCategory(activeSection.value);
    toast.success(t('admin.settings.reset_success'));
  } catch (error) {
    toast.error(t('admin.settings.reset_error'));
  }
};

const refreshSettings = async () => {
  await store.fetchSettings(true);
  toast.success(t('admin.settings.refreshed'));
};

const testSmtpConnection = async () => {
  if (!localSettings.value?.email.smtp.user) {
    toast.error(t('admin.settings.email.configure_first'));
    return;
  }

  try {
    const testEmail =
      localSettings.value.email.from.address ||
      localSettings.value.email.smtp.user;
    await store.testEmail(testEmail);
    toast.success(t('admin.settings.email.test_success'));
  } catch (error) {
    toast.error(t('admin.settings.email.test_error'));
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
    showImportExport.value = false;
    toast.success(t('admin.settings.export_success'));
  } catch (error) {
    toast.error(t('admin.settings.export_error'));
  }
};

const handleImport = async (data: ImportSettingsDto) => {
  try {
    await store.importSettings(data);
    showImportExport.value = false;
    toast.success(t('admin.settings.import_success'));
  } catch (error) {
    toast.error(t('admin.settings.import_error'));
  }
};
</script>

<template>
  <div class="admin-settings-view">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t('admin.settings.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">
          {{ $t('admin.settings.description') }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          @click="refreshSettings"
          :disabled="loading"
          class="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
        >
          <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
          {{ $t('common.refresh') }}
        </button>
        <button
          @click="showImportExport = true"
          class="px-4 py-2 flex items-center gap-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-700 hover:bg-gray-200 dark:hover:bg-neutral-600 rounded-lg transition-colors"
        >
          <Download class="w-4 h-4" />
          {{ $t('admin.settings.import_export') }}
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
    >
      <p class="text-red-600 dark:text-red-400">{{ error }}</p>
    </div>

    <div
      v-if="loading && !settings"
      class="flex justify-center items-center py-12"
    >
      <RefreshCw
        class="w-6 h-6 animate-spin text-gray-600 dark:text-gray-400"
      />
      <span class="ml-2 text-gray-600 dark:text-gray-400">{{
        $t('common.loading')
      }}</span>
    </div>

    <div
      v-else-if="localSettings"
      class="grid grid-cols-1 lg:grid-cols-4 gap-8"
    >
      <nav class="lg:col-span-1">
        <ul class="space-y-1">
          <li v-for="section in settingsSections" :key="section.id">
            <button
              @click="activeSection = section.id"
              :class="[
                'w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                activeSection === section.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800',
              ]"
            >
              <component
                :is="section.icon"
                class="mr-3 h-5 w-5 flex-shrink-0"
              />
              <div class="text-left">
                <p class="font-medium">{{ $t(section.title) }}</p>
                <p
                  v-if="activeSection !== section.id"
                  class="text-xs opacity-70 mt-0.5"
                >
                  {{ $t(section.description) }}
                </p>
              </div>
            </button>
          </li>
        </ul>
      </nav>

      <div class="lg:col-span-3">
        <transition name="fade-slide" mode="out-in">
          <div
            class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
          >
            <div v-if="activeSection === 'security'" key="security">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Shield class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('admin.settings.security.title') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.settings.security.description') }}
                </p>
              </div>

              <div class="space-y-6">
                <div class="space-y-4">
                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <UserPlus class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{
                            $t('admin.settings.security.registration_enabled')
                          }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{
                            $t(
                              'admin.settings.security.registration_enabled_desc',
                            )
                          }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      v-model="localSettings.security.registrationEnabled"
                    />
                  </label>

                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <MailCheck class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('admin.settings.security.email_verification') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{
                            $t(
                              'admin.settings.security.email_verification_desc',
                            )
                          }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      v-model="localSettings.security.requireEmailVerification"
                    />
                  </label>

                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Users class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('admin.settings.security.guest_access') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('admin.settings.security.guest_access_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      v-model="localSettings.security.allowGuestAccess"
                    />
                  </label>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <h3
                    class="text-sm font-medium text-gray-900 dark:text-white mb-4"
                  >
                    {{ $t('admin.settings.security.password_policy') }}
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('admin.settings.security.min_length') }}
                      </label>
                      <input
                        v-model.number="
                          localSettings.security.passwordPolicy.minLength
                        "
                        type="number"
                        min="6"
                        max="32"
                        class="w-32 px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="
                            localSettings.security.passwordPolicy
                              .requireUppercase
                          "
                          class="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span
                          class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {{ $t('admin.settings.security.require_uppercase') }}
                        </span>
                      </label>
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="
                            localSettings.security.passwordPolicy
                              .requireLowercase
                          "
                          class="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span
                          class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {{ $t('admin.settings.security.require_lowercase') }}
                        </span>
                      </label>
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="
                            localSettings.security.passwordPolicy.requireNumbers
                          "
                          class="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span
                          class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {{ $t('admin.settings.security.require_numbers') }}
                        </span>
                      </label>
                      <label class="flex items-center">
                        <input
                          type="checkbox"
                          v-model="
                            localSettings.security.passwordPolicy
                              .requireSpecialChars
                          "
                          class="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <span
                          class="ml-2 text-sm text-gray-700 dark:text-gray-300"
                        >
                          {{ $t('admin.settings.security.require_special') }}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <div class="flex items-center mb-2">
                          <Clock class="h-4 w-4 text-gray-400 mr-2" />
                          {{ $t('admin.settings.security.session_timeout') }}
                        </div>
                      </label>
                      <select
                        v-model.number="localSettings.security.sessionTimeout"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option :value="1800">
                          30 {{ $t('common.minutes') }}
                        </option>
                        <option :value="3600">1 {{ $t('common.hour') }}</option>
                        <option :value="7200">
                          2 {{ $t('common.hours') }}
                        </option>
                        <option :value="14400">
                          4 {{ $t('common.hours') }}
                        </option>
                        <option :value="28800">
                          8 {{ $t('common.hours') }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <div class="flex items-center mb-2">
                          <Lock class="h-4 w-4 text-gray-400 mr-2" />
                          {{ $t('admin.settings.security.max_login_attempts') }}
                        </div>
                      </label>
                      <input
                        v-model.number="localSettings.security.maxLoginAttempts"
                        type="number"
                        min="3"
                        max="10"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'system'" key="system">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Server class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('admin.settings.system.title') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.settings.system.description') }}
                </p>
              </div>

              <div class="space-y-6">
                <label class="flex items-center justify-between">
                  <div class="flex items-center">
                    <AlertTriangle class="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ $t('admin.settings.system.maintenance_mode') }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ $t('admin.settings.system.maintenance_mode_desc') }}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch
                    v-model="localSettings.system.maintenanceMode"
                  />
                </label>

                <div
                  v-if="localSettings.system.maintenanceMode"
                  class="pl-8 border-l-2 border-gray-200 dark:border-neutral-700 ml-2"
                >
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {{ $t('admin.settings.system.maintenance_message') }}
                  </label>
                  <textarea
                    v-model="localSettings.system.maintenanceMessage"
                    rows="3"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    :placeholder="
                      $t(
                        'admin.settings.system.maintenance_message_placeholder',
                      )
                    "
                  />
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <h3
                    class="text-sm font-medium text-gray-900 dark:text-white mb-4"
                  >
                    {{ $t('admin.settings.system.file_upload') }}
                  </h3>
                  <div class="space-y-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <div class="flex items-center mb-2">
                          <HardDrive class="h-4 w-4 text-gray-400 mr-2" />
                          {{ $t('admin.settings.system.max_upload_size') }}
                        </div>
                      </label>
                      <div class="flex items-center space-x-2">
                        <input
                          v-model.number="localSettings.system.maxUploadSize"
                          type="number"
                          min="1"
                          max="100"
                          class="w-24 px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <span class="text-sm text-gray-500 dark:text-gray-400"
                          >MB</span
                        >
                      </div>
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        <div class="flex items-center mb-2">
                          <FileType class="h-4 w-4 text-gray-400 mr-2" />
                          {{ $t('admin.settings.system.allowed_file_types') }}
                        </div>
                      </label>
                      <input
                        :value="
                          localSettings.system.allowedFileTypes.join(', ')
                        "
                        @input="
                          localSettings.system.allowedFileTypes = (
                            $event.target as HTMLInputElement
                          ).value
                            .split(',')
                            .map((s) => s.trim())
                        "
                        type="text"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="jpg, png, pdf, docx"
                      />
                    </div>
                  </div>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6 space-y-4">
                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Zap class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('admin.settings.system.api_access') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('admin.settings.system.api_access_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch v-model="localSettings.system.api.enabled" />
                  </label>

                  <div
                    v-if="localSettings.system.api.enabled"
                    class="pl-8 border-l-2 border-gray-200 dark:border-neutral-700 ml-2"
                  >
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ $t('admin.settings.system.api_rate_limit') }}
                    </label>
                    <div class="flex items-center space-x-2">
                      <input
                        v-model.number="localSettings.system.api.rateLimit"
                        type="number"
                        min="10"
                        max="1000"
                        class="w-24 px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{
                        $t('admin.settings.system.requests_per_minute')
                      }}</span>
                    </div>
                  </div>

                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Wifi class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('admin.settings.system.websockets') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('admin.settings.system.websockets_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      v-model="localSettings.system.enableWebSockets"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'email'" key="email">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Mail class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('admin.settings.email.title') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.settings.email.description') }}
                </p>
              </div>

              <div class="space-y-6">
                <label class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Mail class="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ $t('admin.settings.email.enable_notifications') }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{
                          $t('admin.settings.email.enable_notifications_desc')
                        }}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch v-model="localSettings.email.enabled" />
                </label>

                <div
                  v-if="localSettings.email.enabled"
                  class="space-y-4 border-t dark:border-neutral-700 pt-6"
                >
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('admin.settings.email.smtp_host') }}
                      </label>
                      <input
                        v-model="localSettings.email.smtp.host"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="smtp.gmail.com"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('admin.settings.email.smtp_port') }}
                      </label>
                      <input
                        v-model.number="localSettings.email.smtp.port"
                        type="number"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="587"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('admin.settings.email.smtp_user') }}
                      </label>
                      <input
                        v-model="localSettings.email.smtp.user"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="user@example.com"
                      />
                    </div>

                    <div>
                      <label
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        {{ $t('admin.settings.email.from_address') }}
                      </label>
                      <input
                        v-model="localSettings.email.from.address"
                        type="email"
                        class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="noreply@example.com"
                      />
                    </div>
                  </div>

                  <label class="flex items-center">
                    <input
                      type="checkbox"
                      v-model="localSettings.email.smtp.secure"
                      class="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      {{ $t('admin.settings.email.use_tls') }}
                    </span>
                  </label>

                  <div class="pt-4">
                    <button
                      @click="testSmtpConnection"
                      class="px-4 py-2 bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 transition-colors font-medium text-sm"
                    >
                      {{ $t('admin.settings.email.test_connection') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'backup'" key="backup">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Database class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('admin.settings.backup.title') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.settings.backup.description') }}
                </p>
              </div>

              <div class="space-y-6">
                <label class="flex items-center justify-between">
                  <div class="flex items-center">
                    <Database class="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ $t('admin.settings.backup.enable_automatic') }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ $t('admin.settings.backup.enable_automatic_desc') }}
                      </p>
                    </div>
                  </div>
                  <ToggleSwitch v-model="localSettings.backup.enabled" />
                </label>

                <div
                  v-if="localSettings.backup.enabled"
                  class="space-y-4 border-t dark:border-neutral-700 pt-6"
                >
                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ $t('admin.settings.backup.interval') }}
                    </label>
                    <select
                      v-model.number="localSettings.backup.schedule.interval"
                      class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option :value="1">
                        {{ $t('admin.settings.backup.hourly') }}
                      </option>
                      <option :value="6">
                        {{ $t('admin.settings.backup.every_6_hours') }}
                      </option>
                      <option :value="12">
                        {{ $t('admin.settings.backup.every_12_hours') }}
                      </option>
                      <option :value="24">
                        {{ $t('admin.settings.backup.daily') }}
                      </option>
                      <option :value="168">
                        {{ $t('admin.settings.backup.weekly') }}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ $t('admin.settings.backup.retention') }}
                    </label>
                    <div class="flex items-center space-x-2">
                      <input
                        v-model.number="localSettings.backup.schedule.retention"
                        type="number"
                        min="1"
                        max="365"
                        class="w-24 px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{
                        $t('common.days')
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="activeSection === 'logging'" key="logging">
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <FileText class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('admin.settings.logging.title') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('admin.settings.logging.description') }}
                </p>
              </div>

              <div class="space-y-6">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {{ $t('admin.settings.logging.level') }}
                  </label>
                  <select
                    v-model="localSettings.logging.level"
                    class="w-full px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="debug">Debug</option>
                    <option value="info">Info</option>
                    <option value="warn">Warning</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    {{ $t('admin.settings.logging.retention') }}
                  </label>
                  <div class="flex items-center space-x-2">
                    <input
                      v-model.number="localSettings.logging.retention"
                      type="number"
                      min="1"
                      max="90"
                      class="w-24 px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    <span class="text-sm text-gray-500 dark:text-gray-400">{{
                      $t('common.days')
                    }}</span>
                  </div>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Activity class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('admin.settings.logging.enable_metrics') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('admin.settings.logging.enable_metrics_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch
                      v-model="localSettings.logging.metrics.enabled"
                    />
                  </label>

                  <div
                    v-if="localSettings.logging.metrics.enabled"
                    class="mt-4 pl-8 border-l-2 border-gray-200 dark:border-neutral-700 ml-2"
                  >
                    <label
                      class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      {{ $t('admin.settings.logging.metrics_retention') }}
                    </label>
                    <div class="flex items-center space-x-2">
                      <input
                        v-model.number="localSettings.logging.metrics.retention"
                        type="number"
                        min="1"
                        max="365"
                        class="w-24 px-3 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                      <span class="text-sm text-gray-500 dark:text-gray-400">{{
                        $t('common.days')
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>

        <div class="mt-6 flex justify-between">
          <button
            @click="resetSection"
            class="px-6 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors font-medium text-sm"
          >
            {{ $t('common.reset') }}
          </button>
          <button
            @click="saveSettings"
            :disabled="loading"
            class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ $t('common.save') }}
          </button>
        </div>
      </div>
    </div>

    <ImportExportModal
      v-if="showImportExport"
      @close="showImportExport = false"
      @export="handleExport"
      @import="handleImport"
    />
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.25s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>

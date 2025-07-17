<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import router from '@/router';
import { useToast } from 'vue-toast-notification';
import { useLocaleStore } from '@/store/locale';
import { useThemeStore } from '@/store/theme';
import { useI18n } from 'vue-i18n';
import { useUserPreferencesStore } from '../store';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
import SettingsLayout from '@/shared/components/SettingsLayout.vue';
import {
  Globe,
  Bell,
  Shield,
  Palette,
  Clock,
  Mail,
  Link,
  Monitor,
  Moon,
  Sun,
  Languages,
  BellRing,
  ShieldCheck,
  Webhook,
  RefreshCw,
  Layout,
  Server,
  Zap,
} from 'lucide-vue-next';

const auth = useAuthStore();
const toast = useToast();
const user = auth.currentUser;
const preferencesStore = useUserPreferencesStore();

const localeStore = useLocaleStore();
const themeStore = useThemeStore();
const { locale, t } = useI18n();

const language = computed({
  get: () => preferencesStore.locale,
  set: (val) => preferencesStore.updateSinglePreference('locale', val),
});

const theme = computed({
  get: () => preferencesStore.theme,
  set: (val) => preferencesStore.updateSinglePreference('theme', val),
});

const serverNotifications = computed({
  get: () => preferencesStore.notifications.server,
  set: (val) =>
    preferencesStore.updateNestedPreference('notifications', 'server', val),
});

const upsNotifications = computed({
  get: () => preferencesStore.notifications.ups,
  set: (val) =>
    preferencesStore.updateNestedPreference('notifications', 'ups', val),
});

const emailNotifications = computed({
  get: () => preferencesStore.notifications.email,
  set: (val) =>
    preferencesStore.updateNestedPreference('notifications', 'email', val),
});

const pushNotifications = computed({
  get: () => preferencesStore.notifications.push,
  set: (val) =>
    preferencesStore.updateNestedPreference('notifications', 'push', val),
});

const defaultUserView = computed({
  get: () => preferencesStore.display.defaultUserView,
  set: (val) =>
    preferencesStore.updateNestedPreference('display', 'defaultUserView', val),
});

const defaultServerView = computed({
  get: () => preferencesStore.display.defaultServerView,
  set: (val) =>
    preferencesStore.updateNestedPreference(
      'display',
      'defaultServerView',
      val,
    ),
});

const defaultUpsView = computed({
  get: () => preferencesStore.display.defaultUpsView,
  set: (val) =>
    preferencesStore.updateNestedPreference('display', 'defaultUpsView', val),
});

const defaultRoomView = computed({
  get: () => preferencesStore.display.defaultRoomView,
  set: (val) =>
    preferencesStore.updateNestedPreference('display', 'defaultRoomView', val),
});

const defaultGroupView = computed({
  get: () => preferencesStore.display.defaultGroupView,
  set: (val) =>
    preferencesStore.updateNestedPreference('display', 'defaultGroupView', val),
});

const compactMode = computed({
  get: () => preferencesStore.display.compactMode,
  set: (val) =>
    preferencesStore.updateNestedPreference('display', 'compactMode', val),
});

const slackWebhook = computed({
  get: () => preferencesStore.integrations.slackWebhook || '',
  set: (val) =>
    preferencesStore.updateNestedPreference(
      'integrations',
      'slackWebhook',
      val || undefined,
    ),
});

const alertEmail = computed({
  get: () => preferencesStore.integrations.alertEmail || '',
  set: (val) =>
    preferencesStore.updateNestedPreference(
      'integrations',
      'alertEmail',
      val || undefined,
    ),
});

const discordWebhook = computed({
  get: () => preferencesStore.integrations.discordWebhook || '',
  set: (val) =>
    preferencesStore.updateNestedPreference(
      'integrations',
      'discordWebhook',
      val || undefined,
    ),
});

const teamsWebhook = computed({
  get: () => preferencesStore.integrations.teamsWebhook || '',
  set: (val) =>
    preferencesStore.updateNestedPreference(
      'integrations',
      'teamsWebhook',
      val || undefined,
    ),
});

const refreshInterval = computed({
  get: () => preferencesStore.performance.refreshInterval,
  set: (val) =>
    preferencesStore.updateNestedPreference(
      'performance',
      'refreshInterval',
      val,
    ),
});

const autoRefresh = computed({
  get: () => preferencesStore.performance.autoRefresh,
  set: (val) =>
    preferencesStore.updateNestedPreference('performance', 'autoRefresh', val),
});

watch(language, (val) => {
  localeStore.setLocale(val);
  locale.value = val;
});

watch(theme, (val) => {
  themeStore.setTheme(val);
});

const toggle2fa = async () => {
  if (user?.isTwoFactorEnabled) {
    const disabled = await auth.disable2FAUser();
    if (disabled) toast.success(t('toast.twofa_disabled'));
  } else {
    router.push({ name: 'Enable2FA' });
  }
};

const settingSections = [
  {
    id: 'preferences',
    icon: Palette,
    title: 'settings.personal',
    description: 'settings_extra.personal_desc',
  },
  {
    id: 'notifications',
    icon: Bell,
    title: 'settings.notifications',
    description: 'settings_extra.notifications_desc',
  },
  {
    id: 'security',
    icon: Shield,
    title: 'settings_extra.security',
    description: 'settings_extra.security_desc',
  },
  {
    id: 'display',
    icon: Layout,
    title: 'settings_extra.default_views',
    description: 'settings_extra.display_desc',
  },
  {
    id: 'performance',
    icon: RefreshCw,
    title: 'settings_extra.refresh',
    description: 'settings_extra.performance_desc',
  },
];

const layoutRef = ref();

onMounted(async () => {
  layoutRef.value?.initializeSection(settingSections);

  if (!preferencesStore.isLoaded) {
    await preferencesStore.fetchPreferences();
  }
});
</script>

<template>
  <SettingsLayout
    ref="layoutRef"
    :sections="settingSections"
    :title="t('settings.title')"
    :subtitle="t('settings_extra.subtitle')"
  >
    <template #default="{ activeSection }">
      <div v-if="activeSection === 'preferences'" key="preferences">
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
          >
            <Palette class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings.personal') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('settings_extra.personal_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <Languages class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('settings.language') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('settings_extra.language_desc') }}
                  </p>
                </div>
              </div>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="lang in ['fr', 'en']"
                :key="lang"
                @click="language = lang as 'fr' | 'en'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  language === lang
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                {{ t(`settings_extra.${lang}`) }}
              </button>
            </div>
          </div>

          <div class="border-t dark:border-neutral-700 pt-6">
            <label class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <component
                  :is="theme === 'dark' ? Moon : Sun"
                  class="h-5 w-5 text-gray-400 mr-3"
                />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('settings.theme') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('settings_extra.theme_desc') }}
                  </p>
                </div>
              </div>
            </label>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="themeOption in ['light', 'dark']"
                :key="themeOption"
                @click="theme = themeOption as 'light' | 'dark'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center',
                  theme === themeOption
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                <component
                  :is="themeOption === 'dark' ? Moon : Sun"
                  class="h-4 w-4 mr-2"
                />
                {{ t(`settings_extra.${themeOption}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'notifications'" key="notifications">
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
          >
            <Bell class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings.notifications') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('settings_extra.notifications_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div class="space-y-4">
            <label class="flex items-center justify-between">
              <div class="flex items-center">
                <Server class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('settings.server_alert') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('settings_extra.server_alert_desc') }}
                  </p>
                </div>
              </div>
              <ToggleSwitch v-model="serverNotifications" />
            </label>

            <label class="flex items-center justify-between">
              <div class="flex items-center">
                <Zap class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('settings.ups_alert') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('settings_extra.ups_alert_desc') }}
                  </p>
                </div>
              </div>
              <ToggleSwitch v-model="upsNotifications" />
            </label>

            <label class="flex items-center justify-between">
              <div class="flex items-center">
                <Mail class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('settings_extra.email_notifications') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('settings_extra.email_notifications_desc') }}
                  </p>
                </div>
              </div>
              <ToggleSwitch v-model="emailNotifications" />
            </label>

            <label class="flex items-center justify-between">
              <div class="flex items-center">
                <BellRing class="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ t('settings_extra.push_notifications') }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ t('settings_extra.push_notifications_desc') }}
                  </p>
                </div>
              </div>
              <ToggleSwitch v-model="pushNotifications" />
            </label>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'security'" key="security">
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
          >
            <Shield class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings_extra.security') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('settings_extra.security_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700/50 rounded-lg"
          >
            <div class="flex items-center">
              <ShieldCheck class="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ t('settings_extra.two_factor') }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{
                    user?.isTwoFactorEnabled
                      ? t('settings_extra.two_factor_enabled')
                      : t('settings_extra.two_factor_disabled')
                  }}
                </p>
              </div>
            </div>
            <button
              @click="toggle2fa"
              :class="[
                'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                user?.isTwoFactorEnabled
                  ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50'
                  : 'bg-primary text-white hover:bg-primary-dark',
              ]"
            >
              {{
                user?.isTwoFactorEnabled
                  ? t('profile.disable')
                  : t('profile.enable')
              }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'display'" key="display">
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
          >
            <Layout class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings_extra.default_views') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('settings_extra.display_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {{ t('settings_extra.user_list') }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="view in ['table', 'card']"
                :key="view"
                @click="defaultUserView = view as 'table' | 'card'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  defaultUserView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>

          <div class="border-t dark:border-neutral-700 pt-6">
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {{ t('settings_extra.server_list') }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="view in ['grid', 'list']"
                :key="view"
                @click="defaultServerView = view as 'grid' | 'list'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  defaultServerView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>

          <div class="border-t dark:border-neutral-700 pt-6">
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {{ t('settings_extra.ups_list') }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="view in ['grid', 'list']"
                :key="view"
                @click="defaultUpsView = view as 'grid' | 'list'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  defaultUpsView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>

          <div class="border-t dark:border-neutral-700 pt-6">
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {{ t('settings_extra.room_list') }}
            </p>
            <div class="grid grid-cols-2 gap-3">
              <button
                v-for="view in ['grid', 'list']"
                :key="view"
                @click="defaultRoomView = view as 'grid' | 'list'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  defaultRoomView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>

          <div class="border-t dark:border-neutral-700 pt-6">
            <p class="text-sm font-medium text-gray-900 dark:text-white mb-3">
              {{ t('settings_extra.group_list') }}
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                v-for="view in ['grid', 'list', 'sections']"
                :key="view"
                @click="defaultGroupView = view as 'grid' | 'list' | 'sections'"
                :class="[
                  'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                  defaultGroupView === view
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-gray-100 dark:bg-neutral-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-600',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeSection === 'performance'" key="performance">
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
          >
            <RefreshCw class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings_extra.refresh') }}
          </h2>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {{ t('settings_extra.performance_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <label class="flex items-center justify-between">
            <div class="flex items-center">
              <RefreshCw class="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ t('settings_extra.auto_refresh') }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ t('settings_extra.auto_refresh_desc') }}
                </p>
              </div>
            </div>
            <ToggleSwitch v-model="autoRefresh" />
          </label>

          <div
            v-if="autoRefresh"
            class="pl-8 border-l-2 border-gray-200 dark:border-neutral-700 ml-2"
          >
            <label
              class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
            >
              <div class="flex items-center mb-2">
                <Clock class="h-4 w-4 text-gray-400 mr-2" />
                {{ t('settings_extra.check_interval') }}
              </div>
            </label>
            <div class="flex items-center space-x-3">
              <input
                type="range"
                min="15"
                max="300"
                step="15"
                v-model.number="refreshInterval"
                class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-neutral-700"
              />
              <div
                class="w-20 text-center px-3 py-1 bg-gray-100 dark:bg-neutral-700 rounded-lg"
              >
                <span class="text-sm font-medium text-gray-900 dark:text-white">
                  {{ refreshInterval }}s
                </span>
              </div>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
              {{ t('settings_extra.interval_help') }}
            </p>
          </div>
        </div>
      </div>
    </template>
  </SettingsLayout>
</template>

<style scoped>
input[type='range']::-webkit-slider-thumb {
  appearance: none;
  width: 16px;
  height: 16px;
  background: theme('colors.primary.DEFAULT');
  cursor: pointer;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

input[type='range']::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: theme('colors.primary.DEFAULT');
  cursor: pointer;
  border-radius: 50%;
  border: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}
</style>

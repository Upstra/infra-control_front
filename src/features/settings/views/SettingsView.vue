<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import router from '@/router';
import { useToast } from 'vue-toast-notification';
import { useLocaleStore } from '@/store/locale';
import { useThemeStore } from '@/store/theme';
import { useI18n } from 'vue-i18n';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
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

const localeStore = useLocaleStore();
const themeStore = useThemeStore();
const { locale, t } = useI18n();
const language = ref(localeStore.currentLocale);
const theme = ref(themeStore.theme);
const timeZone = ref('UTC');

const serverNotifications = ref(true);
const upsNotifications = ref(true);
const emailNotifications = ref(false);
const pushNotifications = ref(true);

const defaultUserView = ref<'table' | 'card'>('table');
const defaultServerView = ref<'grid' | 'list'>('grid');
const compactMode = ref(false);

const slackWebhook = ref('');
const alertEmail = ref('');
const discordWebhook = ref('');
const teamsWebhook = ref('');

const refreshInterval = ref(60);
const autoRefresh = ref(true);

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
    id: 'integrations',
    icon: Link,
    title: 'settings_extra.integrations',
    description: 'settings_extra.integrations_desc',
  },
  {
    id: 'performance',
    icon: RefreshCw,
    title: 'settings_extra.refresh',
    description: 'settings_extra.performance_desc',
  },
];

const activeSection = ref('preferences');
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-neutral-900">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="mb-8">
        <h1
          class="text-3xl font-bold text-gray-900 dark:text-white tracking-tight"
        >
          {{ $t('settings.title') }}
        </h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {{ $t('settings_extra.subtitle') }}
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <nav class="lg:col-span-1">
          <ul class="space-y-1">
            <li v-for="section in settingSections" :key="section.id">
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
              v-if="activeSection === 'preferences'"
              key="preferences"
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Palette class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('settings.personal') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('settings_extra.personal_desc') }}
                </p>
              </div>

              <div class="space-y-6">
                <div>
                  <label class="flex items-center justify-between mb-3">
                    <div class="flex items-center">
                      <Languages class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings.language') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.language_desc') }}
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
                      {{ $t(`settings_extra.${lang}`) }}
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
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings.theme') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.theme_desc') }}
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
                      {{ $t(`settings_extra.${themeOption}`) }}
                    </button>
                  </div>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Globe class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings.timezone') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.timezone_desc') }}
                        </p>
                      </div>
                    </div>
                    <select
                      v-model="timeZone"
                      class="ml-3 px-3 py-1.5 text-sm border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="UTC">UTC</option>
                      <option value="Europe/Paris">Paris</option>
                      <option value="America/New_York">New York</option>
                      <option value="Asia/Tokyo">Tokyo</option>
                    </select>
                  </label>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeSection === 'notifications'"
              key="notifications"
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Bell class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('settings.notifications') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('settings_extra.notifications_desc') }}
                </p>
              </div>

              <div class="space-y-6">
                <div class="space-y-4">
                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Server class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings.server_alert') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.server_alert_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch v-model="serverNotifications" />
                  </label>

                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Zap class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings.ups_alert') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.ups_alert_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch v-model="upsNotifications" />
                  </label>

                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Mail class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings_extra.email_notifications') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.email_notifications_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch v-model="emailNotifications" />
                  </label>

                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <BellRing class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings_extra.push_notifications') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.push_notifications_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch v-model="pushNotifications" />
                  </label>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeSection === 'security'"
              key="security"
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Shield class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('settings_extra.security') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('settings_extra.security_desc') }}
                </p>
              </div>

              <div class="space-y-6">
                <div
                  class="flex items-center justify-between p-4 bg-gray-50 dark:bg-neutral-700/50 rounded-lg"
                >
                  <div class="flex items-center">
                    <ShieldCheck class="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ $t('settings_extra.two_factor') }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{
                          user?.isTwoFactorEnabled
                            ? $t('settings_extra.two_factor_enabled')
                            : $t('settings_extra.two_factor_disabled')
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
                        ? $t('profile.disable')
                        : $t('profile.enable')
                    }}
                  </button>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeSection === 'display'"
              key="display"
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Layout class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('settings_extra.default_views') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('settings_extra.display_desc') }}
                </p>
              </div>

              <div class="space-y-6">
                <div>
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-white mb-3"
                  >
                    {{ $t('settings_extra.user_list') }}
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
                      {{ $t(`settings_extra.${view}`) }}
                    </button>
                  </div>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <p
                    class="text-sm font-medium text-gray-900 dark:text-white mb-3"
                  >
                    {{ $t('settings_extra.server_list') }}
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
                      {{ $t(`settings_extra.${view}`) }}
                    </button>
                  </div>
                </div>

                <div class="border-t dark:border-neutral-700 pt-6">
                  <label class="flex items-center justify-between">
                    <div class="flex items-center">
                      <Monitor class="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <p
                          class="text-sm font-medium text-gray-900 dark:text-white"
                        >
                          {{ $t('settings_extra.compact_mode') }}
                        </p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">
                          {{ $t('settings_extra.compact_mode_desc') }}
                        </p>
                      </div>
                    </div>
                    <ToggleSwitch v-model="compactMode" />
                  </label>
                </div>
              </div>
            </div>

            <div
              v-else-if="activeSection === 'integrations'"
              key="integrations"
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <Link class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('settings_extra.integrations') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('settings_extra.integrations_desc') }}
                </p>
              </div>

              <div class="space-y-6">
                <div>
                  <label
                    class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    <div class="flex items-center mb-2">
                      <Webhook class="h-4 w-4 text-gray-400 mr-2" />
                      {{ $t('settings_extra.webhook') }}
                    </div>
                  </label>
                  <input
                    v-model="slackWebhook"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://hooks.slack.com/..."
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    <div class="flex items-center mb-2">
                      <Mail class="h-4 w-4 text-gray-400 mr-2" />
                      {{ $t('settings_extra.alert_email') }}
                    </div>
                  </label>
                  <input
                    v-model="alertEmail"
                    type="email"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="admin@example.com"
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    <div class="flex items-center mb-2">
                      <Webhook class="h-4 w-4 text-gray-400 mr-2" />
                      {{ $t('settings_extra.discord_webhook') }}
                    </div>
                  </label>
                  <input
                    v-model="discordWebhook"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://discord.com/api/webhooks/..."
                  />
                </div>

                <div>
                  <label
                    class="block text-sm font-medium text-gray-900 dark:text-white mb-2"
                  >
                    <div class="flex items-center mb-2">
                      <Webhook class="h-4 w-4 text-gray-400 mr-2" />
                      {{ $t('settings_extra.teams_webhook') }}
                    </div>
                  </label>
                  <input
                    v-model="teamsWebhook"
                    type="text"
                    class="w-full px-4 py-2 border border-gray-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://outlook.office.com/webhook/..."
                  />
                </div>
              </div>
            </div>

            <div
              v-else-if="activeSection === 'performance'"
              key="performance"
              class="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-gray-200 dark:border-neutral-700 p-6"
            >
              <div class="mb-6">
                <h2
                  class="text-xl font-semibold text-gray-900 dark:text-white flex items-center"
                >
                  <RefreshCw class="mr-2 h-5 w-5 text-primary" />
                  {{ $t('settings_extra.refresh') }}
                </h2>
                <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {{ $t('settings_extra.performance_desc') }}
                </p>
              </div>

              <div class="space-y-6">
                <label class="flex items-center justify-between">
                  <div class="flex items-center">
                    <RefreshCw class="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ $t('settings_extra.auto_refresh') }}
                      </p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ $t('settings_extra.auto_refresh_desc') }}
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
                      {{ $t('settings_extra.check_interval') }}
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
                      <span
                        class="text-sm font-medium text-gray-900 dark:text-white"
                      >
                        {{ refreshInterval }}s
                      </span>
                    </div>
                  </div>
                  <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {{ $t('settings_extra.interval_help') }}
                  </p>
                </div>
              </div>
            </div>
          </transition>

          <div class="mt-6 flex justify-end space-x-3">
            <button
              class="px-6 py-2 border border-gray-300 dark:border-neutral-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors font-medium text-sm"
            >
              {{ $t('common.cancel') }}
            </button>
            <button
              class="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm shadow-md"
            >
              {{ $t('common.save') }}
            </button>
          </div>
        </div>
      </div>
    </div>
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

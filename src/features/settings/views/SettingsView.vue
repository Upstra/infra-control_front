<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import router from '@/router';
import { useToast } from 'vue-toast-notification';
import { useLocaleStore } from '@/store/locale';
import { useI18n } from 'vue-i18n';
import { useUserPreferencesStore } from '../store';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
import SettingsLayout from '@/shared/components/SettingsLayout.vue';
import DisplaySettings from '../components/DisplaySettings.vue';
import {
  Shield,
  Palette,
  Clock,
  Languages,
  ShieldCheck,
  RefreshCw,
  Layout,
} from 'lucide-vue-next';

const auth = useAuthStore();
const toast = useToast();
const user = auth.currentUser;
const preferencesStore = useUserPreferencesStore();

const localeStore = useLocaleStore();
const { locale, t } = useI18n();

const language = computed({
  get: () => preferencesStore.locale,
  set: (val) => preferencesStore.updateSinglePreference('locale', val),
});

const defaultUserView = computed({
  get: () => preferencesStore.display.defaultUserView,
  set: (val) =>
    preferencesStore.updateNestedPreference('display', 'defaultUserView', val),
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
            class="text-xl font-semibold text-text-strong flex items-center"
          >
            <Palette class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings.personal') }}
          </h2>
          <p class="mt-1 text-sm text-text-muted">
            {{ t('settings_extra.personal_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <label class="flex items-center justify-between mb-3">
              <div class="flex items-center">
                <Languages class="h-5 w-5 text-text-muted mr-3" />
                <div>
                  <p class="text-sm font-medium text-text-strong">
                    {{ t('settings.language') }}
                  </p>
                  <p class="text-xs text-text-muted">
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
                    : 'bg-surface-raised text-text hover:bg-surface-raised',
                ]"
              >
                {{ t(`settings_extra.${lang}`) }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else-if="activeSection === 'security'" key="security">
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-text-strong flex items-center"
          >
            <Shield class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings_extra.security') }}
          </h2>
          <p class="mt-1 text-sm text-text-muted">
            {{ t('settings_extra.security_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div
            class="flex items-center justify-between p-4 bg-surface-sunken rounded-lg"
          >
            <div class="flex items-center">
              <ShieldCheck class="h-5 w-5 text-text-muted mr-3" />
              <div>
                <p class="text-sm font-medium text-text-strong">
                  {{ t('settings_extra.two_factor') }}
                </p>
                <p class="text-xs text-text-muted">
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
                  ? 'bg-danger-surface text-danger-text hover:bg-danger-surface'
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
        <DisplaySettings class="mb-8" />
        <div class="mb-6">
          <h2
            class="text-xl font-semibold text-text-strong flex items-center"
          >
            <Layout class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings_extra.default_views') }}
          </h2>
          <p class="mt-1 text-sm text-text-muted">
            {{ t('settings_extra.display_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <div>
            <p class="text-sm font-medium text-text-strong mb-3">
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
                    : 'bg-surface-raised text-text hover:bg-surface-raised',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>

          <div class="border-t pt-6">
            <p class="text-sm font-medium text-text-strong mb-3">
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
                    : 'bg-surface-raised text-text hover:bg-surface-raised',
                ]"
              >
                {{ t(`settings_extra.${view}`) }}
              </button>
            </div>
          </div>

          <div class="border-t pt-6">
            <p class="text-sm font-medium text-text-strong mb-3">
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
                    : 'bg-surface-raised text-text hover:bg-surface-raised',
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
            class="text-xl font-semibold text-text-strong flex items-center"
          >
            <RefreshCw class="mr-2 h-5 w-5 text-primary" />
            {{ t('settings_extra.refresh') }}
          </h2>
          <p class="mt-1 text-sm text-text-muted">
            {{ t('settings_extra.performance_desc') }}
          </p>
        </div>

        <div class="space-y-6">
          <label class="flex items-center justify-between">
            <div class="flex items-center">
              <RefreshCw class="h-5 w-5 text-text-muted mr-3" />
              <div>
                <p class="text-sm font-medium text-text-strong">
                  {{ t('settings_extra.auto_refresh') }}
                </p>
                <p class="text-xs text-text-muted">
                  {{ t('settings_extra.auto_refresh_desc') }}
                </p>
              </div>
            </div>
            <ToggleSwitch v-model="autoRefresh" />
          </label>

          <div
            v-if="autoRefresh"
            class="pl-8 border-l-2 border-border ml-2"
          >
            <label
              class="block text-sm font-medium text-text-strong mb-2"
            >
              <div class="flex items-center mb-2">
                <Clock class="h-4 w-4 text-text-muted mr-2" />
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
                class="flex-1 h-2 bg-surface-raised rounded-lg appearance-none cursor-pointer"
              />
              <div
                class="w-20 text-center px-3 py-1 bg-surface-raised rounded-lg"
              >
                <span class="text-sm font-medium text-text-strong">
                  {{ refreshInterval }}s
                </span>
              </div>
            </div>
            <p class="mt-2 text-xs text-text-muted">
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

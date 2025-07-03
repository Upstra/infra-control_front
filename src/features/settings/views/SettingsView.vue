<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/features/auth/store';
import router from '@/router';
import { useToast } from 'vue-toast-notification';
import { useLocaleStore } from '@/store/locale';
import { useThemeStore } from '@/store/theme';
import { useI18n } from 'vue-i18n';

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

const defaultUserView = ref<'table' | 'card'>('table');

const slackWebhook = ref('');
const alertEmail = ref('');

const refreshInterval = ref(60);

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
</script>

<template>
  <div class="max-w-5xl mx-auto p-6 space-y-6">
    <h1 class="text-3xl font-bold text-neutral-darker dark:text-white mb-4">
      {{ $t('settings.title') }}
    </h1>

    <transition name="section" appear>
      <section
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <h2
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
        >
          {{ $t('settings.personal') }}
        </h2>
        <div class="grid sm:grid-cols-3 gap-4">
          <div>
            <label
              class="block text-sm font-medium text-neutral-dark dark:text-neutral-300 mb-1"
              >{{ $t('settings.language') }}
              <select
                v-model="language"
                class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="fr">{{ $t('settings_extra.fr') }}</option>
                <option value="en">{{ $t('settings_extra.en') }}</option>
              </select>
            </label>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-neutral-dark dark:text-neutral-300 mb-1"
              >{{ $t('settings.theme') }}
              <select
                v-model="theme"
                class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="light">{{ $t('settings_extra.light') }}</option>
                <option value="dark">{{ $t('settings_extra.dark') }}</option>
              </select>
            </label>
          </div>
          <div>
            <label
              class="block text-sm font-medium text-neutral-dark dark:text-neutral-300 mb-1"
              >{{ $t('settings.timezone') }}
              <select
                v-model="timeZone"
                class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="UTC">UTC</option>
                <option value="Europe/Paris">Paris</option>
                <option value="America/New_York">New York</option>
              </select>
            </label>
          </div>
        </div>
      </section>
    </transition>

    <transition name="section" appear>
      <section
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <h2
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
        >
          {{ $t('settings.notifications') }}
        </h2>
        <div class="flex items-center gap-3">
          <input
            id="serverNotif"
            type="checkbox"
            v-model="serverNotifications"
            class="accent-primary"
          />
          <label for="serverNotif" class="text-sm dark:text-neutral-300">{{
            $t('settings.server_alert')
          }}</label>
        </div>
        <div class="flex items-center gap-3">
          <input
            id="upsNotif"
            type="checkbox"
            v-model="upsNotifications"
            class="accent-primary"
          />
          <label for="upsNotif" class="text-sm dark:text-neutral-300">{{
            $t('settings.ups_alert')
          }}</label>
        </div>
      </section>
    </transition>

    <transition name="section" appear>
      <section
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <h2
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
        >
          {{ $t('settings_extra.security') }}
        </h2>
        <div class="flex items-center justify-between">
          <p class="text-sm dark:text-neutral-300">
            {{ $t('settings_extra.two_factor') }}
          </p>
          <button
            @click="toggle2fa"
            class="px-3 py-1 text-xs rounded border transition flex items-center gap-1"
            :class="
              user?.isTwoFactorEnabled
                ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                : 'bg-neutral-100 text-neutral-600 border-neutral-300 hover:bg-neutral-200'
            "
          >
            {{
              user?.isTwoFactorEnabled
                ? $t('profile.disable')
                : $t('profile.enable')
            }}
          </button>
        </div>
      </section>
    </transition>

    <transition name="section" appear>
      <section
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <h2
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
        >
          {{ $t('settings_extra.default_views') }}
        </h2>
        <label
          class="block text-sm font-medium text-neutral-dark mb-1 dark:text-neutral-300"
          >{{ $t('settings_extra.user_list') }}</label
        >
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="table"
              v-model="defaultUserView"
              class="accent-primary"
            />
            <span class="text-sm dark:text-neutral-300">{{
              $t('settings_extra.table')
            }}</span>
          </label>
          <label class="flex items-center gap-2">
            <input
              type="radio"
              value="card"
              v-model="defaultUserView"
              class="accent-primary"
            />
            <span class="text-sm dark:text-neutral-300">{{
              $t('settings_extra.cards')
            }}</span>
          </label>
        </div>
      </section>
    </transition>

    <transition name="section" appear>
      <section
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <h2
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
        >
          {{ $t('settings_extra.integrations') }}
        </h2>
        <div>
          <label
            class="block text-sm font-medium text-neutral-dark mb-1 dark:text-neutral-300"
            >{{ $t('settings_extra.webhook') }}
            <input
              v-model="slackWebhook"
              type="text"
              class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://hooks.slack.com/..."
            />
          </label>
        </div>
        <div>
          <label
            class="block text-sm font-medium text-neutral-dark mb-1 dark:text-neutral-300"
            >{{ $t('settings_extra.alert_email') }}
            <input
              v-model="alertEmail"
              type="email"
              class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="admin@example.com"
            />
          </label>
        </div>
      </section>
    </transition>

    <transition name="section" appear>
      <section
        class="bg-white dark:bg-neutral-800 rounded-xl shadow p-6 border border-neutral-200 dark:border-neutral-700 space-y-4"
      >
        <h2
          class="text-lg font-semibold text-neutral-darker dark:text-white mb-2"
        >
          {{ $t('settings_extra.refresh') }}
        </h2>
        <label
          class="block text-sm font-medium text-neutral-dark mb-1 dark:text-neutral-300"
        >
          {{ $t('settings_extra.check_interval') }}
          <input
            type="number"
            min="15"
            v-model.number="refreshInterval"
            class="mt-1 w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary dark:bg-neutral-700 dark:border-neutral-600 dark:text-white bg-neutral-100 dark:bg-neutral-800"
          />
        </label>
      </section>
    </transition>
  </div>
</template>

<style scoped>
.section-enter-active {
  transition: all 0.3s ease;
}
.section-enter-from {
  opacity: 0;
  transform: translateY(10px);
}
</style>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { SegmentedControl } from '@/shared/components/pulse';
import ToggleSwitch from '@/shared/components/ToggleSwitch.vue';
import { useMotion } from '@/composables/useMotion';
import { useThemeStore, type Theme } from '@/store/theme';
import { useUserPreferencesStore } from '../store';

const { t } = useI18n();
const themeStore = useThemeStore();
const preferences = useUserPreferencesStore();
const { animations, setAnimations } = useMotion();

const themeOptions = computed(() => [
  { value: 'dark' as Theme, label: t('settingsDisplay.dark') },
  { value: 'light' as Theme, label: t('settingsDisplay.light') },
]);

const theme = computed({
  get: () => themeStore.theme,
  set: (value: Theme) => {
    themeStore.setTheme(value);
    preferences.updateSinglePreference('theme', value);
  },
});

const motion = computed({
  get: () => animations.value,
  set: (value: boolean) => setAnimations(value),
});
</script>

<template>
  <section
    class="flex flex-col gap-5 rounded-lg border border-border bg-surface p-6 shadow-sm"
    :aria-label="t('settingsDisplay.title')"
  >
    <h3 class="m-0 text-card-title text-text-strong">
      {{ t('settingsDisplay.title') }}
    </h3>
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span class="font-medium text-text-strong">{{
          t('settingsDisplay.theme')
        }}</span>
        <span class="text-caption text-text-muted">{{
          t('settingsDisplay.theme_hint')
        }}</span>
      </div>
      <SegmentedControl
        v-model="theme"
        :options="themeOptions"
        :label="t('settingsDisplay.theme')"
      />
    </div>
    <div
      class="flex flex-wrap items-center gap-4 border-t border-surface-raised pt-5"
    >
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <span id="animations-label" class="font-medium text-text-strong">{{
          t('settingsDisplay.animations')
        }}</span>
        <span class="text-caption text-text-muted">{{
          t('settingsDisplay.animations_hint')
        }}</span>
      </div>
      <ToggleSwitch
        v-model="motion"
        aria-labelledby="animations-label"
        data-setting="animations"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import IncidentBanner from './IncidentBanner.vue';
import IncidentStrip from './IncidentStrip.vue';
import { StatusGlyph } from '@/shared/components/pulse';
import { useIncident } from '../../composables/useIncident';

withDefaults(defineProps<{ compact?: boolean; showPlaceholder?: boolean }>(), {
  compact: false,
  showPlaceholder: false,
});

const { t } = useI18n();
const { incident, others } = useIncident();
</script>

<template>
  <IncidentStrip v-if="incident && compact" :incident="incident" />
  <IncidentBanner v-else-if="incident" :incident="incident" :others="others" />
  <div
    v-else-if="showPlaceholder"
    class="flex items-center gap-3 rounded-xl border border-dashed border-border-strong px-6 py-5 text-text-muted"
  >
    <StatusGlyph state="up" :size="16" />
    <span>{{ t('alerts.banner.none') }}</span>
  </div>
</template>

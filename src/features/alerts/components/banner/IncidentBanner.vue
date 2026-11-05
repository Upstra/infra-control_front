<script setup lang="ts">
import { computed, ref, toRef } from 'vue';
import { useI18n } from 'vue-i18n';
import IncidentHeadline from './IncidentHeadline.vue';
import IncidentActions from './IncidentActions.vue';
import IncidentUpsReadout from './IncidentUpsReadout.vue';
import IncidentDetailsReadout from './IncidentDetailsReadout.vue';
import IncidentOthers from './IncidentOthers.vue';
import ShutdownConfirmModal from './ShutdownConfirmModal.vue';
import { useAlertAcknowledge } from '../../composables/useAlertAcknowledge';
import { useAcknowledgedBy } from '../../composables/useAcknowledgedBy';
import type { Alert } from '../../types';

const props = withDefaults(
  defineProps<{ incident: Alert; others?: Alert[] }>(),
  { others: () => [] },
);

const { t } = useI18n();
const { toggle, pending, canAcknowledge } = useAlertAcknowledge();
const acknowledgedBy = useAcknowledgedBy(toRef(props, 'incident'));
const shutdownOpen = ref(false);
const acknowledged = computed(() => props.incident.acknowledged);
</script>

<template>
  <section
    :aria-label="t('alerts.banner.region')"
    aria-live="polite"
    :class="[
      'flex flex-wrap items-center gap-10 rounded-xl border px-10 py-8 transition-colors duration-300 max-[759px]:px-5 max-[759px]:py-6',
      acknowledged
        ? 'border-border-strong bg-surface shadow-sm'
        : 'incident-live pulse-crit-glow border-danger-border shadow-glow-danger',
    ]"
    :data-acknowledged="acknowledged"
  >
    <div class="flex min-w-0 flex-[1_1_380px] flex-col gap-5">
      <IncidentHeadline :alert="incident" :acknowledged-by="acknowledgedBy" />
      <IncidentActions
        :alert="incident"
        :can-acknowledge="canAcknowledge(incident)"
        :pending="pending"
        @acknowledge="toggle(incident)"
        @remediate="shutdownOpen = true"
      />
    </div>
    <IncidentUpsReadout
      v-if="incident.resourceType === 'ups'"
      :ups-id="incident.resourceId"
    />
    <IncidentDetailsReadout v-else :alert="incident" />
    <IncidentOthers v-if="others.length" :alerts="others" />
    <ShutdownConfirmModal
      v-if="incident.resourceType === 'ups'"
      :open="shutdownOpen"
      :ups-id="incident.resourceId"
      :ups-name="incident.resourceName"
      @close="shutdownOpen = false"
    />
  </section>
</template>

<style scoped>
.incident-live {
  background: radial-gradient(
    ellipse at left,
    rgb(var(--c-danger) / 0.12),
    rgb(var(--c-surface)) 55%
  );
}
</style>

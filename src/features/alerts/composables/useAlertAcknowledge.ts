import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlertsStore } from '../store';
import { classifyAlertError } from '../domain/errors';
import { useToast } from '@/shared/composables/useToast';
import type { Alert } from '../types';

const forbiddenIds = ref<Set<string>>(new Set());

export const useAlertAcknowledge = () => {
  const store = useAlertsStore();
  const { t } = useI18n();
  const toast = useToast();
  const pending = ref(false);

  const canAcknowledge = (alert: Pick<Alert, 'id'>) =>
    !forbiddenIds.value.has(alert.id);

  const toggle = async (alert: Alert) => {
    if (pending.value) return;
    pending.value = true;
    try {
      if (alert.acknowledged) {
        await store.unacknowledge(alert.id);
        toast.showInfo(t('alerts.toast.reopened'));
      } else {
        await store.acknowledge(alert.id);
        await store.fetchDetails(alert.id).catch(() => null);
        toast.showSuccess(t('alerts.toast.acknowledged'));
      }
    } catch (error) {
      const failure = classifyAlertError(error);
      if (failure === 'forbidden') {
        forbiddenIds.value = new Set(forbiddenIds.value).add(alert.id);
        toast.showError(t('alerts.toast.forbidden'));
      } else if (failure === 'resolved') {
        await store.load();
        toast.showInfo(t('alerts.toast.already_resolved'));
      } else {
        toast.showError(t('alerts.toast.failed'));
      }
    } finally {
      pending.value = false;
    }
  };

  return { toggle, pending, canAcknowledge };
};

export const resetAcknowledgePermissions = () => {
  forbiddenIds.value = new Set();
};

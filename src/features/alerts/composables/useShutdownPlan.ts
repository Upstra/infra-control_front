import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { migrationApi } from '@/features/migration/api';
import { useToast } from '@/shared/composables/useToast';

const ALREADY_RUNNING = /already running/i;

export const useShutdownPlan = () => {
  const { t } = useI18n();
  const toast = useToast();
  const starting = ref(false);

  const start = async (): Promise<boolean> => {
    starting.value = true;
    try {
      await migrationApi.startMigration();
      toast.showSuccess(t('alerts.shutdown.started'));
      return true;
    } catch (error: any) {
      const message = String(error?.response?.data?.message ?? '');
      const running =
        error?.response?.status === 400 && ALREADY_RUNNING.test(message);
      toast.showError(
        t(running ? 'alerts.shutdown.running' : 'alerts.shutdown.failed'),
      );
      return false;
    } finally {
      starting.value = false;
    }
  };

  return { start, starting };
};

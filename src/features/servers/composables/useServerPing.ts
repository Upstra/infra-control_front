import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { pingServerByIp } from '../api';
import { useToast } from '@/shared/composables/useToast';
import type { Server } from '../types';

export const useServerPing = () => {
  const { t } = useI18n();
  const toast = useToast();
  const pinging = ref(false);

  const ping = async (server: Server) => {
    if (pinging.value) return;
    pinging.value = true;
    try {
      const result = await pingServerByIp(server.ip);
      if (!result?.accessible)
        toast.showError(
          t('serversPage.detail.ping_failed', { name: server.name }),
        );
      else if (typeof result.responseTime === 'number')
        toast.showSuccess(
          t('serversPage.detail.ping_ok_time', {
            name: server.name,
            time: Math.round(result.responseTime),
          }),
        );
      else
        toast.showSuccess(
          t('serversPage.detail.ping_ok', { name: server.name }),
        );
    } catch {
      toast.showError(t('serversPage.detail.ping_error'));
    } finally {
      pinging.value = false;
    }
  };

  return { ping, pinging };
};

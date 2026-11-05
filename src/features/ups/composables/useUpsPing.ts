import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { pingUpsByIp } from '../api';
import { useToast } from '@/shared/composables/useToast';
import type { UpsResponseDto } from '../types';

export const useUpsPing = () => {
  const { t } = useI18n();
  const toast = useToast();
  const pinging = ref(false);

  const ping = async (ups: UpsResponseDto) => {
    if (pinging.value) return;
    pinging.value = true;
    try {
      const result = await pingUpsByIp(ups.ip);
      if (!result?.accessible) {
        toast.showError(t('upsPage.detail.ping_failed', { name: ups.name }));
      } else if (typeof result.responseTime === 'number') {
        toast.showSuccess(
          t('upsPage.detail.ping_ok_time', {
            name: ups.name,
            time: Math.round(result.responseTime),
          }),
        );
      } else {
        toast.showSuccess(t('upsPage.detail.ping_ok', { name: ups.name }));
      }
    } catch {
      toast.showError(t('upsPage.detail.ping_error'));
    } finally {
      pinging.value = false;
    }
  };

  return { ping, pinging };
};

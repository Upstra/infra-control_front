import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { upsApi } from '../api';
import { useUpsLiveStore } from '../liveStore';
import { isValidUpsAddress } from '../domain/address';
import { useToast } from '@/shared/composables/useToast';
import type { UpsResponseDto } from '../types';

export interface AddUpsForm {
  name: string;
  ip: string;
  roomId: string;
  gracePeriodOn: number;
  gracePeriodOff: number;
  nominalPowerW: number | null;
}

export type AddUpsError =
  | 'name_required'
  | 'ip_invalid'
  | 'room_required'
  | 'duplicate';

const emptyForm = (): AddUpsForm => ({
  name: '',
  ip: '',
  roomId: '',
  gracePeriodOn: 120,
  gracePeriodOff: 300,
  nominalPowerW: null,
});

export const validateAddUps = (
  form: AddUpsForm,
  existing: UpsResponseDto[],
): AddUpsError | null => {
  if (!form.name.trim()) return 'name_required';
  if (!isValidUpsAddress(form.ip)) return 'ip_invalid';
  if (!form.roomId) return 'room_required';
  const name = form.name.trim().toLowerCase();
  const ip = form.ip.trim().toLowerCase();
  const taken = existing.some(
    (ups) => ups.name.toLowerCase() === name || ups.ip.toLowerCase() === ip,
  );
  return taken ? 'duplicate' : null;
};

export const useAddUps = () => {
  const { t } = useI18n();
  const toast = useToast();
  const live = useUpsLiveStore();
  const form = ref<AddUpsForm>(emptyForm());
  const error = ref<AddUpsError | null>(null);
  const saving = ref(false);

  const reset = () => {
    form.value = emptyForm();
    error.value = null;
  };

  const submit = async (): Promise<UpsResponseDto | null> => {
    error.value = validateAddUps(form.value, live.units);
    if (error.value) return null;
    saving.value = true;
    try {
      const created = await upsApi.create({
        name: form.value.name.trim(),
        ip: form.value.ip.trim(),
        roomId: form.value.roomId,
        grace_period_on: form.value.gracePeriodOn,
        grace_period_off: form.value.gracePeriodOff,
        nominalPowerW: form.value.nominalPowerW,
      });
      live.upsert(created);
      toast.showSuccess(t('upsPage.add_drawer.added', { name: created.name }));
      reset();
      return created;
    } catch (e: any) {
      if (e?.response?.status === 409) error.value = 'duplicate';
      toast.showError(t('upsPage.add_drawer.failed'));
      return null;
    } finally {
      saving.value = false;
    }
  };

  return { form, error, saving, reset, submit };
};

import { computed, ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';
import { upsApi } from '../api';
import { useUpsLiveStore } from '../liveStore';
import {
  formFor,
  roomChanged,
  toUpdatePayload,
  validateSettings,
  type SettingsError,
  type UpsSettingsForm,
} from '../domain/settings';
import { useToast } from '@/shared/composables/useToast';
import type { Server } from '@/features/servers/types';
import type { UpsResponseDto } from '../types';

const DELETE_CONFIRM_MS = 3000;

export const useUpsSettings = (
  ups: MaybeRefOrGetter<UpsResponseDto>,
  servers: MaybeRefOrGetter<Server[]>,
) => {
  const { t } = useI18n();
  const toast = useToast();
  const live = useUpsLiveStore();

  const form = ref<UpsSettingsForm>(formFor(toValue(ups)));
  const error = ref<SettingsError | 'duplicate' | null>(null);
  const saving = ref(false);
  const confirmDelete = ref(false);
  let confirmTimer: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    form.value = formFor(toValue(ups));
    error.value = null;
    confirmDelete.value = false;
  };

  watch(() => toValue(ups).id, reset);

  const roomMoved = computed(() => roomChanged(form.value, toValue(ups)));

  const savedMessage = (saved: UpsResponseDto) => {
    const name = saved.name;
    if (!roomMoved.value || !toValue(servers).length)
      return t('upsPage.settings.saved', { name });
    const moved = saved.movedServerIds?.length ?? 0;
    return moved
      ? t('upsPage.settings.saved_moved', { name, count: moved }, moved)
      : t('upsPage.settings.saved_alone', { name });
  };

  const save = async () => {
    error.value = validateSettings(form.value);
    if (error.value) return false;
    saving.value = true;
    try {
      const current = toValue(ups);
      const saved = await upsApi.update(
        current.id,
        toUpdatePayload(form.value, current, toValue(servers).length),
      );
      toast.showSuccess(savedMessage(saved));
      live.upsert({ ...current, ...saved });
      return true;
    } catch (e: any) {
      if (e?.response?.status === 409) error.value = 'duplicate';
      toast.showError(t('upsPage.settings.failed'));
      return false;
    } finally {
      saving.value = false;
    }
  };

  const remove = async () => {
    if (!confirmDelete.value) {
      confirmDelete.value = true;
      if (confirmTimer) clearTimeout(confirmTimer);
      confirmTimer = setTimeout(
        () => (confirmDelete.value = false),
        DELETE_CONFIRM_MS,
      );
      return false;
    }
    const current = toValue(ups);
    try {
      await upsApi.delete(current.id);
      live.remove(current.id);
      toast.showInfo(t('upsPage.settings.deleted', { name: current.name }));
      return true;
    } catch {
      toast.showError(t('upsPage.settings.delete_failed'));
      return false;
    } finally {
      confirmDelete.value = false;
    }
  };

  return { form, error, saving, confirmDelete, roomMoved, reset, save, remove };
};

import { ref, toValue, watch, type MaybeRefOrGetter } from 'vue';
import { useI18n } from 'vue-i18n';
import { deleteServer, updateServer } from '../api';
import { useServerInventoryStore } from '../inventoryStore';
import { useToast } from '@/shared/composables/useToast';
import {
  isDuplicate,
  serverFormFor,
  validateServerSettings,
  type ServerSettingsError,
  type ServerSettingsForm,
} from '../domain/settings';
import type { Server } from '../types';

const CONFIRM_MS = 3000;

export const useServerSettings = (
  server: MaybeRefOrGetter<Server>,
  vmCount: MaybeRefOrGetter<number>,
) => {
  const { t } = useI18n();
  const toast = useToast();
  const inventory = useServerInventoryStore();
  const form = ref<ServerSettingsForm>(serverFormFor(toValue(server)));
  const error = ref<ServerSettingsError | 'duplicate' | null>(null);
  const saving = ref(false);
  const confirmRemove = ref(false);
  const removeBlocked = ref(false);
  let timer: ReturnType<typeof setTimeout> | null = null;

  const reset = () => {
    form.value = serverFormFor(toValue(server));
    error.value = null;
    confirmRemove.value = false;
    removeBlocked.value = false;
  };

  watch(() => toValue(server).id, reset);

  const save = async () => {
    const current = toValue(server);
    error.value =
      validateServerSettings(form.value) ??
      (isDuplicate({ ...form.value, id: current.id }, inventory.servers)
        ? 'duplicate'
        : null);
    if (error.value) return false;
    saving.value = true;
    try {
      const saved = await updateServer(current.id, {
        name: form.value.name.trim(),
        ip: form.value.ip.trim(),
        priority: form.value.priority,
        roomId: form.value.roomId,
        upsId: form.value.upsId,
      });
      inventory.upsert({ ...current, ...saved });
      toast.showSuccess(
        t('serversPage.settings.saved', { name: saved.name ?? current.name }),
      );
      return true;
    } catch {
      toast.showError(t('serversPage.settings.failed'));
      return false;
    } finally {
      saving.value = false;
    }
  };

  const remove = async () => {
    const current = toValue(server);
    if (toValue(vmCount) > 0) {
      removeBlocked.value = true;
      return false;
    }
    if (!confirmRemove.value) {
      confirmRemove.value = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => (confirmRemove.value = false), CONFIRM_MS);
      return false;
    }
    try {
      await deleteServer(current.id);
      inventory.remove(current.id);
      toast.showInfo(t('serversPage.settings.removed', { name: current.name }));
      return true;
    } catch (e: any) {
      removeBlocked.value =
        e?.response?.status === 409 || e?.response?.status === 400;
      if (!removeBlocked.value)
        toast.showError(t('serversPage.settings.failed'));
      return false;
    } finally {
      confirmRemove.value = false;
    }
  };

  return {
    form,
    error,
    saving,
    confirmRemove,
    removeBlocked,
    reset,
    save,
    remove,
  };
};

import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { createServer } from '../api';
import { useServerInventoryStore } from '../inventoryStore';
import { useToast } from '@/shared/composables/useToast';
import { isDuplicate, isValidHost } from '../domain/settings';
import type { CreateServerPayload, Server, ServerType } from '../types';

export interface AddServerForm {
  type: ServerType;
  name: string;
  ip: string;
  adminUrl: string;
  login: string;
  password: string;
  roomId: string;
  upsId: string;
  priority: number;
  withIlo: boolean;
  iloName: string;
  iloIp: string;
  iloLogin: string;
  iloPassword: string;
}

export type AddServerError =
  | 'name_required'
  | 'ip_invalid'
  | 'room_required'
  | 'login_required'
  | 'password_required'
  | 'priority_invalid'
  | 'duplicate'
  | 'ilo_ip_invalid';

const emptyForm = (): AddServerForm => ({
  type: 'esxi',
  name: '',
  ip: '',
  adminUrl: '',
  login: '',
  password: '',
  roomId: '',
  upsId: '',
  priority: 1,
  withIlo: false,
  iloName: '',
  iloIp: '',
  iloLogin: '',
  iloPassword: '',
});

export const validateAddServer = (
  form: AddServerForm,
  servers: Server[],
): AddServerError | null => {
  if (!form.name.trim()) return 'name_required';
  if (!isValidHost(form.ip)) return 'ip_invalid';
  if (!form.login.trim()) return 'login_required';
  if (!form.password) return 'password_required';
  if (!form.roomId) return 'room_required';
  if (!Number.isInteger(form.priority) || form.priority < 1)
    return 'priority_invalid';
  if (form.withIlo && !isValidHost(form.iloIp)) return 'ilo_ip_invalid';
  return isDuplicate(form, servers) ? 'duplicate' : null;
};

export const toCreatePayload = (form: AddServerForm): CreateServerPayload => ({
  type: form.type,
  name: form.name.trim(),
  ip: form.ip.trim(),
  state: 'UP',
  adminUrl: form.adminUrl.trim() || `https://${form.ip.trim()}`,
  login: form.login.trim(),
  password: form.password,
  priority: form.priority,
  roomId: form.roomId,
  upsId: form.upsId || undefined,
  ilo: form.withIlo
    ? {
        name: form.iloName.trim() || `${form.name.trim()}-ilo`,
        ip: form.iloIp.trim(),
        login: form.iloLogin.trim(),
        password: form.iloPassword,
      }
    : undefined,
});

export const useAddServer = () => {
  const { t } = useI18n();
  const toast = useToast();
  const inventory = useServerInventoryStore();
  const form = ref<AddServerForm>(emptyForm());
  const error = ref<AddServerError | null>(null);
  const saving = ref(false);

  const reset = () => {
    form.value = emptyForm();
    error.value = null;
  };

  const submit = async (): Promise<Server | null> => {
    error.value = validateAddServer(form.value, inventory.servers);
    if (error.value) return null;
    saving.value = true;
    try {
      const created = await createServer(toCreatePayload(form.value));
      inventory.upsert(created);
      toast.showSuccess(
        t('serversPage.add_drawer.added', { name: created.name }),
      );
      reset();
      return created;
    } catch {
      toast.showError(t('serversPage.add_drawer.failed'));
      return null;
    } finally {
      saving.value = false;
    }
  };

  return { form, error, saving, reset, submit };
};

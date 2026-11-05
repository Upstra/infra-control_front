import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDashboardStore } from '../store';
import { useLayoutEditor } from './useLayoutEditor';
import { useToast } from '@/shared/composables/useToast';
import type { PulseWidgetType } from '../domain/catalog';

export const useDashboardBoard = () => {
  const store = useDashboardStore();
  const editor = useLayoutEditor();
  const { t } = useI18n();
  const toast = useToast();
  const catalogOpen = ref(false);
  const saving = ref(false);

  const board = computed(() => editor.draft.value ?? store.active);
  const canDelete = computed(
    () => editor.editing.value && !!store.active && !store.active.isDefault,
  );

  onMounted(store.load);

  const select = (id: string) => {
    if (editor.editing.value) {
      toast.showInfo(t('boards.unsaved'));
      return;
    }
    store.select(id);
  };

  const customize = () => {
    if (store.active) editor.start(store.active);
  };

  const create = async () => {
    if (editor.editing.value) {
      toast.showInfo(t('boards.unsaved'));
      return;
    }
    const created = await store.create(t('boards.new_name'));
    editor.start(created);
    catalogOpen.value = true;
  };

  const cancel = () => {
    editor.cancel();
    catalogOpen.value = false;
    toast.showInfo(t('boards.cancelled'));
  };

  const save = async () => {
    const draft = editor.draft.value;
    if (!draft) return;
    saving.value = true;
    try {
      await store.save(draft);
      editor.finish();
      catalogOpen.value = false;
      toast.showSuccess(t('boards.saved', { name: draft.name }));
    } catch {
      toast.showError(t('boards.save_failed'));
    } finally {
      saving.value = false;
    }
  };

  const remove = async () => {
    const current = store.active;
    if (!current || current.isDefault) return;
    editor.finish();
    catalogOpen.value = false;
    await store.remove(current.id);
    toast.showInfo(t('boards.deleted', { name: current.name }));
  };

  const add = (type: PulseWidgetType) => {
    if (!editor.editing.value) customize();
    editor.add(type);
  };

  const openCatalog = () => {
    if (!editor.editing.value) customize();
    catalogOpen.value = true;
  };

  return {
    store,
    editor,
    board,
    catalogOpen,
    saving,
    canDelete,
    select,
    customize,
    create,
    cancel,
    save,
    remove,
    add,
    openCatalog,
  };
};

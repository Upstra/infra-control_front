import { ref, computed, watch } from 'vue';
import { useMagicKeys } from '@vueuse/core';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/features/auth/store';
import { useCommandPaletteStore } from '@/stores/commandPalette';
import { useCommandPalette as useCommandPaletteComposable } from '@/shared/composables/useCommandPalette';
import { createActions } from './actions';
import type { CommandAction } from './types';

export function useCommandPalette() {
  const commandPaletteStore = useCommandPaletteStore();
  const query = ref('');
  const selectedIndex = ref(0);

  const router = useRouter();
  const route = useRoute();
  const { t } = useI18n();
  const auth = useAuthStore();
  const { switchView } = useCommandPaletteComposable();

  const isAdmin = computed(
    () => auth.currentUser?.roles?.some((role) => role.isAdmin) ?? false,
  );

  const canCreateServer = computed(
    () =>
      auth.currentUser?.roles?.some((role) => role.canCreateServer) ?? false,
  );

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleLogout = async () => {
    auth.resetAuthState();
    router.push('/login');
  };

  const actions = computed(() =>
    createActions(navigateTo, handleLogout, switchView, isAdmin.value),
  );

  const filteredActions = computed(() => {
    return actions.value.filter((action) => {
      if (action.onlyInUsers && !route.path.startsWith('/users')) return false;
      if (action.adminOnly && !isAdmin.value) return false;
      if (
        action.requiresPermission === 'canCreateServer' &&
        !isAdmin.value &&
        !canCreateServer.value
      )
        return false;
      if (action.path && route.path === action.path) return false;

      if (!query.value) return true;

      const searchTerm = query.value.toLowerCase();
      const label = t(action.label).toLowerCase();
      const description = action.description
        ? t(action.description).toLowerCase()
        : '';
      const group = t(action.group).toLowerCase();

      return (
        label.includes(searchTerm) ||
        description.includes(searchTerm) ||
        group.includes(searchTerm)
      );
    });
  });

  const groupedActions = computed(() => {
    return filteredActions.value.reduce(
      (acc, action) => {
        const group = t(action.group);
        if (!acc[group]) acc[group] = [];
        acc[group].push(action);
        return acc;
      },
      {} as Record<string, CommandAction[]>,
    );
  });

  const allActions = computed(() => {
    return Object.values(groupedActions.value).flat();
  });

  const openCommandPalette = () => {
    commandPaletteStore.open();
    selectedIndex.value = 0;
  };

  const closeCommandPalette = () => {
    commandPaletteStore.close();
    query.value = '';
    selectedIndex.value = 0;
  };

  const handleAction = (action: CommandAction) => {
    action.fn();
    closeCommandPalette();
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        allActions.value.length - 1,
      );
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (allActions.value[selectedIndex.value]) {
        handleAction(allActions.value[selectedIndex.value]);
      }
    }
  };

  const { ctrl_k, meta_k, escape } = useMagicKeys();

  watch([ctrl_k, meta_k], ([ctrl, meta]) => {
    if (ctrl || meta) {
      openCommandPalette();
    }
  });

  watch(escape, (pressed) => {
    if (pressed && commandPaletteStore.isOpen) {
      closeCommandPalette();
    }
  });

  watch(query, () => {
    selectedIndex.value = 0;
  });

  return {
    isOpen: computed(() => commandPaletteStore.isOpen),
    query,
    selectedIndex,
    groupedActions,
    openCommandPalette,
    closeCommandPalette,
    handleAction,
    handleKeydown,
  };
}

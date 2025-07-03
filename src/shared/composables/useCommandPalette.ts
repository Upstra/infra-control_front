import { ref } from 'vue';

type ViewSwitchHandler = (view: 'table' | 'card') => void;

const viewSwitchHandler = ref<ViewSwitchHandler | null>(null);

/**
 * Composable for managing command palette view switching functionality
 */
export function useCommandPalette() {
  const registerViewSwitchHandler = (handler: ViewSwitchHandler) => {
    viewSwitchHandler.value = handler;
  };

  const unregisterViewSwitchHandler = () => {
    viewSwitchHandler.value = null;
  };

  const switchView = (view: 'table' | 'card') => {
    if (viewSwitchHandler.value) {
      viewSwitchHandler.value(view);
    }
  };

  return {
    registerViewSwitchHandler,
    unregisterViewSwitchHandler,
    switchView,
  };
}

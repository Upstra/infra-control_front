import { createApp, h } from 'vue';
import ConfirmModal from '@/shared/components/ConfirmModal.vue';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export function useConfirm() {
  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      const container = document.createElement('div');
      document.body.appendChild(container);

      const closeModal = (result: boolean) => {
        app.unmount();
        document.body.removeChild(container);
        resolve(result);
      };

      const app = createApp({
        render() {
          return h(ConfirmModal, {
            open: true,
            title: options.title,
            message: options.message,
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            confirmButtonClass:
              options.confirmButtonClass ||
              'bg-blue-600 hover:bg-blue-700 text-white',
            onCancel: () => closeModal(false),
            onConfirm: () => closeModal(true),
          });
        },
      });

      app.mount(container);
    });
  };

  return {
    confirm,
  };
}

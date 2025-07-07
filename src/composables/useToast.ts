interface ToastOptions {
  duration?: number;
  type?: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
  const showToast = (message: string, options?: ToastOptions) => {
    const event = new CustomEvent('toast', {
      detail: {
        message,
        ...options,
      },
    });
    window.dispatchEvent(event);
  };

  const showSuccess = (
    message: string,
    options?: Omit<ToastOptions, 'type'>,
  ) => {
    showToast(message, { ...options, type: 'success' });
  };

  const showError = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    showToast(message, { ...options, type: 'error' });
  };

  const showWarning = (
    message: string,
    options?: Omit<ToastOptions, 'type'>,
  ) => {
    showToast(message, { ...options, type: 'warning' });
  };

  const showInfo = (message: string, options?: Omit<ToastOptions, 'type'>) => {
    showToast(message, { ...options, type: 'info' });
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}

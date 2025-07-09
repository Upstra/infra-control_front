import { useToast } from 'vue-toast-notification';
import { useI18n } from 'vue-i18n';

export function usePreferenceFeedback() {
  const toast = useToast();
  const { t } = useI18n();

  // Types de changements qui nécessitent un feedback explicite
  const significantChanges = [
    'locale',
    'theme',
    'timezone',
    'notifications',
    'integrations',
    'performance.autoRefresh',
    'performance.refreshInterval',
  ];

  const shouldShowToast = (changedKeys: string[]): boolean => {
    return changedKeys.some((key) =>
      significantChanges.some((significant) => key.includes(significant)),
    );
  };

  const showPreferenceToast = (message?: string) => {
    toast.success(message || t('settings.preferences_saved'), {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  return {
    shouldShowToast,
    showPreferenceToast,
  };
}

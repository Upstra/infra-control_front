import { i18n } from '@/i18n'

export const extractAxiosMessage = (err: any): string =>
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    i18n.global.t('errors.unknown');

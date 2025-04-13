export const extractAxiosMessage = (err: any): string =>
    err?.response?.data?.message ??
    err?.response?.data?.error ??
    'Une erreur inconnue est survenue.';

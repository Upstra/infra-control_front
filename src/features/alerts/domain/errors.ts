export type AlertActionFailure = 'forbidden' | 'resolved' | 'failed';

export const classifyAlertError = (error: any): AlertActionFailure => {
  const status = error?.response?.status;
  if (status === 403) return 'forbidden';
  if (status === 409) return 'resolved';
  return 'failed';
};

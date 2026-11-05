import axios from '@/services/api';
import type { PresenceView } from './types';

export const checkUserPresence = (
  userId: string,
): Promise<{ online: boolean }> => {
  return axios.get(`/presence/${userId}`).then((res) => res.data);
};

export const fetchPresence = (): Promise<PresenceView[]> =>
  axios.get('/presence').then((res) => res.data);

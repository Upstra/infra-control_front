import axios from '@/services/api';

export const checkUserPresence = (
  userId: string,
): Promise<{ online: boolean }> => {
  return axios.get(`/presence/${userId}`).then((res) => res.data);
};

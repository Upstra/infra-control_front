import api from '@/services/api';
import type { FeedPage, FeedParams } from './types';

export const eventsApi = {
  feed: async ({ cursor, ...params }: FeedParams = {}): Promise<FeedPage> => {
    const { data } = await api.get<FeedPage>('/events/feed', {
      params: cursor ? { ...params, cursor } : params,
    });
    return data;
  },
};

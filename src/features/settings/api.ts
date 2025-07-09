import axios from '@/services/api';
import type { UserPreferences, UserPreferencesUpdateDto } from './types';

export const preferencesApi = {
  getPreferences(): Promise<UserPreferences> {
    return axios.get('/users/me/preferences').then((response) => response.data);
  },

  updatePreferences(data: UserPreferencesUpdateDto): Promise<UserPreferences> {
    return axios
      .patch('/users/me/preferences', data)
      .then((response) => response.data);
  },

  resetPreferences(): Promise<UserPreferences> {
    return axios
      .post('/users/me/preferences/reset')
      .then((response) => response.data);
  },
};

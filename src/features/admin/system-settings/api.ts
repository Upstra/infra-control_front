import api from '@/services/api';
import type {
  SystemSettingsResponseDto,
  UpdateSystemSettingsDto,
  ImportSettingsDto,
  ExportSettingsResponseDto,
  SettingsCategory,
} from './types';

const BASE_URL = '/admin/settings';

export const systemSettingsApi = {
  getSettings: () => api.get<SystemSettingsResponseDto>(BASE_URL),

  updateSettings: (data: UpdateSystemSettingsDto) =>
    api.patch<SystemSettingsResponseDto>(BASE_URL, data),

  resetCategory: (category: SettingsCategory) =>
    api.post<SystemSettingsResponseDto>(`${BASE_URL}/${category}/reset`),

  testEmail: (to: string) => api.post(`${BASE_URL}/email/test`, { to }),

  exportSettings: () =>
    api.get<ExportSettingsResponseDto>(`${BASE_URL}/export`),

  importSettings: (data: ImportSettingsDto) =>
    api.post<SystemSettingsResponseDto>(`${BASE_URL}/import`, data),
};

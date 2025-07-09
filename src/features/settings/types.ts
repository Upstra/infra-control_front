export interface UserPreferences {
  id: string;
  userId: string;
  locale: 'fr' | 'en';
  theme: 'light' | 'dark';
  timezone: string;
  notifications: {
    server: boolean;
    ups: boolean;
    email: boolean;
    push: boolean;
  };
  display: {
    defaultUserView: 'table' | 'card';
    defaultServerView: 'grid' | 'list';
    defaultUpsView: 'grid' | 'list';
    defaultRoomView: 'grid' | 'list';
    defaultGroupView: 'grid' | 'list' | 'sections' | 'flow';
    compactMode: boolean;
  };
  integrations: {
    slackWebhook?: string;
    alertEmail?: string;
    discordWebhook?: string;
    teamsWebhook?: string;
  };
  performance: {
    autoRefresh: boolean;
    refreshInterval: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type UserPreferencesUpdateDto = Partial<
  Omit<UserPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;

export const DEFAULT_USER_PREFERENCES: Omit<
  UserPreferences,
  'id' | 'userId' | 'createdAt' | 'updatedAt'
> = {
  locale: 'fr',
  theme: 'dark',
  timezone: 'UTC',
  notifications: {
    server: true,
    ups: true,
    email: false,
    push: true,
  },
  display: {
    defaultUserView: 'table',
    defaultServerView: 'grid',
    defaultUpsView: 'grid',
    defaultRoomView: 'grid',
    defaultGroupView: 'grid',
    compactMode: false,
  },
  integrations: {
    slackWebhook: undefined,
    alertEmail: undefined,
    discordWebhook: undefined,
    teamsWebhook: undefined,
  },
  performance: {
    autoRefresh: true,
    refreshInterval: 60,
  },
};

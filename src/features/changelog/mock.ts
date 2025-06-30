import type { ChangelogResponse } from './types';

export const getMockChangelog = (): ChangelogResponse => ({
  frontend: [
    {
      name: 'Frontend 0.1.0',
      tag_name: 'v0.1.0',
      published_at: new Date('2024-05-20').toISOString(),
      author: 'Alice',
      body: '# Added\n- Initial release',
      html_url: 'https://github.com/example/frontend/releases/v0.1.0',
    },
  ],
  backend: [
    {
      name: 'Backend 0.1.0',
      tag_name: 'v0.1.0',
      published_at: new Date('2024-05-15').toISOString(),
      author: 'Bob',
      body: '# Added\n- Initial release',
      html_url: 'https://github.com/example/backend/releases/v0.1.0',
    },
  ],
});

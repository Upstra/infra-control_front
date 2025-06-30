import type { ChangelogResponse } from './types';

export const getMockChangelog = (): ChangelogResponse => ({
  frontend: {
    items: [
      {
        name: 'Frontend 0.1.0',
        tagName: 'v0.1.0',
        publishedAt: new Date('2024-05-20').toISOString(),
        author: 'Alice',
        body: '# Added\n- Initial release',
        htmlUrl: 'https://github.com/example/frontend/releases/v0.1.0',
      },
    ],
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
  },
  backend: {
    items: [
      {
        name: 'Backend 0.1.0',
        tagName: 'v0.1.0',
        publishedAt: new Date('2024-05-15').toISOString(),
        author: 'Bob',
        body: '# Added\n- Initial release',
        htmlUrl: 'https://github.com/example/backend/releases/v0.1.0',
      },
    ],
    totalItems: 1,
    totalPages: 1,
    currentPage: 1,
  },
});

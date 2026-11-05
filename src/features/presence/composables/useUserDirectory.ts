import { computed, ref } from 'vue';
import { fetchUsers } from '@/features/users/api';
import { getToken } from '@/features/auth/token';
import type { User } from '@/features/users/types';

const LIMIT = 100;
const users = ref<User[]>([]);
let pending: Promise<void> | null = null;

const load = () => {
  if (pending) return pending;
  const token = getToken();
  if (!token) return Promise.resolve();
  pending = fetchUsers(token, 1, LIMIT)
    .then((page) => {
      users.value = page.items;
    })
    .catch(() => {
      users.value = [];
    });
  return pending;
};

export const useUserDirectory = () => {
  load();
  const byId = computed(() =>
    Object.fromEntries(users.value.map((user) => [user.id, user])),
  );
  return { users, byId };
};

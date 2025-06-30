import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/features/auth/store';

export const useCurrentUser = () => {
  const auth = useAuthStore();
  const { currentUser } = storeToRefs(auth);
  return { currentUser };
};

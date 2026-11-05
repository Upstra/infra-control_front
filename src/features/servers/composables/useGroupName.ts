import { computed, onMounted, toValue, type MaybeRefOrGetter } from 'vue';
import { useGroupStore } from '@/features/groups/store';

export const useGroupName = (
  groupId: MaybeRefOrGetter<string | null | undefined>,
) => {
  const groups = useGroupStore();
  onMounted(() => {
    if (!groups.allGroups.length) groups.fetchAllGroups().catch(() => null);
  });
  return computed(() => {
    const id = toValue(groupId);
    return (
      (id && groups.allGroups.find((group) => group.id === id)?.name) || null
    );
  });
};

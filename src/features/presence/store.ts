import { defineStore } from "pinia";
import { ref } from "vue";
import { checkUserPresence } from "./api";

export const usePresenceStore = defineStore("presence", () => {
  const statuses = ref<Record<string, boolean>>({});
  const isConnected = ref(false);

  const fetchPresence = async (userId: string) => {
    try {
      const { online } = await checkUserPresence(userId);
      statuses.value[userId] = online;
    } catch {
      statuses.value[userId] = false;
    }
  };

  return {
    statuses,
    fetchPresence,
    isConnected,
  };
});

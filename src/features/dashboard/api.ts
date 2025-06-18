import axios from "@/services/api";
import type { DashboardStatsDto } from "./types";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const dashboardApi = {
  getStats: async (): Promise<DashboardStatsDto> => {
    const { data } = await axios.get<DashboardStatsDto>(
      "/dashboard",
      getAuthHeaders()
    );
    return data;
  },
};

import axios from "@/services/api";
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
} from "./types";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const dashboardApi = {
  getFullStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>(
      "/dashboard/full",
      getAuthHeaders()
    );
    return data;
  },

  getServerCreations: async (): Promise<ServerCreationStat[]> => {
    return [
      { month: "Jan", count: 3 },
      { month: "Fév", count: 5 },
      { month: "Mar", count: 2 },
      { month: "Avr", count: 6 },
      { month: "Mai", count: 4 },
      { month: "Juin", count: 5 },
    ];
  },

  getUPSLoad: async (): Promise<UPSLoadStat[]> => {
    return [
      { hour: "00h", load: 20 },
      { hour: "04h", load: 35 },
      { hour: "08h", load: 50 },
      { hour: "12h", load: 60 },
      { hour: "16h", load: 45 },
      { hour: "20h", load: 30 },
    ];
  },
};

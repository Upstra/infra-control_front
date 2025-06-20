import axios from "@/services/api";
import type {
  FullDashboardStatsDto,
  ServerCreationStat,
  UPSLoadStat,
} from "./types";

/**
 * Build the authorization header for API requests using the token stored in
 * localStorage.
 *
 * @returns Axios request configuration containing the bearer token.
 */
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const dashboardApi = {
  /**
   * Retrieve complete dashboard statistics from the backend.
   *
   * @returns Promise resolving with overall infrastructure metrics.
   */
  getFullStats: async (): Promise<FullDashboardStatsDto> => {
    const { data } = await axios.get<FullDashboardStatsDto>(
      "/dashboard/full",
      getAuthHeaders()
    );
    return data;
  },

  /**
   * Fetch the server creation count for the last six months.
   * Currently this method returns mocked data.
   *
   * @returns Promise resolving with monthly creation stats.
   */
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

  /**
   * Fetch the UPS load history for the past 24 hours.
   * Currently this method returns mocked data.
   *
   * @returns Promise resolving with hourly UPS load stats.
   */
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

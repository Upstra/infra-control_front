import api from "@/services/api";
import type { Server, CreateServerPayload } from "./types";

export const fetchServers = () => {
  return api.get<Server[]>("/server");
};

export const createServer = (payload: CreateServerPayload) => {
  return api.post<Server>("/server", payload);
};

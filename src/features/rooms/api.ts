import api from "@/services/api";

export const fetchUrooms = () => {
  console.log("Hello from rooms API");
  return api.get("/rooms");
};

export const fetchRoomById = (id: string) => {
  console.log("Hello from rooms API");
  return api.get("/rooms/" + id);
};

export const createUrooms = (payload: any) => {
  console.log("Creating new rooms");
  return api.post("/rooms", payload);
};

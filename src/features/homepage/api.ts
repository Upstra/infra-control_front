import api from "@/services/api";

export const fetchUgroups = () => {
  console.log("Hello from homepage API");
  return api.get("/homepage");
};

export const createUgroups = (payload: any) => {
  console.log("Creating new homepage");
  return api.post("/homepage", payload);
};

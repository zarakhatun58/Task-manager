import axios from "axios";

export const fetchDashboard = async () => {
  const { data } = await axios.get("/api/dashboard");
  return data;
};

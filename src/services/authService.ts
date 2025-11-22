import API from "./Api";

export const registerUser = async (name: string, email: string, password: string) => {
  const res = await API.post("/auth/register", { name, email, password });
  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await API.post("/auth/login", { email, password });
  return res.data;
};

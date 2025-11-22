import axios from "axios";

const API = axios.create({
  baseURL:"http://localhost:5000/api",
  // baseURL:"https://task-manager-r9ly.onrender.com/api"

});

// Attach Token Automatically
API.interceptors.request.use((config:any) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default API;

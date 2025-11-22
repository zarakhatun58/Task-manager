import api from "./Api"; // axios instance

export const fetchProjects = async () => {
  const res = await api.get("/projects");
  return res.data;
};

export const createProjectAPI = async (project: { name: string; teamId: string; description?: string }) => {
  const res = await api.post("/projects", project);
  return res.data;
};

export const updateProjectAPI = async (id: string, project: { name?: string; teamId?: string; description?: string }) => {
  const res = await api.put(`/projects/${id}`, project);
  return res.data;
};


export const deleteProjectAPI = async (id: string) => {
  const res = await api.delete(`/projects/${id}`);
  return res.data;
};

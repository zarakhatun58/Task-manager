import api from "./Api"; // axios instance

export const fetchTasks = async (filters?: { projectId?: string; memberId?: string; status?: string; priority?: string }) => {
  const params = filters || {};
  const res = await api.get("/tasks", { params });
  return res.data;
};

export const createTaskAPI = async (task: { title: string; description?: string; projectId: string; assignedTo?: string; priority?: string; status?: string }) => {
  const res = await api.post("/tasks", task);
  return res.data;
};

export const updateTaskAPI = async (taskId: string, updates: Partial<{ title: string; description: string; assignedTo: string; priority: string; status: string,  projectId: string; }>) => {
  const res = await api.put(`/tasks/${taskId}`, updates);
  return res.data;
};

export const deleteTaskAPI = async (taskId: string) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};

export const autoAssignTaskAPI = async (projectId: string) => {
  const res = await api.post("/tasks/auto-assign", { projectId });
  return res.data;
};

export const reassignTasksAPI = async () => {
  const res = await api.post("/tasks/reassign");
  return res.data;
};

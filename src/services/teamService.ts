import api from "./Api"; // axios instance
import { TeamMember } from "@/types";

export const fetchTeams = async () => {
  const res = await api.get("/teams");
  return res.data;
};

// Create Team
export const createTeamAPI = async (team: { name: string; members: TeamMember[] }) => {
  const res = await api.post("/teams", team);
  return res.data;
};

// Update Team
export const updateTeamAPI = async (id: string, team: { name: string; members: TeamMember[] }) => {
  const res = await api.put(`/teams/${id}`, team);
  return res.data;
};

// Delete Team
export const deleteTeamAPI = async (id: string) => {
  const res = await api.delete(`/teams/${id}`);
  return res.data;
};

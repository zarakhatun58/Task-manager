import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Team, TeamMember, Project, Task, ActivityLog } from '@/types';
import { sampleUsers, } from '@/data/sampleData';
import { loginUser, registerUser } from '@/services/authService';
import { createTeamAPI, deleteTeamAPI, fetchTeams, updateTeamAPI } from '@/services/teamService';
import { createProjectAPI, deleteProjectAPI, fetchProjects, updateProjectAPI } from '@/services/projectService';
import { fetchTasks } from '@/services/taskService';

interface AppContextType {
  currentUser: User | null;
   users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
 login: (email: string, password: string) => Promise<boolean>;
register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setTeams: React.Dispatch<React.SetStateAction<Team[]>>
  addTeam: (team: Team) => void;
  updateTeam: (teamId: string, updatedTeam: Team) => void;
  deleteTeam: (teamId: string) => void;
  addProject: (project: Project) => void;
  updateProject: (projectId: string, updatedProject: Project) => void;
  deleteProject: (projectId: string) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updatedTask: Task) => void;
  deleteTask: (taskId: string) => void;
  reassignTasks: () => void;
  getMemberById: (memberId: string) => TeamMember | undefined;
  getProjectById: (projectId: string) => Project | undefined;
  getTeamById: (teamId: string) => Team | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  // const [teams, setTeams] = useState<Team[]>(sampleTeams);
  const [teams, setTeams] = useState<Team[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
 const [tasks, setTasks] = useState<Task[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Auto-login first user for demo
  // useEffect(() => {
  //   if (!currentUser && users.length > 0) {
  //     setCurrentUser(users[0]);
  //   }
  // }, []);
  useEffect(() => {
  if (currentUser) {
    loadTeams();
    loadProjects();
    loadTasks();
  }
}, [currentUser]);



const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const res = await loginUser(email, password); // res = { token, user }

    localStorage.setItem("token", res.token);
    setCurrentUser(res.user);

    return true;
  } catch (err) {
    return false;
  }
};


  const logout = () => {
    setCurrentUser(null);
  };

const register = async (name: string, email: string, password: string): Promise<boolean> => {
  try {
    const res = await registerUser(name, email, password); // res = { token, user }

    localStorage.setItem("token", res.token);
    setCurrentUser(res.user);

    return true;
  } catch (err) {
    return false;
  }
};

const loadTeams = async () => {
  try {
    const data = await fetchTeams();
    setTeams(data);
  } catch (err) {
    console.error("Failed to load teams");
  }
};
  // CREATE TEAM
const addTeam = async (teamData: { name: string; members: TeamMember[] }) => {
  try {
    const newTeam = await createTeamAPI(teamData); // members are full objects
    setTeams(prev => [...prev, newTeam]);
  } catch (err) {
    console.error("Create team error", err);
  }
};

// UPDATE TEAM
const updateTeam = async (teamId: string, updatedTeam: { name: string; members: TeamMember[] }) => {
  try {
    const team = await updateTeamAPI(teamId, updatedTeam);
    setTeams(prev => prev.map(t => t._id === teamId ? team : t));
  } catch (err) {
    console.error("Update team error", err);
  }
};

// DELETE TEAM
const deleteTeam = async (teamId: string) => {
  try {
    await deleteTeamAPI(teamId);
    setTeams(prev => prev.filter(t => t._id !== teamId));
  } catch (err) {
    console.error("Delete team error");
  }
};


 const loadProjects = async () => {
  try {
    const data = await fetchProjects();
    setProjects(data);
  } catch (err) {
    console.error("Failed to load projects", err);
  }
};

// CREATE PROJECT
const addProject = async (projectData: { name: string; teamId: string; description?: string }) => {
  try {
    const newProject = await createProjectAPI(projectData);
    setProjects(prev => [...prev, newProject]);
  } catch (err) {
    console.error("Create project error", err);
  }
};

// UPDATE PROJECT
const updateProject = async (projectId: string, updatedProject: { name?: string; teamId?: string; description?: string }) => {
  try {
    const project = await updateProjectAPI(projectId, updatedProject);
    setProjects(prev => prev.map(p => p._id === projectId ? project : p));
  } catch (err) {
    console.error("Update project error", err);
  }
};

// DELETE PROJECT
const deleteProject = async (projectId: string) => {
  try {
    await deleteProjectAPI(projectId);
    setProjects(prev => prev.filter(p => p._id !== projectId));
    // Remove tasks linked to deleted project
    setTasks(prev => prev.filter(t => t.projectId !== projectId));
  } catch (err) {
    console.error("Delete project error", err);
  }
};
const loadTasks = async () => {
  try {
    const data = await fetchTasks();
    setTasks(data);
  } catch (err) {
    console.error("Failed to load tasks", err);
  }
};

const addTask = (task: Task) => {
  setTasks(prev => [...prev, task]);

  if (task.assignedTo) {
    updateMemberTaskCount(task.assignedTo, 1);
  }
};

const updateTask = (taskId: string, updatedTask: Task) => {
  setTasks(prev => {
    const oldTask = prev.find(t => t.id === taskId);

    if (oldTask && oldTask.assignedTo !== updatedTask.assignedTo) {
      if (oldTask.assignedTo) updateMemberTaskCount(oldTask.assignedTo, -1);
      if (updatedTask.assignedTo) updateMemberTaskCount(updatedTask.assignedTo, 1);
    }

    return prev.map(t => t.id === taskId ? updatedTask : t);
  });
};

const deleteTask = (taskId: string) => {
  setTasks(prev => {
    const task = prev.find(t => t.id === taskId);
    if (task?.assignedTo) updateMemberTaskCount(task.assignedTo, -1);
    return prev.filter(t => t.id !== taskId);
  });
};

const updateMemberTaskCount = (memberId: string, change: number) => {
  setTeams(prev =>
    prev.map(team => ({
      ...team,
      members: team.members.map(member =>
     member._id === memberId || member.id === memberId
          ? { ...member, currentTasks: Math.max(0, (member.currentTasks || 0) + change) }
          : member
      )
    }))
  );
};

  const getMemberById = (memberId: string): TeamMember | undefined => {
  for (const team of teams) {
    const member = team.members.find(m => m._id === memberId || m.id === memberId);
    if (member) return member;
  }
  return undefined;
};


  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p._id === projectId);
  };

  const getTeamById = (teamId: string): Team | undefined => {
    return teams.find(t => t._id === teamId);
  };

const reassignTasks = () => {
  const newLogs: ActivityLog[] = [];
  const updatedTasks = [...tasks];

  // Copy teams safely
  const teamsCopy = teams.map(team => ({
    ...team,
    members: team.members.map(m => ({ ...m }))
  }));

  const priorityValue = (priority: string) => {
    switch (priority) {
      case 'High': return 3;
      case 'Medium': return 2;
      case 'Low': return 1;
      default: return 2;
    }
  };

  teamsCopy.forEach(team => {
    const overloadedMembers = team.members.filter(m => (m.currentTasks || 0) > m.capacity);

    overloadedMembers.forEach(overloadedMember => {
     const memberTasks = updatedTasks
  .filter(t => t.assignedTo === overloadedMember._id && t.priority !== 'High')
        .sort((a, b) => priorityValue(a.priority) - priorityValue(b.priority));

      const excessCount = (overloadedMember.currentTasks || 0) - overloadedMember.capacity;
      let reassignedCount = 0;

      for (const task of memberTasks) {
        if (reassignedCount >= excessCount) break;

        const availableMember = team.members.find(m => m._id !== overloadedMember._id && (m.currentTasks || 0) < m.capacity);

        if (!availableMember) continue;

        const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
        if (taskIndex >= 0) {
          updatedTasks[taskIndex] = { ...task, assignedTo: availableMember };
          overloadedMember.currentTasks = Math.max(0, (overloadedMember.currentTasks || 0) - 1);
          availableMember.currentTasks = (availableMember.currentTasks || 0) + 1;
          reassignedCount++;

          newLogs.push({
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            timestamp: new Date(),
            action: 'reassigned',
            taskTitle: task.title,
            fromMember: overloadedMember.name,
            toMember: availableMember.name
          });
        }
      }
    });
  });

  setTasks(updatedTasks);
  setTeams(teamsCopy);
  setActivityLogs(prev => [...newLogs, ...prev].slice(0, 10));
}

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        teams,
         setTeams,    
        projects,
        tasks,
        activityLogs,
        login,
        logout,
        register,
        addTeam,
        updateTeam,
        deleteTeam,
        addProject,
        updateProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        reassignTasks,
        getMemberById,
        getProjectById,
        getTeamById,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

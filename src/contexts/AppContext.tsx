import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Team, TeamMember, Project, Task, ActivityLog } from '@/types';
import { sampleUsers, sampleTeams, sampleProjects, sampleTasks } from '@/data/sampleData';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  teams: Team[];
  projects: Project[];
  tasks: Task[];
  activityLogs: ActivityLog[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, password: string) => boolean;
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
  const [teams, setTeams] = useState<Team[]>(sampleTeams);
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Auto-login first user for demo
  useEffect(() => {
    if (!currentUser && users.length > 0) {
      setCurrentUser(users[0]);
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const register = (name: string, email: string, password: string): boolean => {
    if (users.some(u => u.email === email)) {
      return false;
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      password,
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const addTeam = (team: Team) => {
    setTeams([...teams, team]);
  };

  const updateTeam = (teamId: string, updatedTeam: Team) => {
    setTeams(teams.map(t => t.id === teamId ? updatedTeam : t));
  };

  const deleteTeam = (teamId: string) => {
    setTeams(teams.filter(t => t.id !== teamId));
  };

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  const updateProject = (projectId: string, updatedProject: Project) => {
    setProjects(projects.map(p => p.id === projectId ? updatedProject : p));
  };

  const deleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId));
    setTasks(tasks.filter(t => t.projectId !== projectId));
  };

  const addTask = (task: Task) => {
    setTasks([...tasks, task]);
    
    // Update member's current task count
    if (task.assignedTo !== 'unassigned') {
      updateMemberTaskCount(task.assignedTo, 1);
    }
  };

  const updateTask = (taskId: string, updatedTask: Task) => {
    const oldTask = tasks.find(t => t.id === taskId);
    
    // Update task counts if assignment changed
    if (oldTask && oldTask.assignedTo !== updatedTask.assignedTo) {
      if (oldTask.assignedTo !== 'unassigned') {
        updateMemberTaskCount(oldTask.assignedTo, -1);
      }
      if (updatedTask.assignedTo !== 'unassigned') {
        updateMemberTaskCount(updatedTask.assignedTo, 1);
      }
    }
    
    setTasks(tasks.map(t => t.id === taskId ? updatedTask : t));
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.assignedTo !== 'unassigned') {
      updateMemberTaskCount(task.assignedTo, -1);
    }
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const updateMemberTaskCount = (memberId: string, change: number) => {
    setTeams(teams.map(team => ({
      ...team,
      members: team.members.map(member =>
        member.id === memberId
          ? { ...member, currentTasks: Math.max(0, member.currentTasks + change) }
          : member
      )
    })));
  };

  const getMemberById = (memberId: string): TeamMember | undefined => {
    for (const team of teams) {
      const member = team.members.find(m => m.id === memberId);
      if (member) return member;
    }
    return undefined;
  };

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  const getTeamById = (teamId: string): Team | undefined => {
    return teams.find(t => t.id === teamId);
  };

  const reassignTasks = () => {
    const newLogs: ActivityLog[] = [];
    const updatedTasks = [...tasks];
    const teamsCopy = JSON.parse(JSON.stringify(teams)) as Team[];

    teamsCopy.forEach(team => {
      // Find overloaded members
      const overloadedMembers = team.members.filter(m => m.currentTasks > m.capacity);
      
      overloadedMembers.forEach(overloadedMember => {
        // Get tasks assigned to this member (only Low and Medium priority)
        const memberTasks = updatedTasks
          .filter(t => t.assignedTo === overloadedMember.id && t.priority !== 'High')
          .sort((a, b) => a.priority === 'Low' ? -1 : 1); // Low priority first

        const excessCount = overloadedMember.currentTasks - overloadedMember.capacity;
        let reassignedCount = 0;

        for (const task of memberTasks) {
          if (reassignedCount >= excessCount) break;

          // Find member with available capacity
          const availableMember = team.members.find(
            m => m.id !== overloadedMember.id && m.currentTasks < m.capacity
          );

          if (availableMember) {
            // Reassign task
            const taskIndex = updatedTasks.findIndex(t => t.id === task.id);
            updatedTasks[taskIndex] = { ...task, assignedTo: availableMember.id };

            // Update counts
            overloadedMember.currentTasks--;
            availableMember.currentTasks++;
            reassignedCount++;

            // Log activity
            newLogs.push({
              id: `log-${Date.now()}-${reassignedCount}`,
              timestamp: new Date(),
              action: 'reassigned',
              taskTitle: task.title,
              fromMember: overloadedMember.name,
              toMember: availableMember.name,
            });
          }
        }
      });
    });

    setTasks(updatedTasks);
    setTeams(teamsCopy);
    setActivityLogs([...newLogs, ...activityLogs].slice(0, 10));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        teams,
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

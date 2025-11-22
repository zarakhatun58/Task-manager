export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

export interface TeamMember {
    _id?: string;
  id: string;
  name: string;
  role: string;
  capacity: number;
  currentTasks: number;
}

export interface Team {
  _id: string;  
  name: string;
   members: any[];
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}


export interface Task {
  id: string;
  title: string;
  description: string;
  projectId: string;
  assignedTo: string; // member id or "unassigned"
  priority: "Low" | "Medium" | "High";
  status: "Pending" | "In Progress" | "Done";
  createdAt: Date;
}

export interface Project {
   _id: string;    
  name: string;
  description: string;
  teamId: string;
  createdBy: string;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  action: string;
  taskTitle: string;
  fromMember: string;
  toMember: string;
}

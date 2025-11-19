import { User, Team, TeamMember, Project, Task } from '@/types';

export const sampleUsers: User[] = [
  {
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: 'password123',
  },
  {
    id: 'user-2',
    name: 'Sarah Williams',
    email: 'sarah@example.com',
    password: 'password123',
  },
];

const teamMembers: TeamMember[] = [
  { id: 'member-1', name: 'Riya Sharma', role: 'Frontend Developer', capacity: 3, currentTasks: 4 },
  { id: 'member-2', name: 'Farhan Ali', role: 'Backend Developer', capacity: 5, currentTasks: 2 },
  { id: 'member-3', name: 'Maya Chen', role: 'UI/UX Designer', capacity: 4, currentTasks: 3 },
  { id: 'member-4', name: 'Arjun Patel', role: 'DevOps Engineer', capacity: 3, currentTasks: 1 },
];

export const sampleTeams: Team[] = [
  {
    id: 'team-1',
    name: 'Engineering Team',
    members: teamMembers,
    createdBy: 'user-1',
  },
];

export const sampleProjects: Project[] = [
  {
    id: 'project-1',
    name: 'E-Commerce Platform',
    description: 'Building a modern e-commerce platform with React and Node.js',
    teamId: 'team-1',
    createdBy: 'user-1',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'project-2',
    name: 'Mobile App Redesign',
    description: 'Redesigning the mobile app with new branding and features',
    teamId: 'team-1',
    createdBy: 'user-1',
    createdAt: new Date('2024-02-01'),
  },
];

export const sampleTasks: Task[] = [
  {
    id: 'task-1',
    title: 'UI Design for Homepage',
    description: 'Create modern homepage design with hero section',
    projectId: 'project-1',
    assignedTo: 'member-1',
    priority: 'High',
    status: 'In Progress',
    createdAt: new Date('2024-02-10'),
  },
  {
    id: 'task-2',
    title: 'Setup Authentication API',
    description: 'Implement JWT-based authentication',
    projectId: 'project-1',
    assignedTo: 'member-2',
    priority: 'High',
    status: 'In Progress',
    createdAt: new Date('2024-02-11'),
  },
  {
    id: 'task-3',
    title: 'Product Catalog Component',
    description: 'Build reusable product catalog component',
    projectId: 'project-1',
    assignedTo: 'member-1',
    priority: 'Medium',
    status: 'Pending',
    createdAt: new Date('2024-02-12'),
  },
  {
    id: 'task-4',
    title: 'Database Schema Design',
    description: 'Design database schema for products and orders',
    projectId: 'project-1',
    assignedTo: 'member-2',
    priority: 'High',
    status: 'Done',
    createdAt: new Date('2024-02-08'),
  },
  {
    id: 'task-5',
    title: 'User Flow Mapping',
    description: 'Map out complete user journey',
    projectId: 'project-2',
    assignedTo: 'member-3',
    priority: 'Medium',
    status: 'In Progress',
    createdAt: new Date('2024-02-13'),
  },
  {
    id: 'task-6',
    title: 'Checkout Page Design',
    description: 'Design intuitive checkout flow',
    projectId: 'project-1',
    assignedTo: 'member-1',
    priority: 'Low',
    status: 'Pending',
    createdAt: new Date('2024-02-14'),
  },
  {
    id: 'task-7',
    title: 'Payment Gateway Integration',
    description: 'Integrate Stripe payment gateway',
    projectId: 'project-1',
    assignedTo: 'member-2',
    priority: 'Low',
    status: 'Pending',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'task-8',
    title: 'Mobile Wireframes',
    description: 'Create wireframes for mobile app screens',
    projectId: 'project-2',
    assignedTo: 'member-3',
    priority: 'High',
    status: 'In Progress',
    createdAt: new Date('2024-02-09'),
  },
  {
    id: 'task-9',
    title: 'CI/CD Pipeline Setup',
    description: 'Setup automated deployment pipeline',
    projectId: 'project-1',
    assignedTo: 'member-4',
    priority: 'Medium',
    status: 'Done',
    createdAt: new Date('2024-02-07'),
  },
  {
    id: 'task-10',
    title: 'Color Palette Selection',
    description: 'Choose new brand colors for mobile app',
    projectId: 'project-2',
    assignedTo: 'member-3',
    priority: 'Low',
    status: 'Pending',
    createdAt: new Date('2024-02-16'),
  },
  {
    id: 'task-11',
    title: 'Shopping Cart Logic',
    description: 'Implement shopping cart state management',
    projectId: 'project-1',
    assignedTo: 'member-1',
    priority: 'Medium',
    status: 'Pending',
    createdAt: new Date('2024-02-17'),
  },
];

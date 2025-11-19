import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, CheckSquare, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Task } from '@/types';
import { toast } from '@/hooks/use-toast';
import './Tasks.css';

const Tasks: React.FC = () => {
  const { tasks, projects, teams, addTask, updateTask, deleteTask, getMemberById, getProjectById, getTeamById } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState('unassigned');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [status, setStatus] = useState<'Pending' | 'In Progress' | 'Done'>('Pending');
  const [filterProject, setFilterProject] = useState('all');
  const [filterMember, setFilterMember] = useState('all');
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedProjectId('');
    setSelectedMemberId('unassigned');
    setPriority('Medium');
    setStatus('Pending');
    setEditingTask(null);
    setShowWarning(false);
    setWarningMessage('');
  };

  const checkCapacity = (memberId: string) => {
    if (memberId === 'unassigned') {
      setShowWarning(false);
      return;
    }

    const member = getMemberById(memberId);
    if (member && member.currentTasks >= member.capacity) {
      setShowWarning(true);
      setWarningMessage(
        `${member.name} has ${member.currentTasks} tasks but capacity is ${member.capacity}. Assign anyway?`
      );
    } else {
      setShowWarning(false);
    }
  };

  const handleMemberChange = (memberId: string) => {
    setSelectedMemberId(memberId);
    checkCapacity(memberId);
  };

  const handleAutoAssign = () => {
    if (!selectedProjectId) {
      toast({
        title: "Select Project First",
        description: "Please select a project before auto-assigning",
        variant: "destructive",
      });
      return;
    }

    const project = getProjectById(selectedProjectId);
    if (!project) return;

    const team = getTeamById(project.teamId);
    if (!team) return;

    // Find member with lowest workload
    const availableMember = team.members
      .filter(m => m.currentTasks < m.capacity)
      .sort((a, b) => a.currentTasks - b.currentTasks)[0];

    if (availableMember) {
      setSelectedMemberId(availableMember.id);
      setShowWarning(false);
      toast({
        title: "Auto-assigned",
        description: `Task assigned to ${availableMember.name}`,
      });
    } else {
      toast({
        title: "No Available Members",
        description: "All team members are at or over capacity",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !selectedProjectId) {
      toast({
        title: "Invalid Task",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        ...editingTask,
        title,
        description,
        projectId: selectedProjectId,
        assignedTo: selectedMemberId,
        priority,
        status,
      });
      toast({
        title: "Task Updated",
        description: `${title} has been updated successfully`,
      });
    } else {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        description,
        projectId: selectedProjectId,
        assignedTo: selectedMemberId,
        priority,
        status,
        createdAt: new Date(),
      };
      addTask(newTask);
      toast({
        title: "Task Created",
        description: `${title} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setSelectedProjectId(task.projectId);
    setSelectedMemberId(task.assignedTo);
    setPriority(task.priority);
    setStatus(task.status);
    setIsDialogOpen(true);
  };

  const handleDelete = (taskId: string) => {
    deleteTask(taskId);
    toast({
      title: "Task Deleted",
      description: "Task has been deleted successfully",
    });
  };

  const filteredTasks = tasks.filter(task => {
    if (filterProject !== 'all' && task.projectId !== filterProject) return false;
    if (filterMember !== 'all' && task.assignedTo !== filterMember) return false;
    return true;
  });

  const allMembers = teams.flatMap(team => team.members);
  const selectedProject = selectedProjectId ? getProjectById(selectedProjectId) : null;
  const selectedTeam = selectedProject ? getTeamById(selectedProject.teamId) : null;

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return '';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Done': return 'status-done';
      case 'In Progress': return 'status-progress';
      case 'Pending': return 'status-pending';
      default: return '';
    }
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">Manage and track your tasks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="task-dialog">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="task-form">
              <div className="form-group">
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="UI Design for Homepage"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Task description..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <Label htmlFor="project">Project</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="form-group">
                <div className="assign-header">
                  <Label htmlFor="member">Assign To</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAutoAssign}>
                    Auto-assign
                  </Button>
                </div>
                <Select value={selectedMemberId} onValueChange={handleMemberChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {selectedTeam?.members.map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name} ({member.currentTasks}/{member.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {showWarning && (
                <Alert className="warning-alert">
                  <AlertTriangle size={16} />
                  <AlertDescription>{warningMessage}</AlertDescription>
                </Alert>
              )}

              <div className="form-row">
                <div className="form-group">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(val) => setPriority(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="form-group">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(val) => setStatus(val as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button type="submit" className="submit-button">
                {editingTask ? 'Update Task' : 'Create Task'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="filters">
        <Select value={filterProject} onValueChange={setFilterProject}>
          <SelectTrigger className="filter-select">
            <SelectValue placeholder="All Projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterMember} onValueChange={setFilterMember}>
          <SelectTrigger className="filter-select">
            <SelectValue placeholder="All Members" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {allMembers.map(member => (
              <SelectItem key={member.id} value={member.id}>
                {member.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="tasks-grid">
        {filteredTasks.map(task => {
          const project = getProjectById(task.projectId);
          const member = task.assignedTo !== 'unassigned' ? getMemberById(task.assignedTo) : null;
          
          return (
            <div key={task.id} className="task-card">
              <div className="task-header">
                <div className="task-badges">
                  <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                  <span className={`status-badge ${getStatusClass(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <div className="task-actions">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(task)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <h3 className="task-title">{task.title}</h3>
              <p className="task-description">{task.description}</p>

              <div className="task-footer">
                <div className="task-meta">
                  <span className="meta-item">📁 {project?.name}</span>
                  <span className="meta-item">
                    👤 {member ? member.name : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Tasks;

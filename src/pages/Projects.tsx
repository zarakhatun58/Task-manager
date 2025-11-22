import React, { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FolderKanban, Trash2, Edit } from 'lucide-react';
import { Project } from '@/types';
import { toast } from '@/hooks/use-toast';
import './Projects.css';
import { createProjectAPI } from '@/services/projectService';

const Projects: React.FC = () => {
  const { projects, teams,tasks, addProject, updateProject, deleteProject, currentUser } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');

  const resetForm = () => {
    setProjectName('');
    setDescription('');
    setSelectedTeamId('');
    setEditingProject(null);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!projectName || !selectedTeamId) {
    toast({
      title: "Invalid Project",
      description: "Please fill in all required fields",
      variant: "destructive",
    });
    return;
  }

  try {
    if (editingProject) {
  const updatedProject: Project = {
    ...editingProject,
    name: projectName,
    description,
    teamId: selectedTeamId,
  };
   await updateProject(editingProject._id, updatedProject);

      toast({
        title: "Project Updated",
        description: `${projectName} has been updated successfully`,
      });
      // Update in local state
      // addProject or updateProject in your app context should handle this
    } else {
      // Create project
      const createdProject: Project = await createProjectAPI({
        name: projectName,
        description,
        teamId: selectedTeamId,
      });

      // Ensure createdProject has _id, createdBy, createdAt
      addProject(createdProject);

      toast({
        title: "Project Created",
        description: `${projectName} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to save project",
      variant: "destructive",
    });
    console.error(err);
  }
};




  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setDescription(project.description);
    setSelectedTeamId(project.teamId);
    setIsDialogOpen(true);
  };

  const handleDelete = async (projectId: string) => {
    try {
      await deleteProject(projectId);
      toast({
        title: "Project Deleted",
        description: "Project and all associated tasks have been deleted",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">Manage your projects and track progress</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="project-form">
              <div className="form-group">
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="E-Commerce Platform"
                  required
                />
              </div>

              <div className="form-group">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Project description..."
                  rows={4}
                />
              </div>

              <div className="form-group">
                <Label htmlFor="team">Team</Label>
                <Select value={selectedTeamId} onValueChange={setSelectedTeamId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map(team => (
                      <SelectItem key={team._id} value={team._id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="submit-button">
                {editingProject ? 'Update Project' : 'Create Project'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="projects-grid">
        {projects.map(project => {
          const team = teams.find(t => t._id === project.teamId);
          const projectTasks = tasks.filter((t:any) => t.projectId === project._id);
          const completedTasks = projectTasks.filter((t:any) => t.status === 'Done').length;
          
          return (
            <div key={project._id} className="project-card">
              <div className="project-card-header">
                <div className="project-icon">
                  <FolderKanban size={24} />
                </div>
                <div className="project-info">
                  <h3 className="project-name">{project.name}</h3>
                  <p className="project-team">{team?.name}</p>
                </div>
                <div className="project-actions">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(project)}>
                    <Edit size={16} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(project._id)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <p className="project-description">{project.description}</p>

              <div className="project-stats">
                <div className="stat-item">
                  <span className="stat-label">Tasks</span>
                  <span className="stat-value">{projectTasks.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Completed</span>
                  <span className="stat-value">{completedTasks}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Team Size</span>
                  <span className="stat-value">{team?.members.length || 0}</span>
                </div>
              </div>

              <div className="progress-section">
                <div className="progress-header">
                  <span className="progress-label">Progress</span>
                  <span className="progress-percentage">
                    {projectTasks.length > 0
                      ? Math.round((completedTasks / projectTasks.length) * 100)
                      : 0}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${projectTasks.length > 0 
                        ? (completedTasks / projectTasks.length) * 100 
                        : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Projects;

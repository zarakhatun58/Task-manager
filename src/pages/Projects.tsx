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

const Projects: React.FC = () => {
  const { projects, teams, tasks, addProject, updateProject, deleteProject, currentUser } = useApp();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName || !selectedTeamId) {
      toast({
        title: "Invalid Project",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (editingProject) {
      updateProject(editingProject.id, {
        ...editingProject,
        name: projectName,
        description,
        teamId: selectedTeamId,
      });
      toast({
        title: "Project Updated",
        description: `${projectName} has been updated successfully`,
      });
    } else {
      const newProject: Project = {
        id: `project-${Date.now()}`,
        name: projectName,
        description,
        teamId: selectedTeamId,
        createdBy: currentUser?.id || '',
        createdAt: new Date(),
      };
      addProject(newProject);
      toast({
        title: "Project Created",
        description: `${projectName} has been created successfully`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.name);
    setDescription(project.description);
    setSelectedTeamId(project.teamId);
    setIsDialogOpen(true);
  };

  const handleDelete = (projectId: string) => {
    deleteProject(projectId);
    toast({
      title: "Project Deleted",
      description: "Project and all associated tasks have been deleted",
    });
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
                      <SelectItem key={team.id} value={team.id}>
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
          const team = teams.find(t => t.id === project.teamId);
          const projectTasks = tasks.filter(t => t.projectId === project.id);
          const completedTasks = projectTasks.filter(t => t.status === 'Done').length;
          
          return (
            <div key={project.id} className="project-card">
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
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)}>
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

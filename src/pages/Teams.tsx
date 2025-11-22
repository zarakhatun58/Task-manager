import React, { useEffect, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users as UsersIcon, Trash2, Edit } from 'lucide-react';
import { Team, TeamMember } from '@/types';
import { toast } from '@/hooks/use-toast';
import './Teams.css';
import { createTeamAPI, deleteTeamAPI, fetchTeams, updateTeamAPI } from '@/services/teamService';

const Teams: React.FC = () => {
  // const { teams, addTeam, updateTeam, deleteTeam, currentUser } = useApp();
  const { teams, setTeams } = useApp();   // you MUST expose setTeams in context
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [newMember, setNewMember] = useState({ name: '', role: '', capacity: 3 });

  // ============= LOAD TEAMS FROM BACKEND =============
  useEffect(() => {
    (async () => {
      const data = await fetchTeams();
      setTeams(data);
    })();
  }, []);

  const resetForm = () => {
    setTeamName('');
    setMembers([]);
    setNewMember({ name: '', role: '', capacity: 3 });
    setEditingTeam(null);
  };

  // ============= ADD MEMBER =============
  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) {
      toast({
        title: "Invalid Member",
        description: "Please fill in all member details",
        variant: "destructive",
      });
      return;
    }

    const member: TeamMember = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      role: newMember.role,
      capacity: newMember.capacity,
      currentTasks: 0,
    };

    setMembers(prev => [...prev, member]);
    setNewMember({ name: '', role: '', capacity: 3 });
  };

  const handleRemoveMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  // ============= SUBMIT TEAM (CREATE / UPDATE) =============
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!teamName || members.length === 0) {
    toast({
      title: "Invalid Team",
      description: "Team must have a name and at least one member",
      variant: "destructive",
    });
    return;
  }

  try {
    if (editingTeam) {
      const updated = await updateTeamAPI(editingTeam._id, {
        name: teamName,
        members, // full objects
      });

      setTeams(prev => prev.map(t => t._id === updated._id ? updated : t));

      toast({ title: "Team Updated", description: `${teamName} updated successfully` });

    } else {
      const newTeam = await createTeamAPI({
        name: teamName,
        members, // full objects here too
      });

      setTeams(prev => [...prev, newTeam]);

      toast({ title: "Team Created", description: `${teamName} created successfully` });
    }

    setIsDialogOpen(false);
    resetForm();

  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to save team",
      variant: "destructive",
    });
    console.error(err);
  }
};


  // ============= EDIT TEAM =============
  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setMembers(team.members);
    setIsDialogOpen(true);
  };

  // ============= DELETE TEAM =============
  const handleDelete = async (teamId: string) => {
    await deleteTeamAPI(teamId);

    setTeams(prev => prev.filter(t => t._id !== teamId));

    toast({ title: "Team Deleted", description: "Team has been deleted" });
  };


  return (
    <div className="teams-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teams</h1>
          <p className="page-subtitle">Manage your teams and members</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="team-dialog">
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="team-form">
              <div className="form-group">
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Engineering Team"
                  required
                />
              </div>

              <div className="members-section">
                <h3 className="section-title">Team Members</h3>
                
                <div className="add-member-form">
                  <Input
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Member name"
                  />
                  <Input
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value })}
                    placeholder="Role"
                  />
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={newMember.capacity}
                    onChange={(e) => setNewMember({ ...newMember, capacity: parseInt(e.target.value) })}
                    placeholder="Capacity"
                  />
                  <Button type="button" onClick={handleAddMember} variant="secondary">
                    Add
                  </Button>
                </div>

                <div className="members-list">
                  {members.map(member => (
                    <div key={member.id} className="member-card">
                      <div>
                        <p className="member-name">{member.name}</p>
                        <p className="member-details">
                          {member.role} • Capacity: {member.capacity}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Button type="submit" className="submit-button">
                {editingTeam ? 'Update Team' : 'Create Team'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="teams-grid">
        {teams.map(team => (
          <div key={team._id} className="team-card">
            <div className="team-card-header">
              <div className="team-icon">
                <UsersIcon size={24} />
              </div>
              <div className="team-info">
                <h3 className="team-name">{team.name}</h3>
                <p className="team-meta">{team.members.length} members</p>
              </div>
              <div className="team-actions">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(team)}>
                  <Edit size={16} />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(team._id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="team-members">
              {team.members.map(member => (
                <div key={member.id} className="team-member-item">
                  <div>
                    <p className="member-name">{member.name}</p>
                    <p className="member-role">{member.role}</p>
                  </div>
                  <div className="member-capacity">
                    <span className={member.currentTasks > member.capacity ? 'overloaded' : ''}>
                      {member.currentTasks} / {member.capacity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teams;

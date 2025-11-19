import React from 'react';
import { useApp } from '@/contexts/AppContext';
import { BarChart3, CheckCircle2, Users, FolderKanban, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { projects, tasks, teams, activityLogs, reassignTasks } = useApp();

  const handleReassign = () => {
    reassignTasks();
    toast({
      title: "Tasks Reassigned",
      description: "Tasks have been automatically balanced across team members.",
    });
  };

  const allMembers = teams.flatMap(team => team.members);
  const overloadedMembers = allMembers.filter(m => m.currentTasks > m.capacity);

  const stats = [
    {
      icon: FolderKanban,
      label: 'Total Projects',
      value: projects.length,
      color: 'primary',
    },
    {
      icon: CheckCircle2,
      label: 'Total Tasks',
      value: tasks.length,
      color: 'success',
    },
    {
      icon: Users,
      label: 'Team Members',
      value: allMembers.length,
      color: 'warning',
    },
    {
      icon: BarChart3,
      label: 'Overloaded',
      value: overloadedMembers.length,
      color: 'destructive',
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of your projects and team performance</p>
        </div>
        <Button onClick={handleReassign} className="reassign-button">
          <RefreshCw size={18} />
          Reassign Tasks
        </Button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card stat-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">{stat.label}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2 className="card-title">Team Summary</h2>
          <div className="team-summary">
            {allMembers.map(member => {
              const percentage = (member.currentTasks / member.capacity) * 100;
              const isOverloaded = member.currentTasks > member.capacity;
              
              return (
                <div key={member.id} className="member-item">
                  <div className="member-info">
                    <p className="member-name">{member.name}</p>
                    <p className="member-role">{member.role}</p>
                  </div>
                  <div className="member-capacity">
                    <div className="capacity-text">
                      <span className={isOverloaded ? 'overloaded' : ''}>
                        {member.currentTasks} / {member.capacity}
                      </span>
                    </div>
                    <div className="capacity-bar">
                      <div
                        className={`capacity-fill ${isOverloaded ? 'overloaded' : ''}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dashboard-card">
          <h2 className="card-title">Recent Activity</h2>
          {activityLogs.length === 0 ? (
            <p className="empty-state">No recent reassignments</p>
          ) : (
            <div className="activity-list">
              {activityLogs.slice(0, 5).map(log => (
                <div key={log.id} className="activity-item">
                  <div className="activity-time">
                    {new Date(log.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  <div className="activity-content">
                    Task <strong>"{log.taskTitle}"</strong> reassigned from{' '}
                    <strong>{log.fromMember}</strong> to{' '}
                    <strong>{log.toMember}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

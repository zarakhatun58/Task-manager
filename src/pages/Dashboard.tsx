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

  // -----------------------------------
  // NORMALIZED TEAM MEMBERS (safe IDs)
  // -----------------------------------
 const allMembers = teams.flatMap(team =>
  team.members.map(m => {
    const taskCount = tasks.filter(t => t.assignedTo === m._id).length;

    return {
      ...m,
      id: m._id || m.id,
      currentTasks: taskCount,
      capacity: m.capacity || 0,
    };
  })
);


  const overloadedMembers = allMembers.filter(
    m => m.currentTasks > m.capacity
  );

  // -----------------------------------
  // DASHBOARD STATS
  // -----------------------------------
  const stats = [
    {
      icon: FolderKanban,
      label: "Total Projects",
      value: projects.length,
      color: "primary",
    },
    {
      icon: CheckCircle2,
      label: "Total Tasks",
      value: tasks.length,
      color: "success",
    },
    {
      icon: Users,
      label: "Team Members",
      value: allMembers.length,
      color: "warning",
    },
    {
      icon: BarChart3,
      label: "Overloaded Members",
      value: overloadedMembers.length,
      color: "destructive",
    },
  ];

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Overview of your projects and team performance
          </p>
        </div>

        <Button onClick={handleReassign} className="reassign-button">
          <RefreshCw size={18} />
          Reassign Tasks
        </Button>
      </div>

      {/* Stats */}
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

      {/* Team and Activity */}
      <div className="dashboard-grid">
        {/* TEAM SUMMARY */}
        <div className="dashboard-card">
          <h2 className="card-title">Team Summary</h2>

          {allMembers.length === 0 ? (
            <p className="empty-state">No members found</p>
          ) : (
            <div className="team-summary">
              {allMembers.map(member => {
                const percentage =
                  member.capacity > 0
                    ? (member.currentTasks / member.capacity) * 100
                    : 0;

                const isOverloaded = member.currentTasks > member.capacity;

                return (
                  <div key={member.id} className="member-item">
                    <div className="member-info">
                      <p className="member-name">{member.name}</p>
                      <p className="member-role">{member.role}</p>
                    </div>

                    <div className="member-capacity">
                      <div className="capacity-text">
                        <span className={isOverloaded ? "overloaded" : ""}>
                          {member.currentTasks} / {member.capacity}
                        </span>
                      </div>

                      <div className="capacity-bar">
                        <div
                          className={`capacity-fill ${
                            isOverloaded ? "overloaded" : ""
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACTIVITY LOGS */}
        <div className="dashboard-card">
          <h2 className="card-title">Recent Activity</h2>

          {activityLogs.length === 0 ? (
            <p className="empty-state">No recent activity</p>
          ) : (
            <div className="activity-list">
              {activityLogs.slice(0, 5).map(log => (
                <div key={log.id} className="activity-item">
                  <div className="activity-time">
                    {new Date(log.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  <div className="activity-content">
                    Task <strong>"{log.taskTitle}"</strong> reassigned from{" "}
                    <strong>{log.fromMember}</strong> to{" "}
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

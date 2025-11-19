let activityLogs = [];

export const logActivity = (message) => {
  activityLogs.unshift({
    message,
    time: new Date().toLocaleTimeString()
  });

  if (activityLogs.length > 20) activityLogs.pop();
};

export const getActivityLogs = () => activityLogs.slice(0, 10);

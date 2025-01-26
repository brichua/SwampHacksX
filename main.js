const groupData = groupDoc.data();
      const totalTasks = groupData.tasks.length;
      const completedTasks = groupData.tasks.filter(task => task.completed).length;
  
      // Calculate progress as a percentage
      const progressPercentage = (completedTasks / totalTasks) * 100;
  
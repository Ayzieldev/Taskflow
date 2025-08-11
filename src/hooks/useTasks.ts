import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/taskService';
import { DailyTask, WeeklyTask } from '@/types';

// Query keys
export const taskKeys = {
  all: ['tasks'] as const,
  daily: () => [...taskKeys.all, 'daily'] as const,
  weekly: () => [...taskKeys.all, 'weekly'] as const,
  todayWeekly: () => [...taskKeys.all, 'weekly', 'today'] as const,
  statistics: () => [...taskKeys.all, 'statistics'] as const,
};

// Custom hook to get all daily tasks
export const useDailyTasks = () => {
  return useQuery({
    queryKey: taskKeys.daily(),
    queryFn: taskService.getDailyTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Custom hook to get all weekly tasks
export const useWeeklyTasks = () => {
  return useQuery({
    queryKey: taskKeys.weekly(),
    queryFn: taskService.getWeeklyTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Custom hook to get today's weekly tasks
export const useTodayWeeklyTasks = () => {
  return useQuery({
    queryKey: taskKeys.todayWeekly(),
    queryFn: taskService.getTodayWeeklyTasks,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Custom hook to get task statistics
export const useTaskStatistics = () => {
  return useQuery({
    queryKey: taskKeys.statistics(),
    queryFn: taskService.getTaskStatistics,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Custom hook to create a daily task
export const useCreateDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createDailyTask,
    onSuccess: (newTask) => {
      // Optimistically update the daily tasks list
      queryClient.setQueryData(taskKeys.daily(), (oldTasks: DailyTask[] | undefined) => {
        return oldTasks ? [newTask, ...oldTasks] : [newTask];
      });

      // Invalidate and refetch statistics
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (error) => {
      console.error('Error creating daily task:', error);
    },
  });
};

// Custom hook to create a weekly task
export const useCreateWeeklyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createWeeklyTask,
    onSuccess: (newTask) => {
      // Optimistically update the weekly tasks list
      queryClient.setQueryData(taskKeys.weekly(), (oldTasks: WeeklyTask[] | undefined) => {
        return oldTasks ? [newTask, ...oldTasks] : [newTask];
      });

      // Invalidate and refetch statistics and today's tasks
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
      queryClient.invalidateQueries({ queryKey: taskKeys.todayWeekly() });
    },
    onError: (error) => {
      console.error('Error creating weekly task:', error);
    },
  });
};

// Custom hook to update a daily task
export const useUpdateDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<DailyTask> }) =>
      taskService.updateDailyTask(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.daily() });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.daily());

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.daily(), (oldTasks: DailyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        );
      });

      return { previousTasks };
    },
    onSuccess: (updatedTask) => {
      // Update the cache with the server response
      queryClient.setQueryData(taskKeys.daily(), (oldTasks: DailyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      // Only invalidate statistics, not the main tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.daily(), context.previousTasks);
      }
    },
  });
};

// Custom hook to update a weekly task
export const useUpdateWeeklyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<WeeklyTask> }) =>
      taskService.updateWeeklyTask(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.weekly() });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.weekly());

      // Optimistically update to the new value
      queryClient.setQueryData(taskKeys.weekly(), (oldTasks: WeeklyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === id ? { ...task, ...updates, updatedAt: new Date() } : task
        );
      });

      return { previousTasks };
    },
    onSuccess: (updatedTask) => {
      // Update the cache with the server response
      queryClient.setQueryData(taskKeys.weekly(), (oldTasks: WeeklyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      // Only invalidate statistics, not the main tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.weekly(), context.previousTasks);
      }
    },
  });
};

// Custom hook to delete a daily task
export const useDeleteDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteDailyTask,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.daily() });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.daily());

      // Optimistically remove the task from the list
      queryClient.setQueryData(taskKeys.daily(), (oldTasks: DailyTask[] | undefined) => {
        return oldTasks ? oldTasks.filter(task => task.id !== id) : oldTasks;
      });

      return { previousTasks };
    },
    onSuccess: () => {
      // Only invalidate statistics, not the main tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.daily(), context.previousTasks);
      }
    },
  });
};

// Custom hook to delete a weekly task
export const useDeleteWeeklyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteWeeklyTask,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.weekly() });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.weekly());

      // Optimistically remove the task from the list
      queryClient.setQueryData(taskKeys.weekly(), (oldTasks: WeeklyTask[] | undefined) => {
        return oldTasks ? oldTasks.filter(task => task.id !== id) : oldTasks;
      });

      return { previousTasks };
    },
    onSuccess: () => {
      // Only invalidate statistics, not the main tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.weekly(), context.previousTasks);
      }
    },
  });
};

// Custom hook to toggle daily task completion
export const useToggleDailyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.toggleDailyTask,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.daily() });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.daily());

      // Optimistically update the task
      queryClient.setQueryData(taskKeys.daily(), (oldTasks: DailyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === id 
            ? { 
                ...task, 
                completed: !task.completed,
                streak: !task.completed ? task.streak + 1 : Math.max(0, task.streak - 1),
                updatedAt: new Date()
              } 
            : task
        );
      });

      return { previousTasks };
    },
    onSuccess: (updatedTask) => {
      // Update the cache with the server response
      queryClient.setQueryData(taskKeys.daily(), (oldTasks: DailyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      // Only invalidate statistics, not the main tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.daily(), context.previousTasks);
      }
    },
  });
};

// Custom hook to toggle weekly task completion
export const useToggleWeeklyTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.toggleWeeklyTask,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: taskKeys.weekly() });
      await queryClient.cancelQueries({ queryKey: taskKeys.todayWeekly() });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData(taskKeys.weekly());
      const previousTodayTasks = queryClient.getQueryData(taskKeys.todayWeekly());

      // Optimistically update the task in both weekly and today's tasks
      queryClient.setQueryData(taskKeys.weekly(), (oldTasks: WeeklyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === id 
            ? { 
                ...task, 
                completed: !task.completed,
                streak: !task.completed ? task.streak + 1 : Math.max(0, task.streak - 1),
                updatedAt: new Date()
              } 
            : task
        );
      });

      queryClient.setQueryData(taskKeys.todayWeekly(), (oldTasks: WeeklyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === id 
            ? { 
                ...task, 
                completed: !task.completed,
                streak: !task.completed ? task.streak + 1 : Math.max(0, task.streak - 1),
                updatedAt: new Date()
              } 
            : task
        );
      });

      return { previousTasks, previousTodayTasks };
    },
    onSuccess: (updatedTask) => {
      // Update the cache with the server response for both queries
      queryClient.setQueryData(taskKeys.weekly(), (oldTasks: WeeklyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      queryClient.setQueryData(taskKeys.todayWeekly(), (oldTasks: WeeklyTask[] | undefined) => {
        if (!oldTasks) return oldTasks;
        return oldTasks.map(task =>
          task.id === updatedTask.id ? updatedTask : task
        );
      });

      // Only invalidate statistics, not the main tasks list
      queryClient.invalidateQueries({ queryKey: taskKeys.statistics() });
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(taskKeys.weekly(), context.previousTasks);
      }
      if (context?.previousTodayTasks) {
        queryClient.setQueryData(taskKeys.todayWeekly(), context.previousTodayTasks);
      }
    },
  });
}; 
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { goalService } from '@/services/goalService';
import { Goal, TaskBlock, Subtask } from '@/types';

// Query keys
export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (filters: string) => [...goalKeys.lists(), { filters }] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
};

// Custom hook to get all goals
export const useGoals = () => {
  return useQuery({
    queryKey: goalKeys.lists(),
    queryFn: goalService.getGoals,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Custom hook to get a single goal
export const useGoal = (id: string) => {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalService.getGoal(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Custom hook to create a goal
export const useCreateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.createGoal,
    onSuccess: (newGoal) => {
      // Optimistically update the goals list
      queryClient.setQueryData(goalKeys.lists(), (oldGoals: Goal[] | undefined) => {
        return oldGoals ? [newGoal, ...oldGoals] : [newGoal];
      });

      // Invalidate and refetch goals list
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating goal:', error);
    },
  });
};

// Custom hook to update a goal
export const useUpdateGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Goal> }) =>
      goalService.updateGoal(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.detail(id) });

      // Snapshot the previous value
      const previousGoal = queryClient.getQueryData(goalKeys.detail(id));

      // Optimistically update to the new value
      queryClient.setQueryData(goalKeys.detail(id), (old: Goal | undefined) => {
        return old ? { ...old, ...updates, updatedAt: new Date().toISOString() } : undefined;
      });

      // Also update the goals list
      queryClient.setQueryData(goalKeys.lists(), (oldGoals: Goal[] | undefined) => {
        if (!oldGoals) return oldGoals;
        return oldGoals.map(goal => 
          goal.id === id ? { ...goal, ...updates, updatedAt: new Date().toISOString() } : goal
        );
      });

      return { previousGoal };
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGoal) {
        queryClient.setQueryData(goalKeys.detail(id), context.previousGoal);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to delete a goal
export const useDeleteGoal = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.deleteGoal,
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: goalKeys.lists() });

      // Snapshot the previous value
      const previousGoals = queryClient.getQueryData(goalKeys.lists());

      // Optimistically remove the goal from the list
      queryClient.setQueryData(goalKeys.lists(), (oldGoals: Goal[] | undefined) => {
        return oldGoals ? oldGoals.filter(goal => goal.id !== id) : oldGoals;
      });

      return { previousGoals };
    },
    onError: (err, id, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousGoals) {
        queryClient.setQueryData(goalKeys.lists(), context.previousGoals);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to add a task block
export const useAddTaskBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, taskBlock }: { goalId: string; taskBlock: Omit<TaskBlock, 'id'> }) =>
      goalService.addTaskBlock(goalId, taskBlock),
    onSuccess: (newTaskBlock, { goalId }) => {
      // Update the goal's task blocks
      queryClient.setQueryData(goalKeys.detail(goalId), (oldGoal: Goal | undefined) => {
        if (!oldGoal) return oldGoal;
        return {
          ...oldGoal,
          taskBlocks: [...oldGoal.taskBlocks, newTaskBlock],
          updatedAt: new Date().toISOString(),
        };
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to update a task block
export const useUpdateTaskBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, taskBlockId, updates }: { goalId: string; taskBlockId: string; updates: Partial<TaskBlock> }) =>
      goalService.updateTaskBlock(goalId, taskBlockId, updates),
    onMutate: async ({ goalId, taskBlockId, updates }) => {
      await queryClient.cancelQueries({ queryKey: goalKeys.detail(goalId) });

      const previousGoal = queryClient.getQueryData(goalKeys.detail(goalId));

      // Optimistically update the task block
      queryClient.setQueryData(goalKeys.detail(goalId), (oldGoal: Goal | undefined) => {
        if (!oldGoal) return oldGoal;
        return {
          ...oldGoal,
          taskBlocks: oldGoal.taskBlocks.map(task =>
            task.id === taskBlockId ? { ...task, ...updates } : task
          ),
          updatedAt: new Date().toISOString(),
        };
      });

      return { previousGoal };
    },
    onError: (err, { goalId }, context) => {
      if (context?.previousGoal) {
        queryClient.setQueryData(goalKeys.detail(goalId), context.previousGoal);
      }
    },
    onSettled: (data, error, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to delete a task block
export const useDeleteTaskBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, taskBlockId }: { goalId: string; taskBlockId: string }) =>
      goalService.deleteTaskBlock(goalId, taskBlockId),
    onSuccess: (data, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to add a subtask
export const useAddSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, taskBlockId, subtask }: { goalId: string; taskBlockId: string; subtask: Omit<Subtask, 'id'> }) =>
      goalService.addSubtask(goalId, taskBlockId, subtask),
    onSuccess: (newSubtask, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to update a subtask
export const useUpdateSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, taskBlockId, subtaskId, updates }: { goalId: string; taskBlockId: string; subtaskId: string; updates: Partial<Subtask> }) =>
      goalService.updateSubtask(goalId, taskBlockId, subtaskId, updates),
    onSuccess: (data, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to delete a subtask
export const useDeleteSubtask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, taskBlockId, subtaskId }: { goalId: string; taskBlockId: string; subtaskId: string }) =>
      goalService.deleteSubtask(goalId, taskBlockId, subtaskId),
    onSuccess: (data, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
};

// Custom hook to update goal progress
export const useUpdateGoalProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: goalService.updateGoalProgress,
    onSuccess: (updatedGoal) => {
      // Update both the individual goal and the goals list
      queryClient.setQueryData(goalKeys.detail(updatedGoal.id), updatedGoal);
      queryClient.setQueryData(goalKeys.lists(), (oldGoals: Goal[] | undefined) => {
        if (!oldGoals) return oldGoals;
        return oldGoals.map(goal => 
          goal.id === updatedGoal.id ? updatedGoal : goal
        );
      });
    },
  });
}; 
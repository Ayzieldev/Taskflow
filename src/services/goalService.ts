import { Goal, TaskBlock, Subtask } from '@/types';

// Local storage keys
const GOALS_STORAGE_KEY = 'goals';

// Simulate API delay for better UX
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to get goals from localStorage
const getGoalsFromStorage = (): Goal[] => {
  try {
    const stored = localStorage.getItem(GOALS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading goals from localStorage:', error);
    return [];
  }
};

// Helper function to save goals to localStorage
const saveGoalsToStorage = (goals: Goal[]): void => {
  try {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (error) {
    console.error('Error saving goals to localStorage:', error);
  }
};

// Goal Service API
export const goalService = {
  // Get all goals
  async getGoals(): Promise<Goal[]> {
    await delay(300); // Simulate network delay
    return getGoalsFromStorage();
  },

  // Get a single goal by ID
  async getGoal(id: string): Promise<Goal | null> {
    await delay(200);
    const goals = getGoalsFromStorage();
    return goals.find(goal => goal.id === id) || null;
  },

  // Create a new goal
  async createGoal(goalData: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Goal> {
    await delay(500);
    const goals = getGoalsFromStorage();
    
    const localId = Date.now().toString();
    const newGoal: Goal = {
      ...goalData,
      id: localId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    goals.push(newGoal);
    saveGoalsToStorage(goals);

    return newGoal;
  },

  // Update an existing goal
  async updateGoal(id: string, updates: Partial<Goal>): Promise<Goal> {
    await delay(400);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === id);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const updatedGoal: Goal = {
      ...goals[goalIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    goals[goalIndex] = updatedGoal;
    saveGoalsToStorage(goals);

    return updatedGoal;
  },

  // Delete a goal
  async deleteGoal(id: string): Promise<void> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const filteredGoals = goals.filter(goal => goal.id !== id);
    saveGoalsToStorage(filteredGoals);
  },

  // Add a task block to a goal
  async addTaskBlock(goalId: string, taskBlock: Omit<TaskBlock, 'id'>): Promise<TaskBlock> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const newTaskBlock: TaskBlock = {
      ...taskBlock,
      id: Date.now().toString(),
    };

    goals[goalIndex].taskBlocks.push(newTaskBlock);
    goals[goalIndex].updatedAt = new Date().toISOString();
    saveGoalsToStorage(goals);
    
    return newTaskBlock;
  },

  // Update a task block
  async updateTaskBlock(goalId: string, taskBlockId: string, updates: Partial<TaskBlock>): Promise<TaskBlock> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const taskBlockIndex = goals[goalIndex].taskBlocks.findIndex(task => task.id === taskBlockId);
    
    if (taskBlockIndex === -1) {
      throw new Error('Task block not found');
    }

    const updatedTaskBlock: TaskBlock = {
      ...goals[goalIndex].taskBlocks[taskBlockIndex],
      ...updates,
    };

    goals[goalIndex].taskBlocks[taskBlockIndex] = updatedTaskBlock;
    goals[goalIndex].updatedAt = new Date().toISOString();
    saveGoalsToStorage(goals);
    
    return updatedTaskBlock;
  },

  // Delete a task block
  async deleteTaskBlock(goalId: string, taskBlockId: string): Promise<void> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    goals[goalIndex].taskBlocks = goals[goalIndex].taskBlocks.filter(
      task => task.id !== taskBlockId
    );
    goals[goalIndex].updatedAt = new Date().toISOString();
    saveGoalsToStorage(goals);
  },

  // Add a subtask to a grouped task block
  async addSubtask(goalId: string, taskBlockId: string, subtask: Omit<Subtask, 'id'>): Promise<Subtask> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const taskBlockIndex = goals[goalIndex].taskBlocks.findIndex(task => task.id === taskBlockId);
    
    if (taskBlockIndex === -1) {
      throw new Error('Task block not found');
    }

    const newSubtask: Subtask = {
      ...subtask,
      id: Date.now().toString(),
    };

    if (!goals[goalIndex].taskBlocks[taskBlockIndex].subtasks) {
      goals[goalIndex].taskBlocks[taskBlockIndex].subtasks = [];
    }

    goals[goalIndex].taskBlocks[taskBlockIndex].subtasks!.push(newSubtask);
    goals[goalIndex].updatedAt = new Date().toISOString();
    saveGoalsToStorage(goals);
    
    return newSubtask;
  },

  // Update a subtask
  async updateSubtask(goalId: string, taskBlockId: string, subtaskId: string, updates: Partial<Subtask>): Promise<Subtask> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const taskBlockIndex = goals[goalIndex].taskBlocks.findIndex(task => task.id === taskBlockId);
    
    if (taskBlockIndex === -1) {
      throw new Error('Task block not found');
    }

    const subtaskIndex = goals[goalIndex].taskBlocks[taskBlockIndex].subtasks?.findIndex(
      subtask => subtask.id === subtaskId
    );
    
    if (subtaskIndex === -1 || subtaskIndex === undefined) {
      throw new Error('Subtask not found');
    }

    const updatedSubtask: Subtask = {
      ...goals[goalIndex].taskBlocks[taskBlockIndex].subtasks![subtaskIndex],
      ...updates,
    };

    goals[goalIndex].taskBlocks[taskBlockIndex].subtasks![subtaskIndex] = updatedSubtask;
    goals[goalIndex].updatedAt = new Date().toISOString();
    saveGoalsToStorage(goals);
    
    return updatedSubtask;
  },

  // Delete a subtask
  async deleteSubtask(goalId: string, taskBlockId: string, subtaskId: string): Promise<void> {
    await delay(300);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const taskBlockIndex = goals[goalIndex].taskBlocks.findIndex(task => task.id === taskBlockId);
    
    if (taskBlockIndex === -1) {
      throw new Error('Task block not found');
    }

    if (goals[goalIndex].taskBlocks[taskBlockIndex].subtasks) {
      goals[goalIndex].taskBlocks[taskBlockIndex].subtasks = goals[goalIndex].taskBlocks[taskBlockIndex].subtasks!.filter(
        subtask => subtask.id !== subtaskId
      );
    }

    goals[goalIndex].updatedAt = new Date().toISOString();
    saveGoalsToStorage(goals);
  },

  // Calculate and update goal progress
  async updateGoalProgress(goalId: string): Promise<Goal> {
    await delay(200);
    const goals = getGoalsFromStorage();
    const goalIndex = goals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      throw new Error('Goal not found');
    }

    const goal = goals[goalIndex];
    let totalTasks = 0;
    let completedTasks = 0;

    goal.taskBlocks.forEach(taskBlock => {
      if (taskBlock.type === 'single') {
        totalTasks++;
        if (taskBlock.completed) {
          completedTasks++;
        }
      } else if (taskBlock.type === 'grouped' && taskBlock.subtasks) {
        totalTasks += taskBlock.subtasks.length;
        completedTasks += taskBlock.subtasks.filter(subtask => subtask.completed).length;
      }
    });

    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const completed = progress === 100;

    const updatedGoal: Goal = {
      ...goal,
      progress,
      completed,
      updatedAt: new Date().toISOString(),
    };

    goals[goalIndex] = updatedGoal;
    saveGoalsToStorage(goals);
    
    return updatedGoal;
  },
}; 
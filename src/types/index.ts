// Goal Types
export interface Goal {
  id: string;
  title: string;
  description?: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  reward?: string;
  stepByStep: boolean;
  completed: boolean;
  progress: number;
  taskBlocks: TaskBlock[];
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// Task Block Types
export interface TaskBlock {
  id: string;
  title: string;
  type: 'single' | 'grouped';
  completed: boolean;
  locked?: boolean;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  subtasks?: Subtask[];
  order: number;
}

// Subtask Types
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  locked?: boolean;
  order: number;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Theme Types
export type Theme = 'light' | 'dark';

// Priority Types
export type Priority = 'low' | 'medium' | 'high';

// Task Block Type
export type TaskBlockType = 'single' | 'grouped';

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface GoalFormData {
  title: string;
  description?: string;
  deadline?: string;
  priority: Priority;
  reward?: string;
  stepByStep: boolean;
}

export interface TaskBlockFormData {
  title: string;
  type: TaskBlockType;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  subtasks?: SubtaskFormData[];
}

export interface SubtaskFormData {
  title: string;
  isRewardTrigger?: boolean;
  rewardNote?: string;
}

// Context Types
export interface GoalContextType {
  goals: Goal[];
  loading: boolean;
  error: string | null;
  createGoal: (goal: GoalFormData) => Promise<void>;
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  getGoal: (id: string) => Goal | undefined;
  calculateProgress: (goal: Goal) => number;
}

export interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export interface TaskBlockProps {
  taskBlock: TaskBlock;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<TaskBlock>) => void;
  onDelete: (id: string) => void;
  isLocked?: boolean;
  className?: string;
}

export interface GoalCardProps {
  goal: Goal;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export interface RewardAnimationProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
  className?: string;
}

// Hook Types
export interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: T) => void;
  removeValue: () => void;
}

export interface UseThemeReturn {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export interface DailyTask {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  streak: number;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  scheduledTime?: string; // "HH:MM" format for when to complete the task
  order: number;
  createdAt: Date;
  updatedAt: string;
}

export interface WeeklyTask {
  id: string;
  title: string;
  description?: string;
  dayOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  completed: boolean;
  streak: number;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  scheduledTime?: string; // "HH:MM" format for when to complete the task
  order: number;
  createdAt: Date;
  updatedAt: string;
}

export interface TaskConfiguration {
  id: string;
  type: 'daily' | 'weekly';
  title: string;
  description?: string;
  tasks: DailyTask[] | WeeklyTask[];
  resetTime: string; // "00:00" for daily, "sunday 00:00" for weekly
  timezone: string;
  createdAt: Date;
  updatedAt: string;
} 
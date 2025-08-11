import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReward } from '@/context/RewardContext';
import TaskBlockComponent from '../components/design/TaskBlock/TaskBlock';
import TaskForm from '../components/design/TaskForm/TaskForm';
import LoadingSpinner from '@/components/design/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/design/ErrorMessage/ErrorMessage';
import { useGoal, useUpdateGoal, useAddTaskBlock, useUpdateTaskBlock, useDeleteTaskBlock, useAddSubtask, useUpdateSubtask, useDeleteSubtask, useUpdateGoalProgress } from '@/hooks/useGoals';
import { Goal, TaskBlock, Subtask } from '@/types';
import ConfirmDialog from '@/components/design/ConfirmDialog/ConfirmDialog';

interface TaskFormData {
  title: string;
  type: 'single' | 'grouped';
  isRewardTrigger?: boolean;
  rewardNote?: string;
  subtasks: { id: string; title: string; isRewardTrigger?: boolean; rewardNote?: string }[];
}

const GoalDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const { triggerGoalReward } = useReward();

  // React Query hooks
  const { data: goal, isLoading, error } = useGoal(id!);
  const updateGoalMutation = useUpdateGoal();
  const addTaskBlockMutation = useAddTaskBlock();
  const updateTaskBlockMutation = useUpdateTaskBlock();
  const deleteTaskBlockMutation = useDeleteTaskBlock();
  const addSubtaskMutation = useAddSubtask();
  const updateSubtaskMutation = useUpdateSubtask();
  const deleteSubtaskMutation = useDeleteSubtask();
  const updateGoalProgressMutation = useUpdateGoalProgress();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

  // Redirect if goal not found
  React.useEffect(() => {
    if (error && !isLoading) {
      navigate('/');
    }
  }, [error, isLoading, navigate]);

  // Check for goal completion and trigger reward
  useEffect(() => {
    if (goal && !goal.completed) {
      const progress = calculateProgress(goal.taskBlocks);
      if (progress === 100) {
        // Goal is completed! Trigger reward
        triggerGoalReward(goal.reward);
      }
    }
  }, [goal, triggerGoalReward]);

  const calculateProgress = (taskBlocks: TaskBlock[]): number => {
    if (taskBlocks.length === 0) return 0;
    
    let totalTasks = 0;
    let completedTasks = 0;
    
    taskBlocks.forEach(task => {
      if (task.type === 'single') {
        totalTasks++;
        if (task.completed) completedTasks++;
      } else if (task.type === 'grouped') {
        const subtasks = task.subtasks || [];
        if (subtasks.length > 0) {
                  totalTasks += subtasks.length;
        completedTasks += subtasks.filter((subtask: Subtask) => subtask.completed).length;
        }
      }
    });
    
    return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  };

  const addTask = (taskData: TaskFormData) => {
    if (!goal) return;

    const newTaskBlock: Omit<TaskBlock, 'id'> = {
      title: taskData.title,
      type: taskData.type,
      completed: false,
      locked: goal.stepByStep ? false : false, // Newest task is always unlocked
      isRewardTrigger: taskData.isRewardTrigger,
      rewardNote: taskData.rewardNote,
      order: goal.taskBlocks.length,
      subtasks: taskData.type === 'grouped' ? taskData.subtasks.map((subtask, index) => ({
        id: `${Date.now()}-${index}`,
        title: subtask.title,
        completed: false,
        locked: goal.stepByStep && index > 0 ? true : false, // First subtask unlocked, rest locked
        isRewardTrigger: subtask.isRewardTrigger,
        rewardNote: subtask.rewardNote,
        order: index,
      })) : undefined,
    };

    // If step-by-step mode is enabled, lock all existing tasks
    if (goal.stepByStep && goal.taskBlocks.length > 0) {
      // Lock all existing tasks first
      const lockPromises = goal.taskBlocks.map(task => 
        updateTaskBlockMutation.mutateAsync(
          { goalId: goal.id, taskBlockId: task.id, updates: { locked: true } }
        )
      );

      // After locking existing tasks, add the new task
      Promise.all(lockPromises).then(() => {
        addTaskBlockMutation.mutate(
          { goalId: goal.id, taskBlock: newTaskBlock },
          {
            onSuccess: () => {
              updateGoalProgressMutation.mutate(goal.id);
              setShowTaskForm(false);
            },
          }
        );
      });
    } else {
      // If not step-by-step mode, just add the task normally
      addTaskBlockMutation.mutate(
        { goalId: goal.id, taskBlock: newTaskBlock },
        {
          onSuccess: () => {
            updateGoalProgressMutation.mutate(goal.id);
            setShowTaskForm(false);
          },
        }
      );
    }
  };

  const toggleTask = (taskId: string) => {
    if (!goal) return;

    const task = goal.taskBlocks.find(t => t.id === taskId);
    if (!task) return;

    const updatedTask = { ...task, completed: !task.completed };
    
    // If step-by-step mode is enabled and task is being completed, unlock previous task
    if (goal.stepByStep && updatedTask.completed) {
      const currentIndex = goal.taskBlocks.findIndex(t => t.id === taskId);
      const previousTask = goal.taskBlocks[currentIndex - 1];
      if (previousTask && previousTask.locked) {
        // Update the previous task to unlock it
        updateTaskBlockMutation.mutate(
          { goalId: goal.id, taskBlockId: previousTask.id, updates: { locked: false } },
          {
            onSuccess: () => {
              // After unlocking previous task, update the current task
              updateTaskBlockMutation.mutate(
                { goalId: goal.id, taskBlockId: taskId, updates: updatedTask },
                {
                  onSuccess: () => {
                    updateGoalProgressMutation.mutate(goal.id);
                  },
                }
              );
            },
          }
        );
        return; // Exit early to avoid double mutation
      }
    }

    updateTaskBlockMutation.mutate(
      { goalId: goal.id, taskBlockId: taskId, updates: updatedTask },
      {
        onSuccess: () => {
          updateGoalProgressMutation.mutate(goal.id);
          
          // Check if goal is completed after task update
          const updatedGoal = {
            ...goal,
            taskBlocks: goal.taskBlocks.map(t => 
              t.id === taskId ? updatedTask : t
            )
          };
          const newProgress = calculateProgress(updatedGoal.taskBlocks);
          if (newProgress === 100 && !goal.completed) {
            triggerGoalReward(goal.reward);
          }
        },
      }
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    if (!goal) return;

    const task = goal.taskBlocks.find(t => t.id === taskId);
    if (!task || !task.subtasks) return;

    const subtask = task.subtasks.find(s => s.id === subtaskId);
    if (!subtask) return;

    const updatedSubtask = { ...subtask, completed: !subtask.completed };
    
    // If step-by-step mode is enabled and subtask is being completed, unlock previous subtask
    if (goal.stepByStep && updatedSubtask.completed) {
      const currentIndex = task.subtasks.findIndex(s => s.id === subtaskId);
      const previousSubtask = task.subtasks[currentIndex - 1];
      if (previousSubtask && previousSubtask.locked) {
        // Update the previous subtask to unlock it
        updateSubtaskMutation.mutate(
          { goalId: goal.id, taskBlockId: taskId, subtaskId: previousSubtask.id, updates: { locked: false } },
          {
            onSuccess: () => {
              // After unlocking previous subtask, update the current subtask
                                   updateSubtaskMutation.mutate(
                   { goalId: goal.id, taskBlockId: taskId, subtaskId, updates: updatedSubtask },
                   {
                     onSuccess: () => {
                       updateGoalProgressMutation.mutate(goal.id);
                       
                       // Check if goal is completed after subtask update
                       const updatedGoal = {
                         ...goal,
                         taskBlocks: goal.taskBlocks.map(t => 
                           t.id === taskId ? {
                             ...t,
                             subtasks: t.subtasks?.map(s => 
                               s.id === subtaskId ? updatedSubtask : s
                             )
                           } : t
                         )
                       };
                       const newProgress = calculateProgress(updatedGoal.taskBlocks);
                       if (newProgress === 100 && !goal.completed) {
                         triggerGoalReward(goal.reward);
                       }
                     },
                   }
                 );
            },
          }
        );
        return; // Exit early to avoid double mutation
      }
    }

    updateSubtaskMutation.mutate(
      { goalId: goal.id, taskBlockId: taskId, subtaskId, updates: updatedSubtask },
      {
        onSuccess: () => {
          updateGoalProgressMutation.mutate(goal.id);
          
          // Check if goal is completed after subtask update
          const updatedGoal = {
            ...goal,
            taskBlocks: goal.taskBlocks.map(t => 
              t.id === taskId ? {
                ...t,
                subtasks: t.subtasks?.map(s => 
                  s.id === subtaskId ? updatedSubtask : s
                )
              } : t
            )
          };
          const newProgress = calculateProgress(updatedGoal.taskBlocks);
          if (newProgress === 100 && !goal.completed) {
            triggerGoalReward(goal.reward);
          }
        },
      }
    );
  };

  const performDeleteTask = (taskId: string) => {
    if (!goal) return;

    deleteTaskBlockMutation.mutate(
      { goalId: goal.id, taskBlockId: taskId },
      {
        onSuccess: () => {
          updateGoalProgressMutation.mutate(goal.id);
        },
      }
    );
  };

  const requestDeleteTask = (taskId: string) => {
    setTaskToDeleteId(taskId);
    setConfirmOpen(true);
  };

  const confirmDeleteTask = () => {
    if (taskToDeleteId) {
      performDeleteTask(taskToDeleteId);
    }
    setConfirmOpen(false);
    setTaskToDeleteId(null);
  };

  const editTask = (taskId: string, newTitle: string) => {
    if (!goal) return;

    updateTaskBlockMutation.mutate(
      { goalId: goal.id, taskBlockId: taskId, updates: { title: newTitle } },
      {
        onSuccess: () => {
          updateGoalProgressMutation.mutate(goal.id);
        },
      }
    );
  };

  const editSubtask = (taskId: string, subtaskId: string, newTitle: string) => {
    if (!goal) return;

    updateSubtaskMutation.mutate(
      { goalId: goal.id, taskBlockId: taskId, subtaskId, updates: { title: newTitle } },
      {
        onSuccess: () => {
          updateGoalProgressMutation.mutate(goal.id);
        },
      }
    );
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    if (!goal) return;

    deleteSubtaskMutation.mutate(
      { goalId: goal.id, taskBlockId: taskId, subtaskId },
      {
        onSuccess: () => {
          updateGoalProgressMutation.mutate(goal.id);
        },
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  };

  if (isLoading) {
    return (
      <div className="goal-detail-page">
        <div className="container">
          <div className="loading">
            <LoadingSpinner size="lg" />
            <p>Loading goal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !goal) {
    return (
      <div className="goal-detail-page">
        <div className="container">
          <ErrorMessage 
            message="Goal not found or error loading goal."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="goal-detail-page">
      <div className="container">
        <div className="goal-header">
          <button 
            className="btn btn--secondary back-btn"
            onClick={() => navigate('/dashboard?tab=goals')}
          >
            ← Back to Goals
          </button>
          
          <div className="goal-info">
            <div className="goal-title-section">
              <h1>{goal.title}</h1>
              <span className={`priority-indicator ${getPriorityColor(goal.priority)}`}>
                {goal.priority}
              </span>
            </div>
            
            {goal.description && (
              <p className="goal-description">{goal.description}</p>
            )}
            
            <div className="goal-meta">
              {goal.deadline && (
                <div className="meta-item">
                  <span className="meta-label">Deadline:</span>
                  <span className="meta-value">{formatDate(goal.deadline)}</span>
                </div>
              )}
              
              {goal.reward && (
                <div className="meta-item">
                  <span className="meta-label">Reward:</span>
                  <span className="meta-value">{goal.reward}</span>
                </div>
              )}
              
              <div className="meta-item">
                <span className="meta-label">Step-by-Step:</span>
                <span className="meta-value">{goal.stepByStep ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="progress-section">
          <div className="progress-header">
            <h2>Progress</h2>
            <span className="progress-percentage">{goal.progress}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks ({goal.taskBlocks.length})</h2>
            <button 
              className="btn btn--primary"
              onClick={() => setShowTaskForm(!showTaskForm)}
            >
              {showTaskForm ? 'Cancel' : '+ Add Task'}
            </button>
          </div>

          {showTaskForm && (
            <div className="task-form-container">
              <TaskForm
                onSubmit={addTask}
                onCancel={() => setShowTaskForm(false)}
                stepByStepMode={goal.stepByStep}
              />
            </div>
          )}

                     <div className="tasks-list">
             {goal.taskBlocks.length === 0 ? (
               <div className="empty-state">
                 <p>No tasks yet. Add your first task to get started!</p>
               </div>
             ) : (
               goal.taskBlocks
                 .slice()
                 .reverse()
                 .map((task) => (
                   <TaskBlockComponent
                     key={task.id}
                     id={task.id}
                     title={task.title}
                     type={task.type}
                     completed={task.completed}
                     locked={task.locked}
                     isRewardTrigger={task.isRewardTrigger}
                     rewardNote={task.rewardNote}
                     subtasks={task.subtasks}
                     order={task.order}
                     stepByStepMode={goal.stepByStep}
                     onToggle={toggleTask}
                     onSubtaskToggle={toggleSubtask}
                      onDelete={requestDeleteTask}
                     onEdit={editTask}
                     onSubtaskEdit={editSubtask}
                     onSubtaskDelete={deleteSubtask}
                   />
                 ))
             )}
           </div>
        </div>
      </div>
    </div>
    <ConfirmDialog
      isOpen={confirmOpen}
      title="Delete Task"
      message={`Are you sure you want to delete "${goal.taskBlocks.find(t => t.id === taskToDeleteId)?.title ?? 'this task'}"? This action cannot be undone.`}
      isDanger
      confirmLabel="Delete"
      cancelLabel="Cancel"
      isLoading={deleteTaskBlockMutation.isPending}
      onConfirm={confirmDeleteTask}
      onCancel={() => { setConfirmOpen(false); setTaskToDeleteId(null); }}
    />
  </>
  );
};

export default GoalDetailPage; 
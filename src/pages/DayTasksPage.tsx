import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '@/components/design/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/design/ErrorMessage/ErrorMessage';
import { useWeeklyTasks, useToggleWeeklyTask, useDeleteWeeklyTask } from '@/hooks/useTasks';
import { WeeklyTask } from '@/types';
import ConfirmDialog from '@/components/design/ConfirmDialog/ConfirmDialog';

const DayTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { day } = useParams<{ day: string }>();

  // React Query hooks
  const { data: weeklyTasks, isLoading, error } = useWeeklyTasks();
  const toggleWeeklyTaskMutation = useToggleWeeklyTask();
  const deleteWeeklyTaskMutation = useDeleteWeeklyTask();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<WeeklyTask | null>(null);

  const getDayEmoji = (day: string) => {
    const dayEmojis: Record<string, string> = {
      monday: '📅',
      tuesday: '📅',
      wednesday: '📅',
      thursday: '📅',
      friday: '📅',
      saturday: '🎉',
      sunday: '☀️',
    };
    return dayEmojis[day] || '📅';
  };

  const formatDayName = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 7) return '🔥';
    if (streak >= 5) return '⚡';
    if (streak >= 3) return '✨';
    if (streak >= 1) return '⭐';
    return '';
  };



  const handleToggleTask = (taskId: string) => {
    toggleWeeklyTaskMutation.mutate(taskId);
  };

  const handleDeleteTask = (task: WeeklyTask) => {
    setTaskToDelete(task);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteWeeklyTaskMutation.mutate(taskToDelete.id);
    }
    setConfirmOpen(false);
    setTaskToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="day-tasks-page">
        <div className="container">
          <div className="loading">
            <LoadingSpinner size="lg" />
            <p>Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="day-tasks-page">
        <div className="container">
          <ErrorMessage 
            message="Error loading tasks."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  if (!day) {
    return (
      <div className="day-tasks-page">
        <div className="container">
          <ErrorMessage 
            message="Invalid day parameter."
            onRetry={() => navigate('/weekly-tasks')}
          />
        </div>
      </div>
    );
  }

  const dayTasks = (weeklyTasks || []).filter(task => task.dayOfWeek === day);
  const completedTasks = dayTasks.filter(task => task.completed);
  const completionRate = dayTasks.length > 0 ? Math.round((completedTasks.length / dayTasks.length) * 100) : 0;

  return (
    <>
    <div className="day-tasks-page">
      <div className="container">
        <div className="page-header">
                           <button
                   className="btn btn--secondary back-btn"
                   onClick={() => navigate('/dashboard?tab=weekly')}
                 >
                   ← Back to Dashboard
                 </button>
          
          <div className="header-content">
            <h1>
              {getDayEmoji(day)} {formatDayName(day)}
            </h1>
            <p className="header-subtitle">Complete your {formatDayName(day).toLowerCase()} tasks</p>
          </div>
        </div>

        <div className="day-overview">
          <div className="overview-card">
            <div className="overview-header">
              <h2>{formatDayName(day)} Tasks</h2>
              <div className="overview-stats">
                <span className="stat-item">
                  <span className="stat-number">{dayTasks.length}</span>
                  <span className="stat-label">Total Tasks</span>
                </span>
                <span className="stat-item">
                  <span className="stat-number">{completedTasks.length}</span>
                  <span className="stat-label">Completed</span>
                </span>
                <span className="stat-item">
                  <span className="stat-number">{completionRate}%</span>
                  <span className="stat-label">Progress</span>
                </span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="progress-text">{completionRate}% Complete</span>
            </div>
          </div>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tasks ({dayTasks.length})</h2>
            <div className="header-actions">
              <button 
                className="btn btn--primary"
                onClick={() => navigate(`/create-task?type=weekly&day=${day}`)}
              >
                + Add Task
              </button>
            </div>
          </div>

          <div className="tasks-list">
            {dayTasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No tasks for {formatDayName(day)}</h3>
                <p>Start your {formatDayName(day).toLowerCase()} by adding your first task!</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => navigate(`/create-task?type=weekly&day=${day}`)}
                >
                  Add Your First Task
                </button>
              </div>
            ) : (
              dayTasks.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        disabled={toggleWeeklyTaskMutation.isPending}
                      />
                      <span className="checkmark"></span>
                    </label>

                    <div className="task-details">
                      <h4 className="task-title">{task.title}</h4>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <div className="task-meta">
                        <span className="streak-counter">
                          {getStreakEmoji(task.streak)} {task.streak} week streak
                        </span>
                        {task.scheduledTime && (
                          <span className="scheduled-time">🕐 {task.scheduledTime}</span>
                        )}
                        {task.isRewardTrigger && task.rewardNote && (
                          <span className="reward-note">🎁 {task.rewardNote}</span>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="btn btn--danger btn--sm"
                        onClick={() => handleDeleteTask(task)}
                        disabled={deleteWeeklyTaskMutation.isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title ?? 'this task'}"? This action cannot be undone.`}
        isDanger
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteWeeklyTaskMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setTaskToDelete(null); }}
      />
  </>
  );
};

export default DayTasksPage; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '@/components/design/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/design/ErrorMessage/ErrorMessage';
import { useDailyTasks, useToggleDailyTask, useDeleteDailyTask, useTaskStatistics } from '@/hooks/useTasks';
import { DailyTask } from '@/types';
import ConfirmDialog from '@/components/design/ConfirmDialog/ConfirmDialog';

const DailyTasksPage: React.FC = () => {
  const navigate = useNavigate();

  // React Query hooks
  const { data: dailyTasks, isLoading, error } = useDailyTasks();
  const { data: statistics } = useTaskStatistics();
  const toggleDailyTaskMutation = useToggleDailyTask();
  const deleteDailyTaskMutation = useDeleteDailyTask();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<DailyTask | null>(null);

  const handleToggleTask = (taskId: string) => {
    toggleDailyTaskMutation.mutate(taskId);
  };

  const handleDeleteTask = (task: DailyTask) => {
    setTaskToDelete(task);
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteDailyTaskMutation.mutate(taskToDelete.id);
    }
    setConfirmOpen(false);
    setTaskToDelete(null);
  };

  const getStreakEmoji = (streak: number) => {
    if (streak >= 7) return '🔥';
    if (streak >= 5) return '⚡';
    if (streak >= 3) return '✨';
    if (streak >= 1) return '⭐';
    return '';
  };

  if (isLoading) {
    return (
      <div className="daily-tasks-page">
        <div className="container">
          <div className="loading">
            <LoadingSpinner size="lg" />
            <p>Loading daily tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-tasks-page">
        <div className="container">
          <ErrorMessage 
            message="Error loading daily tasks."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="daily-tasks-page">
      <div className="container">
        <div className="page-header">
          <button 
            className="btn btn--secondary back-btn"
            onClick={() => navigate('/')}
          >
            ← Back to Goals
          </button>
          
          <div className="header-content">
            <h1>Daily Tasks</h1>
            <p className="header-subtitle">Build habits that stick with daily routines</p>
          </div>
        </div>

        <div className="statistics-section">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{statistics?.dailyCompleted || 0}</div>
              <div className="stat-label">Completed Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{statistics?.dailyTotal || 0}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">
                {statistics?.dailyTotal ? Math.round((statistics.dailyCompleted / statistics.dailyTotal) * 100) : 0}%
              </div>
              <div className="stat-label">Completion Rate</div>
            </div>
          </div>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Today's Tasks</h2>
            <button 
              className="btn btn--primary"
              onClick={() => navigate('/create-task?type=daily')}
            >
              + Add Task
            </button>
          </div>

          <div className="tasks-list">
            {dailyTasks?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <h3>No daily tasks yet</h3>
                <p>Start building your daily routine by adding your first task!</p>
                <button 
                  className="btn btn--primary"
                  onClick={() => navigate('/create-task?type=daily')}
                >
                  Add Your First Task
                </button>
              </div>
            ) : (
              dailyTasks?.map((task) => (
                <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                  <div className="task-content">
                    <label className="task-checkbox">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        disabled={toggleDailyTaskMutation.isPending}
                      />
                      <span className="checkmark"></span>
                    </label>

                    <div className="task-details">
                      <h3 className="task-title">{task.title}</h3>
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      <div className="task-meta">
                        <span className="streak-counter">
                          {getStreakEmoji(task.streak)} {task.streak} day streak
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
                        disabled={deleteDailyTaskMutation.isPending}
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
        isLoading={deleteDailyTaskMutation.isPending}
        onConfirm={confirmDelete}
        onCancel={() => { setConfirmOpen(false); setTaskToDelete(null); }}
      />
  </>
  );
};

export default DailyTasksPage; 
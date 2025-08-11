import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useReward } from '@/context/RewardContext';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { useWeeklyTasks } from '@/hooks/useTasks';
import { useMobileGestures } from '@/hooks/useMobileGestures';
import { Goal, WeeklyTask } from '@/types';
import LoadingSpinner from '@/components/design/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/design/ErrorMessage/ErrorMessage';
import DailyTasksPage from './DailyTasksPage';
import ConfirmDialog from '@/components/design/ConfirmDialog/ConfirmDialog';

// GoalCard component with mobile gestures
const GoalCard: React.FC<{
  goal: Goal;
  onDelete: (id: string, title: string) => void;
  onNavigate: (path: string) => void;
}> = ({ goal, onDelete, onNavigate }) => {
  const { handleTouchStart } = useMobileGestures({
    onSwipeLeft: () => onDelete(goal.id, goal.title),
    onSwipeRight: () => onNavigate(`/goal/${goal.id}`),
    onLongPress: () => onDelete(goal.id, goal.title),
    onTap: () => onNavigate(`/goal/${goal.id}`)
  });

  return (
    <div 
      className={`goal-card ${goal.completed ? 'goal-card--completed' : ''}`}
      onClick={() => onNavigate(`/goal/${goal.id}`)}
      onTouchStart={handleTouchStart}
    >
      <div className="goal-card__content">
        <div className="goal-card__header">
          <h3 className="goal-card__title">{goal.title}</h3>
          <button
            className="goal-card__delete-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(goal.id, goal.title);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            title="Delete goal"
          >
            🗑️
          </button>
        </div>
        
        {goal.description && (
          <div className="goal-description">
            <p>{goal.description}</p>
          </div>
        )}
        
        <div className="goal-progress">
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${goal.progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{goal.progress}% Complete</span>
          </div>
        </div>
        
        <div className="goal-stats">
          <div className="stat-item">
            <span className="stat-number">{goal.taskBlocks.length}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{goal.taskBlocks.filter(task => task.completed).length}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{goal.taskBlocks.filter(task => !task.completed).length}</span>
            <span className="stat-label">Remaining</span>
          </div>
        </div>
        
        <div className="goal-meta">
          {goal.deadline && (
            <div className="meta-item">
              <span className="meta-label">Due</span>
              <span className="meta-value">{formatDate(goal.deadline)}</span>
            </div>
          )}
          <div className="meta-item">
            <span className="meta-label">Created</span>
            <span className="meta-value">{formatDate(goal.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

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

  const groupTasksByDay = (tasks: WeeklyTask[]) => {
    const grouped: Record<string, WeeklyTask[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    };

    tasks?.forEach(task => {
      if (grouped[task.dayOfWeek]) {
        grouped[task.dayOfWeek].push(task);
      }
    });

    return grouped;
  };

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'goals' | 'daily' | 'weekly') || 'goals';
  const [activeTab, setActiveTab] = useState<'goals' | 'daily' | 'weekly'>(initialTab);
  const { data: goals = [], isLoading, error } = useGoals();
  const { data: weeklyTasks } = useWeeklyTasks();
  const { triggerTaskReward, triggerGoalReward, triggerStreakReward } = useReward();
  const deleteGoalMutation = useDeleteGoal();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab') as 'goals' | 'daily' | 'weekly' | null;
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  const getTotalProgress = () => {
    if (goals.length === 0) return 0;
    const totalProgress = goals.reduce((sum, goal) => sum + goal.progress, 0);
    return Math.round(totalProgress / goals.length);
  };

  const getCompletedGoals = () => {
    return goals.filter(goal => goal.completed).length;
  };

  const getTotalTasks = () => {
    return goals.reduce((sum, goal) => sum + goal.taskBlocks.length, 0);
  };

  const handleDeleteGoal = (goalId: string, goalTitle: string) => {
    const goal = goals.find(g => g.id === goalId) || null;
    setGoalToDelete(goal);
    setConfirmOpen(true);
  };

  const confirmDeleteGoal = () => {
    if (goalToDelete) {
      deleteGoalMutation.mutate(goalToDelete.id);
    }
    setConfirmOpen(false);
    setGoalToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading">
            <LoadingSpinner size="lg" />
            <p>Loading your goals...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <ErrorMessage 
            message="Error loading goals. Please try again."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome to Your Goal Dashboard</h1>
            <p>Track your progress and manage your goals effectively</p>
          </div>
          

          
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <span className="stat-number">{goals.length}</span>
                <span className="stat-label">Total Goals</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-content">
                <span className="stat-number">{getCompletedGoals()}</span>
                <span className="stat-label">Completed</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">📋</div>
              <div className="stat-content">
                <span className="stat-number">{getTotalTasks()}</span>
                <span className="stat-label">Total Tasks</span>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">🎯</div>
              <div className="stat-content">
                <span className="stat-number">{getTotalProgress()}%</span>
                <span className="stat-label">Avg Progress</span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Reward System Section - Remove in production */}
        <div className="reward-test-section">
          <h3>🎁 Test Reward System</h3>
          <p>Click the buttons below to test different reward animations:</p>
          <div className="reward-test-buttons">
            <button 
              className="btn btn--secondary"
              onClick={() => triggerTaskReward("Great job completing this task! 🎉")}
            >
              Test Task Reward
            </button>
            <button 
              className="btn btn--secondary"
              onClick={() => triggerGoalReward("Congratulations! You've achieved your goal! 🎯")}
            >
              Test Goal Reward
            </button>
            <button 
              className="btn btn--secondary"
              onClick={() => triggerStreakReward(7)}
            >
              Test Streak Reward
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button 
              className={`tab-button ${activeTab === 'goals' ? 'active' : ''}`}
              onClick={() => { setActiveTab('goals'); setSearchParams({ tab: 'goals' }); }}
            >
              <span className="tab-icon">🎯</span>
              Your Goals
              <span className="tab-count">{goals.length}</span>
            </button>
            <button 
              className={`tab-button ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => { setActiveTab('daily'); setSearchParams({ tab: 'daily' }); }}
            >
              <span className="tab-icon">📅</span>
              Daily Tasks
            </button>
            <button 
              className={`tab-button ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => { setActiveTab('weekly'); setSearchParams({ tab: 'weekly' }); }}
            >
              <span className="tab-icon">📊</span>
              Weekly Tasks
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'goals' && (
            <div className="goals-section">
              <div className="goals-header">
                <div className="goals-title">
                  <h2>Your Goals</h2>
                  <span className="goals-count">{goals.length} goal{goals.length !== 1 ? 's' : ''}</span>
                </div>
                <Link to="/create" className="btn btn--primary">
                  + Create New Goal
                </Link>
              </div>
            
            {goals.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <h3>No Goals Yet</h3>
                <p>Start your journey by creating your first goal. Set clear objectives and track your progress!</p>
                <Link to="/create" className="btn btn--primary">
                  Create Your First Goal
                </Link>
              </div>
            ) : (
              <div className="goals-grid">
                {goals.map((goal) => (
                  <GoalCard 
                    key={goal.id}
                    goal={goal}
                    onDelete={handleDeleteGoal}
                    onNavigate={navigate}
                  />
                ))}
              </div>
            )}
          </div>
          )}

          {activeTab === 'daily' && (
            <div className="daily-tasks-section">
              <DailyTasksPage />
            </div>
          )}

                                {activeTab === 'weekly' && (
            <div className="weekly-tasks-section">
              <div className="weekly-tasks-grid">
                {Object.entries(groupTasksByDay(weeklyTasks || [])).map(([day, tasks]) => {
                  const completedTasks = tasks.filter(task => task.completed);
                  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;
                  
                  return (
                    <div 
                      key={day} 
                      className="day-container clickable"
                      onClick={() => navigate(`/weekly-tasks/${day}`)}
                    >
                      <div className="day-header">
                        <div className="day-info">
                          <span className="day-icon">{getDayEmoji(day)}</span>
                          <h3 className="day-title">{formatDayName(day)}</h3>
                        </div>
                        <div className="day-actions">
                          <span className="task-count">{tasks.length} tasks</span>
                          <span className="view-tasks">View Tasks →</span>
                        </div>
                      </div>

                      <div className="day-content">
                        <div className="day-description">
                          {tasks.length === 0 ? (
                            <p>No tasks scheduled for {formatDayName(day).toLowerCase()}</p>
                          ) : (
                            <p>Complete your {formatDayName(day).toLowerCase()} tasks</p>
                          )}
                        </div>

                        <div className="day-progress">
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

                        <div className="day-stats">
                          <div className="stat-item">
                            <span className="stat-number">{tasks.length}</span>
                            <span className="stat-label">Total Tasks</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">{completedTasks.length}</span>
                            <span className="stat-label">Completed</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-number">{tasks.length - completedTasks.length}</span>
                            <span className="stat-label">Remaining</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(weeklyTasks || []).length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">📅</div>
                  <h3>No weekly tasks yet</h3>
                  <p>Start planning your week by clicking on any day!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.title ?? 'this goal'}"? This action cannot be undone.`}
        isDanger
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isLoading={deleteGoalMutation.isPending}
        onConfirm={confirmDeleteGoal}
        onCancel={() => { setConfirmOpen(false); setGoalToDelete(null); }}
      />
    </div>
  );
};

export default DashboardPage; 
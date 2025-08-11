import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCreateDailyTask, useCreateWeeklyTask } from '@/hooks/useTasks';

interface TaskFormData {
  title: string;
  description: string;
  scheduledTime: string;
  dayOfWeek?: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  isRewardTrigger: boolean;
}

interface TaskFormErrors {
  title?: string;
  description?: string;
}

const TaskCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskType = searchParams.get('type') || 'daily';
  const dayOfWeek = searchParams.get('day') || '';
  
  const createDailyTaskMutation = useCreateDailyTask();
  const createWeeklyTaskMutation = useCreateWeeklyTask();
  
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    scheduledTime: '',
    dayOfWeek: dayOfWeek as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' || undefined,
    isRewardTrigger: false,
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof TaskFormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: TaskFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    if (formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const navigateBackToDashboard = () => {
    const tab = taskType === 'weekly' ? 'weekly' : 'daily';
    navigate(`/dashboard?tab=${tab}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      if (taskType === 'daily') {
        const dailyTaskData = {
          title: formData.title,
          description: formData.description,
          scheduledTime: formData.scheduledTime,
          isRewardTrigger: formData.isRewardTrigger,
          completed: false,
          streak: 0,
          order: 0,
        };

        createDailyTaskMutation.mutate(dailyTaskData, {
          onSuccess: () => {
            navigate('/dashboard?tab=daily');
          },
          onError: (error) => {
            console.error('Error creating daily task:', error);
          },
        });
      } else {
        const weeklyTaskData = {
          title: formData.title,
          description: formData.description,
          scheduledTime: formData.scheduledTime,
          isRewardTrigger: formData.isRewardTrigger,
          dayOfWeek: formData.dayOfWeek!,
          completed: false,
          streak: 0,
          order: 0,
        };

        createWeeklyTaskMutation.mutate(weeklyTaskData, {
          onSuccess: () => {
            navigate('/dashboard?tab=weekly');
          },
          onError: (error) => {
            console.error('Error creating weekly task:', error);
          },
        });
      }
    }
  };

  const getPageTitle = () => {
    if (taskType === 'weekly') {
      return `Add Task for ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}`;
    }
    return 'Create New Daily Task';
  };

  const getPageDescription = () => {
    if (taskType === 'weekly') {
      return `Add a new task for ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)} to your weekly routine`;
    }
    return 'Set up your daily task with flexible scheduling and reward triggers';
  };

  const getSubmitButtonText = () => {
    if (taskType === 'weekly') {
      return createWeeklyTaskMutation.isPending ? 'Adding...' : `Add Task for ${dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1)}`;
    }
    return createDailyTaskMutation.isPending ? 'Creating...' : 'Create Daily Task';
  };

  const isPending = createDailyTaskMutation.isPending || createWeeklyTaskMutation.isPending;

  return (
    <div className="task-creation-page">
      <div className="container">
        <div className="task-creation-form">
          <div className="form-header">
            <h1>{getPageTitle()}</h1>
            <p>{getPageDescription()}</p>
          </div>

          <form onSubmit={handleSubmit} className="task-form">
            <div className="form-group">
              <label htmlFor="title">Task Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter your task title"
                className={errors.title ? 'error' : ''}
                maxLength={100}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your task in detail"
                rows={4}
                maxLength={500}
              />
              <span className="character-count">{formData.description.length}/500</span>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="scheduledTime">Scheduled Time</label>
                <input
                  type="time"
                  id="scheduledTime"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  placeholder="--:--"
                />
              </div>

              <div className="form-group">
                <label htmlFor="isRewardTrigger">Reward Trigger</label>
                <div className="checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="isRewardTrigger"
                      checked={formData.isRewardTrigger}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    This is a reward trigger
                  </label>
                  <p className="help-text">
                    When checked, completing this task will trigger a reward notification.
                  </p>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn--secondary" 
                onClick={navigateBackToDashboard}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn--primary"
                disabled={isPending}
              >
                {getSubmitButtonText()}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskCreationPage; 
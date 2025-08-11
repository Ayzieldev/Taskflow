import React, { useState } from 'react';
import './TaskForm.scss';

interface SubtaskFormData {
  id: string;
  title: string;
  isRewardTrigger?: boolean;
  rewardNote?: string;
}

interface TaskFormData {
  title: string;
  type: 'single' | 'grouped';
  isRewardTrigger?: boolean;
  rewardNote?: string;
  subtasks: SubtaskFormData[];
}

interface TaskFormErrors {
  title?: string;
  subtasks?: string;
}

interface TaskFormProps {
  onSubmit: (taskData: TaskFormData) => void;
  onCancel: () => void;
  stepByStepMode: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  stepByStepMode,
}) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    type: 'single',
    isRewardTrigger: false,
    rewardNote: '',
    subtasks: [],
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

  const addSubtask = () => {
    const newSubtask: SubtaskFormData = {
      id: Date.now().toString(),
      title: '',
      isRewardTrigger: false,
      rewardNote: '',
    };

    setFormData(prev => ({
      ...prev,
      subtasks: [...prev.subtasks, newSubtask],
    }));
  };

  const updateSubtask = (id: string, field: keyof SubtaskFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(subtask =>
        subtask.id === id ? { ...subtask, [field]: value } : subtask
      ),
    }));
  };

  const removeSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(subtask => subtask.id !== id),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: TaskFormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Task title must be less than 100 characters';
    }

    if (formData.type === 'grouped') {
      const invalidSubtasks = formData.subtasks.filter(subtask => !subtask.title.trim());
      if (invalidSubtasks.length > 0) {
        newErrors.subtasks = 'All subtasks must have titles';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty subtasks
      const cleanSubtasks = formData.subtasks.filter(subtask => subtask.title.trim());
      
      onSubmit({
        ...formData,
        subtasks: cleanSubtasks,
      });
    }
  };

  return (
    <div className="task-form">
      <div className="task-form__header">
        <h3>Add New Task</h3>
        <button 
          className="task-form__close-btn"
          onClick={onCancel}
          title="Cancel"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="task-form__content">
        <div className="form-group">
          <label htmlFor="title">Task Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter task title"
            className={errors.title ? 'error' : ''}
            maxLength={100}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">Task Type</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
          >
            <option value="single">Single Task</option>
            <option value="grouped">Grouped Task (with subtasks)</option>
          </select>
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isRewardTrigger"
              checked={formData.isRewardTrigger}
              onChange={handleInputChange}
            />
            <span className="checkmark"></span>
            This task triggers a reward
          </label>
        </div>

        {formData.isRewardTrigger && (
          <div className="form-group">
            <label htmlFor="rewardNote">Reward Note</label>
            <textarea
              id="rewardNote"
              name="rewardNote"
              value={formData.rewardNote}
              onChange={handleInputChange}
              placeholder="Describe your reward for completing this task"
              rows={3}
              maxLength={200}
            />
            <span className="character-count">{formData.rewardNote?.length || 0}/200</span>
          </div>
        )}

        {formData.type === 'grouped' && (
          <div className="task-form__subtasks-section">
            <div className="subtasks-header">
              <h4>Subtasks</h4>
              <button
                type="button"
                className="btn btn--secondary btn--small"
                onClick={addSubtask}
              >
                + Add Subtask
              </button>
            </div>

            {formData.subtasks.length === 0 ? (
              <div className="empty-subtasks">
                <p>No subtasks yet. Add subtasks to break down this task.</p>
              </div>
            ) : (
              <div className="subtasks-list">
                {formData.subtasks.map((subtask, index) => (
                  <div key={subtask.id} className="subtask-item">
                    <div className="subtask-header">
                      <span className="subtask-number">#{index + 1}</span>
                      <button
                        type="button"
                        className="subtask-remove-btn"
                        onClick={() => removeSubtask(subtask.id)}
                        title="Remove subtask"
                      >
                        ×
                      </button>
                    </div>

                    <div className="subtask-content">
                      <div className="form-group">
                        <input
                          type="text"
                          value={subtask.title}
                          onChange={(e) => updateSubtask(subtask.id, 'title', e.target.value)}
                          placeholder="Enter subtask title"
                          maxLength={100}
                        />
                      </div>

                      <div className="subtask-options">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={subtask.isRewardTrigger || false}
                            onChange={(e) => updateSubtask(subtask.id, 'isRewardTrigger', e.target.checked)}
                          />
                          <span className="checkmark"></span>
                          Reward trigger
                        </label>

                        {subtask.isRewardTrigger && (
                          <div className="form-group">
                            <textarea
                              value={subtask.rewardNote || ''}
                              onChange={(e) => updateSubtask(subtask.id, 'rewardNote', e.target.value)}
                              placeholder="Reward note for this subtask"
                              rows={2}
                              maxLength={150}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.subtasks && (
              <span className="error-message">{errors.subtasks}</span>
            )}
          </div>
        )}

        {stepByStepMode && (
          <div className="task-form__step-info">
            <div className="info-box">
              <span className="info-icon">ℹ️</span>
              <p>
                <strong>Step-by-Step Mode Enabled:</strong> Tasks will be locked until previous tasks are completed.
              </p>
            </div>
          </div>
        )}

        <div className="task-form__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary">
            Add Task
          </button>
        </div>
      </form>
    </div>
  );
};

export default TaskForm; 
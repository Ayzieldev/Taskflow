import React, { useState } from 'react';
import { useReward } from '@/context/RewardContext';
import './TaskBlock.scss';

interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  locked?: boolean;
  order: number;
}

interface TaskBlockProps {
  id: string;
  title: string;
  type: 'single' | 'grouped';
  completed: boolean;
  locked?: boolean;
  isRewardTrigger?: boolean;
  rewardNote?: string;
  subtasks?: Subtask[];
  order: number;
  stepByStepMode: boolean;
  onToggle: (taskId: string) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (taskId: string, newTitle: string) => void;
  onSubtaskEdit: (taskId: string, subtaskId: string, newTitle: string) => void;
  onSubtaskDelete: (taskId: string, subtaskId: string) => void;
}

const TaskBlock: React.FC<TaskBlockProps> = ({
  id,
  title,
  type,
  completed,
  locked = false,
  isRewardTrigger = false,
  rewardNote,
  subtasks = [],
  order,
  stepByStepMode,
  onToggle,
  onSubtaskToggle,
  onDelete,
  onEdit,
  onSubtaskEdit,
  onSubtaskDelete,
}) => {
  const { triggerTaskReward } = useReward();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isExpanded, setIsExpanded] = useState(type === 'grouped');
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState('');

  const handleToggle = () => {
    if (!locked) {
      const wasCompleted = completed;
      onToggle(id);
      
      // Trigger reward if task was just completed and has reward trigger
      if (!wasCompleted && isRewardTrigger && rewardNote) {
        triggerTaskReward(rewardNote);
      }
    }
  };

  const handleSubtaskToggle = (subtaskId: string) => {
    if (!locked) {
      const subtask = subtasks.find(s => s.id === subtaskId);
      const wasCompleted = subtask?.completed || false;
      onSubtaskToggle(id, subtaskId);
      
      // Trigger reward if subtask was just completed and has reward trigger
      if (!wasCompleted && subtask?.isRewardTrigger && subtask?.rewardNote) {
        triggerTaskReward(subtask.rewardNote);
      }
    }
  };

  const handleEdit = () => {
    if (isEditing) {
      onEdit(id, editTitle);
      setIsEditing(false);
    } else {
      setEditTitle(title);
      setIsEditing(true);
    }
  };

  const handleSubtaskEdit = (subtaskId: string) => {
    if (editingSubtaskId === subtaskId) {
      onSubtaskEdit(id, subtaskId, editingSubtaskTitle);
      setEditingSubtaskId(null);
      setEditingSubtaskTitle('');
    } else {
      const subtask = subtasks.find(s => s.id === subtaskId);
      setEditingSubtaskTitle(subtask?.title || '');
      setEditingSubtaskId(subtaskId);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      action();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingSubtaskId(null);
    }
  };

  const completedSubtasks = subtasks.filter(subtask => subtask.completed).length;
  const totalSubtasks = subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div className={`task-block ${completed ? 'task-block--completed' : ''} ${locked ? 'task-block--locked' : ''}`}>
      <div className="task-block__header">
        <div className="task-block__main">
          <label className="task-block__checkbox-container">
            <input
              type="checkbox"
              className="task-block__checkbox"
              checked={completed}
              onChange={handleToggle}
              disabled={locked}
            />
            <span className="task-block__checkmark"></span>
          </label>

          <div className="task-block__content">
            {isEditing ? (
              <input
                type="text"
                className="task-block__edit-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, () => handleEdit())}
                onBlur={handleEdit}
                autoFocus
              />
            ) : (
              <div className="task-block__title-section">
                <h3 className="task-block__title">{title}</h3>
                {type === 'grouped' && (
                  <span className="task-block__subtask-count">
                    {completedSubtasks}/{totalSubtasks} subtasks
                  </span>
                )}
              </div>
            )}

            {type === 'grouped' && (
              <div className="task-block__progress">
                <div className="task-block__progress-bar">
                  <div 
                    className="task-block__progress-fill"
                    style={{ width: `${subtaskProgress}%` }}
                  ></div>
                </div>
                <span className="task-block__progress-text">{Math.round(subtaskProgress)}%</span>
              </div>
            )}
          </div>
        </div>

        <div className="task-block__actions">
          {type === 'grouped' && (
            <button
              className="task-block__expand-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          <button
            className="task-block__edit-btn"
            onClick={handleEdit}
            title="Edit task"
          >
            ✏️
          </button>

          <button
            className="task-block__delete-btn"
            onClick={() => onDelete(id)}
            title="Delete task"
          >
            ×
          </button>
        </div>
      </div>

      {type === 'grouped' && isExpanded && (
        <div className="task-block__subtasks">
          {subtasks.length === 0 ? (
            <div className="task-block__empty-subtasks">
              <p>No subtasks yet. Add subtasks to break down this task.</p>
            </div>
          ) : (
            subtasks.map((subtask) => (
              <div 
                key={subtask.id} 
                className={`task-block__subtask ${subtask.completed ? 'task-block__subtask--completed' : ''} ${subtask.locked ? 'task-block__subtask--locked' : ''}`}
              >
                <label className="task-block__subtask-checkbox-container">
                  <input
                    type="checkbox"
                    className="task-block__subtask-checkbox"
                    checked={subtask.completed}
                    onChange={() => handleSubtaskToggle(subtask.id)}
                    disabled={subtask.locked}
                  />
                  <span className="task-block__subtask-checkmark"></span>
                </label>

                <div className="task-block__subtask-content">
                  {editingSubtaskId === subtask.id ? (
                    <input
                      type="text"
                      className="task-block__subtask-edit-input"
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onKeyPress={(e) => handleKeyPress(e, () => handleSubtaskEdit(subtask.id))}
                      onBlur={() => handleSubtaskEdit(subtask.id)}
                      autoFocus
                    />
                  ) : (
                    <span className="task-block__subtask-title">{subtask.title}</span>
                  )}

                  {subtask.locked && (
                    <span className="task-block__locked-indicator">🔒</span>
                  )}
                </div>

                <div className="task-block__subtask-actions">
                  <button
                    className="task-block__subtask-edit-btn"
                    onClick={() => handleSubtaskEdit(subtask.id)}
                    title="Edit subtask"
                  >
                    ✏️
                  </button>

                  <button
                    className="task-block__subtask-delete-btn"
                    onClick={() => onSubtaskDelete(id, subtask.id)}
                    title="Delete subtask"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {isRewardTrigger && rewardNote && (
        <div className="task-block__reward">
          <span className="task-block__reward-icon">🎁</span>
          <span className="task-block__reward-note">{rewardNote}</span>
        </div>
      )}
    </div>
  );
};

export default TaskBlock; 
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface RewardAnimationState {
  isVisible: boolean;
  message?: string;
  type: 'task' | 'goal' | 'streak';
}

interface RewardContextType {
  rewardState: RewardAnimationState;
  triggerReward: (type: 'task' | 'goal' | 'streak', message?: string) => void;
  triggerTaskReward: (rewardNote?: string) => void;
  triggerGoalReward: (rewardNote?: string) => void;
  triggerStreakReward: (streakCount: number) => void;
  hideReward: () => void;
}

const RewardContext = createContext<RewardContextType | undefined>(undefined);

interface RewardProviderProps {
  children: ReactNode;
}

export const RewardProvider: React.FC<RewardProviderProps> = ({ children }) => {
  const [rewardState, setRewardState] = useState<RewardAnimationState>({
    isVisible: false,
    type: 'task'
  });

  const triggerReward = useCallback((
    type: 'task' | 'goal' | 'streak' = 'task',
    message?: string
  ) => {
    setRewardState({
      isVisible: true,
      message,
      type
    });
  }, []);

  const hideReward = useCallback(() => {
    setRewardState(prev => ({
      ...prev,
      isVisible: false
    }));
  }, []);

  const triggerTaskReward = useCallback((rewardNote?: string) => {
    triggerReward('task', rewardNote || 'Task Completed!');
  }, [triggerReward]);

  const triggerGoalReward = useCallback((rewardNote?: string) => {
    triggerReward('goal', rewardNote || 'Goal Completed!');
  }, [triggerReward]);

  const triggerStreakReward = useCallback((streakCount: number) => {
    triggerReward('streak', `${streakCount} Day Streak! 🔥`);
  }, [triggerReward]);

  const value: RewardContextType = {
    rewardState,
    triggerReward,
    triggerTaskReward,
    triggerGoalReward,
    triggerStreakReward,
    hideReward
  };

  return (
    <RewardContext.Provider value={value}>
      {children}
    </RewardContext.Provider>
  );
};

export const useReward = (): RewardContextType => {
  const context = useContext(RewardContext);
  if (context === undefined) {
    throw new Error('useReward must be used within a RewardProvider');
  }
  return context;
};

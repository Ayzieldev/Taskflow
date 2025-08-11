import { useState, useCallback } from 'react';

interface RewardAnimationState {
  isVisible: boolean;
  message?: string;
  type: 'task' | 'goal' | 'streak';
}

export const useRewardAnimation = () => {
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

  return {
    rewardState,
    triggerReward,
    triggerTaskReward,
    triggerGoalReward,
    triggerStreakReward,
    hideReward
  };
};

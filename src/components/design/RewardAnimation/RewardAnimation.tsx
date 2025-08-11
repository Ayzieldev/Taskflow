import React, { useEffect, useState } from 'react';
import './RewardAnimation.scss';

interface RewardAnimationProps {
  isVisible: boolean;
  message?: string;
  onComplete?: () => void;
  className?: string;
  type?: 'task' | 'goal' | 'streak';
  duration?: number;
}

const RewardAnimation: React.FC<RewardAnimationProps> = ({
  isVisible,
  message = 'Great job!',
  onComplete,
  className = '',
  type = 'task',
  duration = 3000
}) => {
  const [showAnimation, setShowAnimation] = useState(false);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (isVisible) {
      setShowAnimation(true);
      generateConfetti();
      
      const timer = setTimeout(() => {
        setShowAnimation(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onComplete]);

  const generateConfetti = () => {
    const confettiPieces = [];
    const colors = ['#d8b2ff', '#b266ff', '#4500e2', '#ffd700', '#ff6b6b', '#4ecdc4'];
    
    for (let i = 0; i < 50; i++) {
      confettiPieces.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setConfetti(confettiPieces);
  };

  const getIcon = () => {
    switch (type) {
      case 'goal':
        return '🎯';
      case 'streak':
        return '🔥';
      default:
        return '🎉';
    }
  };

  const getMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'goal':
        return 'Goal Completed!';
      case 'streak':
        return 'Streak Extended!';
      default:
        return 'Task Completed!';
    }
  };

  if (!showAnimation) return null;

  return (
    <div className={`reward-animation ${className}`}>
      {/* Confetti pieces */}
      {confetti.map((piece) => (
        <div
          key={piece.id}
          className="reward-animation__confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            backgroundColor: piece.color,
            animationDelay: `${Math.random() * 0.5}s`
          }}
        />
      ))}
      
      {/* Main reward content */}
      <div className="reward-animation__content">
        <div className="reward-animation__icon">
          {getIcon()}
        </div>
        <div className="reward-animation__message">
          {getMessage()}
        </div>
        
        {/* Golden glow effect for special achievements */}
        {type === 'goal' && (
          <div className="reward-animation__golden-glow" />
        )}
      </div>
    </div>
  );
};

export default RewardAnimation;

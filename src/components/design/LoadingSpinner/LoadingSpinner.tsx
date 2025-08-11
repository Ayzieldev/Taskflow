import React from 'react';
import './LoadingSpinner.scss';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'var(--primary-color)', 
  className = '' 
}) => {
  return (
    <div className={`loading-spinner loading-spinner--${size} ${className}`}>
      <div 
        className="loading-spinner__spinner"
        style={{ borderTopColor: color }}
      ></div>
    </div>
  );
};

export default LoadingSpinner; 
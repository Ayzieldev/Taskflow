import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { QueryClientProviderWrapper } from '@/context/QueryClient';
import { RewardProvider, useReward } from '@/context/RewardContext';
import { useElectron, isElectronApp } from '@/hooks/useElectron';
import './styles/main.scss';

// Components
import Header from '@/components/design/Header/Header';
import DesktopHeader from '@/components/design/DesktopHeader/DesktopHeader';
import RewardAnimation from '@/components/design/RewardAnimation/RewardAnimation';
import MobileInstallPrompt from '@/components/design/MobileInstallPrompt/MobileInstallPrompt';

// Pages
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import GoalDetailPage from '@/pages/GoalDetailPage';
import GoalCreationPage from '@/pages/GoalCreationPage';
import TaskCreationPage from '@/pages/TaskCreationPage';

import DayTasksPage from '@/pages/DayTasksPage';

const App: React.FC = () => {
  // Add electron class to body when running in Electron
  useEffect(() => {
    if (isElectronApp()) {
      document.body.classList.add('electron');
    } else {
      document.body.classList.remove('electron');
    }
  }, []);

  return (
    <QueryClientProviderWrapper>
      <ThemeProvider>
        <RewardProvider>
          <Router>
            <div className="app">
              <DesktopHeader />
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/goal/:id" element={<GoalDetailPage />} />
                  <Route path="/create" element={<GoalCreationPage />} />
                  <Route path="/create-task" element={<TaskCreationPage />} />

                  <Route path="/weekly-tasks/:day" element={<DayTasksPage />} />
                </Routes>
              </main>
              <RewardAnimationWrapper />
              <MobileInstallPrompt />
               </div>
            </Router>
        </RewardProvider>
      </ThemeProvider>
    </QueryClientProviderWrapper>
  );
};

// Wrapper component to use the reward context
const RewardAnimationWrapper: React.FC = () => {
  const { rewardState, hideReward } = useReward();
  
  return (
    <RewardAnimation
      isVisible={rewardState.isVisible}
      message={rewardState.message}
      type={rewardState.type}
      onComplete={hideReward}
      className={`reward-animation--${rewardState.type}`}
    />
  );
};

export default App; 
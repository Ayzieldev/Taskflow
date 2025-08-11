import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      <div className="container">
        <section className="hero">
          <div className="hero__badge">
            <span>✨ Trusted by 10,000+ users</span>
          </div>
          
          <h1 className='hero__title'>Flexible Goal Tracker</h1>
          <p className="hero__subtitle">Track your goals with flexible task management and rewarding progress</p>
          
          <div className="hero__stats">
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50K+</span>
              <span className="stat-label">Goals Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">24/7</span>
              <span className="stat-label">Offline Support</span>
            </div>
          </div>
          
          <div className="hero__actions">
            <Link to="/dashboard" className="btn btn--primary">
              Get Started
            </Link>
            <Link to="/daily-tasks" className="btn btn--secondary">
              Daily Tasks
            </Link>
          </div>
          
          <div className="hero__testimonial">
            <div className="testimonial-content">
              <p>"This app completely changed how I approach my goals. The flexible task system is exactly what I needed!"</p>
              <div className="testimonial-author">
                <div className="author-avatar">👤</div>
                <div className="author-info">
                  <span className="author-name">Sarah Johnson</span>
                  <span className="author-title">Product Manager</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="features">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Flexible Tasks</h3>
              <p>Create single tasks or grouped tasks with subtasks</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Step-by-Step Mode</h3>
              <p>Lock tasks in sequence for structured progress</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎁</div>
              <h3>Rewards System</h3>
              <p>Set rewards for task completion and goal achievement</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Offline Support</h3>
              <p>Work offline and sync when you're back online</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Daily Routines</h3>
              <p>Build habits with daily and weekly recurring tasks</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomePage; 
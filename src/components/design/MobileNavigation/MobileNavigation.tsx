import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '@/context/ThemeContext';
import './MobileNavigation.scss';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  badge?: number;
}

const MobileNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      path: '/'
    },
    {
      id: 'dashboard',
      label: 'Goals',
      icon: '🎯',
      path: '/dashboard'
    },
    {
      id: 'daily',
      label: 'Daily',
      icon: '📅',
      path: '/dashboard?tab=daily'
    },
    {
      id: 'weekly',
      label: 'Weekly',
      icon: '📊',
      path: '/dashboard?tab=weekly'
    },
    {
      id: 'create',
      label: 'Create',
      icon: '➕',
      path: '/create'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    if (path.includes('?')) {
      const [basePath, query] = path.split('?');
      return location.pathname === basePath && location.search.includes(query);
    }
    return location.pathname === path;
  };

  return (
    <nav className={`mobile-navigation mobile-navigation--${theme}`}>
      <div className="mobile-navigation__container">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`mobile-navigation__item ${
              isActive(item.path) ? 'mobile-navigation__item--active' : ''
            }`}
            onClick={() => handleNavigation(item.path)}
            aria-label={item.label}
          >
            <div className="mobile-navigation__icon">
              {item.icon}
              {item.badge && item.badge > 0 && (
                <span className="mobile-navigation__badge">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </div>
            <span className="mobile-navigation__label">{item.label}</span>
          </button>
        ))}
      </div>
      
      {/* Active indicator bar */}
      <div className="mobile-navigation__indicator" />
    </nav>
  );
};

export default MobileNavigation;

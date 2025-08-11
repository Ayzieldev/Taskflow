import React from 'react';
import './Footer.scss';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__content">
          <p>&copy; 2024 Goal Tracker. Built with React & TypeScript.</p>
          <div className="footer__links">
            <a href="#" className="footer__link">Privacy</a>
            <a href="#" className="footer__link">Terms</a>
            <a href="#" className="footer__link">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
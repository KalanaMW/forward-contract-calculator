import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container footer-inner">
        <div className="footer-left">
          <span className="footer-copy">&copy; 2026 IS4350 Financial Engineering &bull; University of Moratuwa</span>
        </div>
        <div>
          <span className="footer-tag">React 16.13.1 + ASP.NET Core net6.0</span>
        </div>
      </div>
    </footer>
  );
};

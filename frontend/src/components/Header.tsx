import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="app-header">
      <div className="container header-inner">
        {/* Brand & Project Identity */}
        <div className="brand">
          <div className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div className="brand-info">
            <span className="brand-title">Forward Contract Calculator</span>
            <span className="brand-subtitle">IS4350 Financial Engineering</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="app-nav" aria-label="Main Navigation">
          <a href="#calculator" className="nav-link">Parameters</a>
          <a href="#dashboard" className="nav-link active">Dashboard</a>
          <a href="#chart" className="nav-link">Payoff Chart</a>
          <a href="#history" className="nav-link">History</a>
          <a href="#theory" className="nav-link">Theory</a>
          <a href="#academic" className="nav-link">Project Info</a>
        </nav>

        {/* Institutional Badge */}
        <div className="header-badges">
          <div className="academic-badge">
            <span className="badge-dot" aria-hidden="true" />
            <span>University of Moratuwa</span>
          </div>
        </div>
      </div>
    </header>
  );
};

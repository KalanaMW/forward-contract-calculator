import React from 'react';

export const AcademicInfo: React.FC = () => {
  return (
    <section className="academic-section" id="academic" aria-labelledby="academic-heading">
      <h3 id="academic-heading" className="visually-hidden">Academic Information</h3>
      <div className="academic-grid">
        <div className="academic-item">
          <span className="academic-label">Module</span>
          <span className="academic-value">IS4350 Financial Engineering</span>
        </div>
        <div className="academic-item">
          <span className="academic-label">Institution</span>
          <span className="academic-value">University of Moratuwa</span>
        </div>
        <div className="academic-item">
          <span className="academic-label">Assignment Task</span>
          <span className="academic-value">Issue #1: Full-Stack React + .NET Setup</span>
        </div>
        <div className="academic-item">
          <span className="academic-label">Settlement Standard</span>
          <span className="academic-value">Zero-Sum Linear Derivative</span>
        </div>
      </div>
    </section>
  );
};

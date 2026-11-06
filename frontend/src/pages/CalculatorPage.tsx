import React, { useState, useEffect } from 'react';
import { CalculatorForm } from '../components/CalculatorForm';
import { TheorySection } from '../components/TheorySection';
import { AcademicInfo } from '../components/AcademicInfo';
import { apiService, HealthResponse } from '../services/apiService';

export const CalculatorPage: React.FC = () => {
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    // Attempt health check on initial load (optional graceful degraded status)
    apiService
      .checkHealth()
      .then((data) => setApiHealth(data))
      .catch(() => {
        // Backend not yet running or still starting
      });
  }, []);

  return (
    <main className="main-content">
      <div className="container">
        {/* Hero Introduction Banner */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-pill">
            <span>Financial Derivative Pricing &bull; React 16 + ASP.NET Core</span>
          </div>
          <h1 id="hero-title" className="hero-title">
            Forward Contract <span className="gradient-text">Profit/Loss Calculator</span>
          </h1>
          <p className="hero-description">
            A dedicated financial engineering workspace to model, evaluate, and visualize payoff outcomes for long and short forward positions upon contract maturity.
          </p>

          {apiHealth && (
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.75rem', color: '#10b981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              API Connected: {apiHealth.service} ({apiHealth.framework}) - {apiHealth.status}
            </div>
          )}
        </section>

        {/* Two-Column Calculator Layout */}
        <div className="calculator-layout">
          <CalculatorForm />
          <TheorySection />
        </div>

        {/* Academic Details */}
        <AcademicInfo />
      </div>
    </main>
  );
};

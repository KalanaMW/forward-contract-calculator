import React from 'react';
import { PayoffResult } from '../types/payoff';
import { PayoffCard } from './PayoffCard';
import { formatCurrency } from '../utils/formatters';

export interface ResultsDashboardProps {
  result?: PayoffResult | null;
}

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({ result }) => {
  return (
    <section className="card dashboard-card" id="dashboard" aria-labelledby="dashboard-heading">
      {/* Dashboard Section Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          </div>
          <div>
            <h2 id="dashboard-heading" className="card-title">Payoff Results Dashboard</h2>
          </div>
        </div>

        {result ? (
          <span className="card-status-badge active-status">
            Calculated: {result.calculatedAt}
          </span>
        ) : (
          <span className="card-status-badge empty-status">
            Awaiting Calculation
          </span>
        )}
      </div>

      {/* Conditional Rendering: Empty State vs Active Payoff Cards */}
      {!result ? (
        <div className="dashboard-empty-state" aria-live="polite">
          <div className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No Payoff Calculations Generated Yet</h3>
          <p className="empty-state-description">
            Specify the <strong>Agreed Forward Price (K)</strong>, <strong>Market Price at Maturity (S)</strong>, and <strong>Quantity (Q)</strong> in the contract parameters form and click <strong>Calculate Payoffs</strong> to evaluate buyer and seller outcomes.
          </p>

          <div className="empty-state-features">
            <div className="feature-pill">
              <span className="pill-dot green" />
              <span>Buyer Long Payoff: (S - K) × Q</span>
            </div>
            <div className="feature-pill">
              <span className="pill-dot amber" />
              <span>Seller Short Payoff: (K - S) × Q</span>
            </div>
            <div className="feature-pill">
              <span className="pill-dot blue" />
              <span>Zero-Sum Bilateral Balance</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="dashboard-results-container">
          {/* Quick Metrics Strip */}
          <div className="quick-metrics-strip">
            <div className="metric-box">
              <span className="metric-label">Price Spread |S - K|</span>
              <span className="metric-value">
                {formatCurrency(Math.abs(result.parameters.marketPrice - result.parameters.agreedPrice))}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Contract Inception Size (K × Q)</span>
              <span className="metric-value">
                {formatCurrency(result.parameters.agreedPrice * result.parameters.quantity)}
              </span>
            </div>
            <div className="metric-box">
              <span className="metric-label">Maturity Spot Valuation (S × Q)</span>
              <span className="metric-value">
                {formatCurrency(result.parameters.marketPrice * result.parameters.quantity)}
              </span>
            </div>
            <div className="metric-box highlight">
              <span className="metric-label">Net System Balance</span>
              <span className="metric-value zero-sum">
                {formatCurrency(result.buyerPayoff + result.sellerPayoff)}
              </span>
            </div>
          </div>

          {/* Dual Payoff Cards Grid */}
          <div className="payoff-cards-grid">
            {/* Buyer (Long) Card */}
            <PayoffCard
              role="buyer"
              title="Buyer Payoff (Long Position)"
              payoff={result.buyerPayoff}
              outcome={result.buyerOutcome}
              parameters={result.parameters}
            />

            {/* Seller (Short) Card */}
            <PayoffCard
              role="seller"
              title="Seller Payoff (Short Position)"
              payoff={result.sellerPayoff}
              outcome={result.sellerOutcome}
              parameters={result.parameters}
            />
          </div>
        </div>
      )}
    </section>
  );
};

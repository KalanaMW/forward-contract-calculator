import React from 'react';
import { ContractParameters, PositionOutcome } from '../types/payoff';
import { formatCurrency, formatNumber } from '../utils/formatters';

export interface PayoffCardProps {
  role: 'buyer' | 'seller';
  title: string;
  payoff: number;
  outcome: PositionOutcome;
  parameters: ContractParameters;
  currency?: string;
}

export const PayoffCard: React.FC<PayoffCardProps> = ({
  role,
  title,
  payoff,
  outcome,
  parameters,
  currency = 'LKR',
}) => {
  const isBuyer = role === 'buyer';
  const unitPayoff = isBuyer
    ? parameters.marketPrice - parameters.agreedPrice
    : parameters.agreedPrice - parameters.marketPrice;

  // Outcome color themes
  const outcomeClass = `outcome-${outcome}`; // outcome-profit, outcome-loss, outcome-breakeven
  const roleClass = `role-${role}`;          // role-buyer, role-seller

  return (
    <article className={`payoff-result-card ${roleClass} ${outcomeClass}`}>
      {/* Card Top Banner */}
      <div className="payoff-card-header">
        <div className="payoff-role-badge">
          <span className="role-icon" aria-hidden="true">
            {isBuyer ? (
              <svg viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" fill="none">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" fill="none">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
            )}
          </span>
          <span className="role-name">{title}</span>
        </div>

        {/* Outcome Tag */}
        <span className={`outcome-pill pill-${outcome}`}>
          {outcome === 'profit' && 'PROFIT'}
          {outcome === 'loss' && 'LOSS'}
          {outcome === 'breakeven' && 'BREAK-EVEN'}
        </span>
      </div>

      {/* Main Payoff Value Display */}
      <div className="payoff-value-section">
        <span className="payoff-caption">Net Settlement Payoff</span>
        <div className={`payoff-amount amount-${outcome}`}>
          {formatCurrency(payoff, currency, true)}
        </div>
        <div className="payoff-unit-rate">
          <span>Per Unit Payoff:</span>
          <strong className={`unit-rate-${outcome}`}>
            {formatCurrency(unitPayoff, currency, true)} / unit
          </strong>
        </div>
      </div>

      {/* Contract Parameters Recap */}
      <div className="payoff-params-breakdown">
        <div className="param-cell">
          <span className="cell-label">Agreed Price (K)</span>
          <span className="cell-value">{formatCurrency(parameters.agreedPrice, currency)}</span>
        </div>
        <div className="param-cell">
          <span className="cell-label">Market Price (S)</span>
          <span className="cell-value">{formatCurrency(parameters.marketPrice, currency)}</span>
        </div>
        <div className="param-cell">
          <span className="cell-label">Quantity (Q)</span>
          <span className="cell-value">{formatNumber(parameters.quantity)} Units</span>
        </div>
      </div>

      {/* Formula Mathematical Evaluation */}
      <div className="payoff-formula-footer">
        <span className="formula-tag">Evaluated Expression:</span>
        <code className="formula-eval">
          {isBuyer ? (
            <>
              ({formatNumber(parameters.marketPrice, 2)} - {formatNumber(parameters.agreedPrice, 2)}) × {formatNumber(parameters.quantity)}
            </>
          ) : (
            <>
              ({formatNumber(parameters.agreedPrice, 2)} - {formatNumber(parameters.marketPrice, 2)}) × {formatNumber(parameters.quantity)}
            </>
          )}
        </code>
      </div>
    </article>
  );
};

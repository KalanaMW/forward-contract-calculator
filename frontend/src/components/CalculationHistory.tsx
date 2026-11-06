import React from 'react';
import { CalculationHistoryItem } from '../types/payoff';
import { formatCurrency, formatNumber } from '../utils/formatters';

export interface CalculationHistoryProps {
  history: CalculationHistoryItem[];
  onClearHistory: () => void;
  onSelectHistoryItem?: (item: CalculationHistoryItem) => void;
}

export const CalculationHistory: React.FC<CalculationHistoryProps> = ({
  history,
  onClearHistory,
  onSelectHistoryItem,
}) => {
  const handleClearWithConfirmation = () => {
    if (window.confirm('Are you sure you want to clear your saved calculation history?')) {
      onClearHistory();
    }
  };

  return (
    <section className="card history-card" id="history" aria-labelledby="history-heading">
      {/* History Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <h2 id="history-heading" className="card-title">Calculation History</h2>
          </div>
        </div>

        <div className="history-header-actions">
          {history.length > 0 && (
            <>
              <span className="history-count-badge">
                {history.length} {history.length === 1 ? 'Record' : 'Records'}
              </span>
              <button
                type="button"
                className="btn btn-clear-history"
                onClick={handleClearWithConfirmation}
                aria-label="Clear calculation history"
              >
                <svg viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                <span>Clear History</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* History Content: Empty State vs Populated Table */}
      {history.length === 0 ? (
        <div className="history-empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="empty-state-title">No Previous Calculations Recorded</h3>
          <p className="empty-state-description">
            Your forward contract evaluation runs will be tracked here with input parameters and settlement payoffs for side-by-side scenario analysis.
          </p>
        </div>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table" aria-label="Forward Contract Calculation History">
            <thead>
              <tr>
                <th scope="col">Timestamp</th>
                <th scope="col">Delivery Price (K)</th>
                <th scope="col">Maturity Spot (S)</th>
                <th scope="col">Quantity (Q)</th>
                <th scope="col">Buyer Payoff</th>
                <th scope="col">Seller Payoff</th>
                {onSelectHistoryItem && <th scope="col">Action</th>}
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="history-row">
                  <td className="cell-timestamp">
                    <span className="timestamp-text">{item.timestamp}</span>
                  </td>
                  <td className="cell-mono">
                    {formatCurrency(item.parameters.agreedPrice)}
                  </td>
                  <td className="cell-mono">
                    {formatCurrency(item.parameters.marketPrice)}
                  </td>
                  <td className="cell-mono">
                    {formatNumber(item.parameters.quantity)} Units
                  </td>
                  <td>
                    <span className={`history-pill pill-${item.buyerOutcome}`}>
                      {formatCurrency(item.buyerPayoff, 'LKR', true)}
                    </span>
                  </td>
                  <td>
                    <span className={`history-pill pill-${item.sellerOutcome}`}>
                      {formatCurrency(item.sellerPayoff, 'LKR', true)}
                    </span>
                  </td>
                  {onSelectHistoryItem && (
                    <td>
                      <button
                        type="button"
                        className="btn btn-table-action"
                        onClick={() => onSelectHistoryItem(item)}
                        title="Load parameters into calculator form"
                      >
                        Load
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

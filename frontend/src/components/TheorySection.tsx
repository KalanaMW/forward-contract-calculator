import React from 'react';

export const TheorySection: React.FC = () => {
  return (
    <section className="card theory-card" id="theory" aria-labelledby="theory-heading">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div>
            <h2 id="theory-heading" className="card-title">Theory &amp; Payoff Formulas</h2>
          </div>
        </div>
        <span className="card-status-badge">IS4350 Reference</span>
      </div>

      {/* Conceptual Overview */}
      <article className="theory-concept">
        <h3 className="theory-heading">
          <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          What is a Forward Contract?
        </h3>
        <p className="theory-text">
          A <strong>Forward Contract</strong> is a customized, over-the-counter (OTC) financial derivative agreement between two counterparties to buy or sell an underlying asset at a specified price (<em>Forward Price, K</em>) on an agreed future maturity date. No initial capital is exchanged at contract inception, and both counterparties bear mutual performance obligations.
        </p>
      </article>

      {/* Payoff Formulas Section */}
      <div className="formulas-grid" id="formulas">
        {/* Buyer (Long Position) Card */}
        <article className="formula-card buyer">
          <div className="formula-header">
            <div className="formula-role">
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
              <span>Buyer Payoff</span>
            </div>
            <span className="position-tag">Long Position</span>
          </div>
          <div className="formula-box">
            <span className="formula-math">
              Payoff<sub>Buyer</sub> <span className="operator">=</span> (<span className="var-highlight">S</span> <span className="operator">-</span> <span className="var-highlight">K</span>) <span className="operator">×</span> <span className="var-highlight">Q</span>
            </span>
          </div>
          <p className="formula-desc">
            The buyer commits to purchasing at forward price <span className="var-highlight">K</span>. When market spot price <span className="var-highlight">S &gt; K</span>, the buyer gains an advantage by acquiring the asset below current market value.
          </p>
          <div className="scenario-list">
            <div className="scenario-item">
              <span className="scenario-badge">S &gt; K</span>
              <span>Net Profit (Gain)</span>
            </div>
            <div className="scenario-item">
              <span className="scenario-badge">S &lt; K</span>
              <span>Net Loss (Deficit)</span>
            </div>
          </div>
        </article>

        {/* Seller (Short Position) Card */}
        <article className="formula-card seller">
          <div className="formula-header">
            <div className="formula-role">
              <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                <polyline points="17 18 23 18 23 12" />
              </svg>
              <span>Seller Payoff</span>
            </div>
            <span className="position-tag">Short Position</span>
          </div>
          <div className="formula-box">
            <span className="formula-math">
              Payoff<sub>Seller</sub> <span className="operator">=</span> (<span className="var-highlight">K</span> <span className="operator">-</span> <span className="var-highlight">S</span>) <span className="operator">×</span> <span className="var-highlight">Q</span>
            </span>
          </div>
          <p className="formula-desc">
            The seller commits to delivering at forward price <span className="var-highlight">K</span>. When market spot price <span className="var-highlight">S &lt; K</span>, the seller sells above prevailing market spot value.
          </p>
          <div className="scenario-list">
            <div className="scenario-item">
              <span className="scenario-badge">K &gt; S</span>
              <span>Net Profit (Gain)</span>
            </div>
            <div className="scenario-item">
              <span className="scenario-badge">K &lt; S</span>
              <span>Net Loss (Deficit)</span>
            </div>
          </div>
        </article>
      </div>

      {/* Variable Glossary / Legend */}
      <div className="parameters-legend">
        <h4 className="legend-title">Mathematical Notations</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-symbol">K</span>
            <span className="legend-desc">Agreed Forward Price (LKR)</span>
          </div>
          <div className="legend-item">
            <span className="legend-symbol">S</span>
            <span className="legend-desc">Maturity Spot Price (LKR)</span>
          </div>
          <div className="legend-item">
            <span className="legend-symbol">Q</span>
            <span className="legend-desc">Contract Size (Units)</span>
          </div>
        </div>
      </div>
    </section>
  );
};

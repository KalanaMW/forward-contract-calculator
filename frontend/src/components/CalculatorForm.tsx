import React, { useState } from 'react';

interface ContractFormState {
  agreedPrice: string;
  marketPrice: string;
  quantity: string;
}

const DEFAULT_STATE: ContractFormState = {
  agreedPrice: '210',
  marketPrice: '240',
  quantity: '100',
};

export interface CalculatorFormProps {
  onCalculate?: (params: { agreedPrice: number; marketPrice: number; quantity: number }) => void;
  onReset?: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, onReset }) => {
  const [formData, setFormData] = useState<ContractFormState>(DEFAULT_STATE);
  const [submittedNotice, setSubmittedNotice] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSubmittedNotice(false);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedNotice(true);
    if (onCalculate) {
      onCalculate({
        agreedPrice: parseFloat(formData.agreedPrice) || 0,
        marketPrice: parseFloat(formData.marketPrice) || 0,
        quantity: parseFloat(formData.quantity) || 0,
      });
    }
  };

  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormData(DEFAULT_STATE);
    setSubmittedNotice(false);
    if (onReset) {
      onReset();
    }
  };

  return (
    <section className="card form-card" id="calculator" aria-labelledby="form-heading">
      {/* Card Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" />
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="16" y1="14" x2="16" y2="18" />
              <path d="M16 10h.01" />
              <path d="M12 10h.01" />
              <path d="M8 10h.01" />
              <path d="M12 14h.01" />
              <path d="M8 14h.01" />
              <path d="M12 18h.01" />
              <path d="M8 18h.01" />
            </svg>
          </div>
          <div>
            <h2 id="form-heading" className="card-title">Contract Parameters</h2>
          </div>
        </div>
        <span className="card-status-badge">Currency: LKR</span>
      </div>

      {/* Parameter Entry Form */}
      <form
        id="contractForm"
        className="contract-form"
        onSubmit={handleSubmit}
        onReset={handleReset}
        noValidate
      >
        <p className="form-intro-note">
          Specify the contract terms and the anticipated spot price at maturity to compute the net settlement payoff.
        </p>

        {/* Input 1: Agreed Forward Price (K) */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="agreedPrice" className="form-label">
              <span>Agreed Forward Price</span>
              <span className="variable-symbol" title="Delivery Price Symbol">K</span>
            </label>
            <span className="parameter-tag">Delivery Price</span>
          </div>
          <div className="input-container">
            <span className="input-affix prefix" aria-hidden="true">LKR</span>
            <input
              type="number"
              id="agreedPrice"
              name="agreedPrice"
              className="form-input"
              value={formData.agreedPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="210.00"
              required
              aria-describedby="agreedPriceDesc"
            />
          </div>
          <p id="agreedPriceDesc" className="form-helper">
            Pre-agreed forward delivery price per unit stipulated at contract inception.
          </p>
        </div>

        {/* Input 2: Market Price at Maturity (S) */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="marketPrice" className="form-label">
              <span>Market Price at Maturity</span>
              <span className="variable-symbol" title="Maturity Spot Price Symbol">S</span>
            </label>
            <span className="parameter-tag">Spot Price</span>
          </div>
          <div className="input-container">
            <span className="input-affix prefix" aria-hidden="true">LKR</span>
            <input
              type="number"
              id="marketPrice"
              name="marketPrice"
              className="form-input"
              value={formData.marketPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              placeholder="240.00"
              required
              aria-describedby="marketPriceDesc"
            />
          </div>
          <p id="marketPriceDesc" className="form-helper">
            Actual prevailing spot market price per unit of the underlying asset on delivery date.
          </p>
        </div>

        {/* Input 3: Quantity (Q) */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="quantity" className="form-label">
              <span>Contract Quantity</span>
              <span className="variable-symbol" title="Quantity Symbol">Q</span>
            </label>
            <span className="parameter-tag">Volume</span>
          </div>
          <div className="input-container">
            <input
              type="number"
              id="quantity"
              name="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={handleChange}
              step="1"
              min="1"
              placeholder="100"
              required
              aria-describedby="quantityDesc"
            />
            <span className="input-affix suffix" aria-hidden="true">Units</span>
          </div>
          <p id="quantityDesc" className="form-helper">
            Total contracted volume of the underlying asset across the trade.
          </p>
        </div>

        {/* Form Action Controls */}
        <div className="form-actions">
          <button type="submit" id="calculateBtn" className="btn btn-primary">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <span>Calculate Payoffs</span>
          </button>
          <button type="reset" id="resetBtn" className="btn btn-secondary">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>

        {submittedNotice && (
          <div style={{ marginTop: '0.75rem', padding: '0.625rem 0.875rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', fontSize: '0.8125rem', color: '#60a5fa' }}>
            Parameters captured: K = {formData.agreedPrice} LKR, S = {formData.marketPrice} LKR, Q = {formData.quantity} Units. (Payoff computation backend integration in Issue #4).
          </div>
        )}

        {/* Currency Convention Note */}
        <div className="form-disclaimer">
          <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>Values denominated in Sri Lankan Rupees (LKR) standard lot convention.</span>
        </div>
      </form>
    </section>
  );
};

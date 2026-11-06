import React, { useState, useRef } from 'react';
import {
  validateAgreedPrice,
  validateMarketPrice,
  validateQuantity,
  validateContractForm,
  FormValidationErrors,
  ValidatedContractParams,
  RawContractFormData,
} from '../utils/validation';
import { formatCurrency, formatNumber } from '../utils/formatters';

const DEFAULT_STATE: RawContractFormData = {
  agreedPrice: '210',
  marketPrice: '240',
  quantity: '100',
};

export interface CalculatorFormProps {
  onCalculate?: (params: ValidatedContractParams) => void;
  onReset?: () => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ onCalculate, onReset }) => {
  const [formData, setFormData] = useState<RawContractFormData>(DEFAULT_STATE);
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [touched, setTouched] = useState<Record<keyof RawContractFormData, boolean>>({
    agreedPrice: false,
    marketPrice: false,
    quantity: false,
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validatedParams, setValidatedParams] = useState<ValidatedContractParams | null>(null);
  const [formSummaryError, setFormSummaryError] = useState<string | null>(null);

  // Field element references for accessible auto-focus on error
  const agreedPriceRef = useRef<HTMLInputElement | null>(null);
  const marketPriceRef = useRef<HTMLInputElement | null>(null);
  const quantityRef = useRef<HTMLInputElement | null>(null);

  /**
   * Validate a single field by key and update the error state
   */
  const validateField = (field: keyof RawContractFormData, value: string): string | undefined => {
    let result;
    switch (field) {
      case 'agreedPrice':
        result = validateAgreedPrice(value);
        break;
      case 'marketPrice':
        result = validateMarketPrice(value);
        break;
      case 'quantity':
        result = validateQuantity(value);
        break;
    }

    const fieldError = result.isValid ? undefined : result.error;

    setErrors((prev) => ({
      ...prev,
      [field]: fieldError,
    }));

    return fieldError;
  };

  /**
   * Controlled input change handler:
   * Updates state and clears or updates errors if the field was already touched
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof RawContractFormData;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    // If field has already been touched or currently has an error, revalidate immediately to clear error upon valid correction
    if (touched[fieldName] || errors[fieldName]) {
      validateField(fieldName, value);
    }

    // Reset summary message on user edit
    setFormSummaryError(null);
    setValidatedParams(null);
  };

  /**
   * Input blur handler:
   * Marks field as touched and validates on blur for immediate, gentle feedback
   */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const fieldName = name as keyof RawContractFormData;

    setTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));

    validateField(fieldName, value);
  };

  /**
   * Validated form submission handler:
   * Validates all fields, prevents duplicate submissions, and blocks invalid payloads
   */
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent duplicate submissions while processing
    if (isSubmitting) return;

    // Mark all fields as touched
    setTouched({
      agreedPrice: true,
      marketPrice: true,
      quantity: true,
    });

    const validationResult = validateContractForm(formData);

    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      setFormSummaryError('Please correct the highlighted errors before calculating payoffs.');
      setValidatedParams(null);

      // Auto-focus the first invalid field for accessibility
      if (validationResult.errors.agreedPrice) {
        agreedPriceRef.current?.focus();
      } else if (validationResult.errors.marketPrice) {
        marketPriceRef.current?.focus();
      } else if (validationResult.errors.quantity) {
        quantityRef.current?.focus();
      }
      return;
    }

    // Clear errors upon full validity
    setErrors({});
    setFormSummaryError(null);
    setIsSubmitting(true);

    const validData = validationResult.data!;
    setValidatedParams(validData);

    // Provide typed validated object to parent callback
    if (onCalculate) {
      onCalculate(validData);
    }

    // Reset processing flag
    setTimeout(() => {
      setIsSubmitting(false);
    }, 250);
  };

  /**
   * Reset handler:
   * Restores default values, clears all field errors, touched states, and notices
   */
  const handleReset = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormData(DEFAULT_STATE);
    setErrors({});
    setTouched({
      agreedPrice: false,
      marketPrice: false,
      quantity: false,
    });
    setFormSummaryError(null);
    setValidatedParams(null);
    setIsSubmitting(false);

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
          Specify the forward contract terms and anticipated expiration spot price to model financial counterparty positions.
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

          <div className={`input-container ${errors.agreedPrice ? 'has-error' : ''}`}>
            <span className="input-affix prefix" aria-hidden="true">LKR</span>
            <input
              ref={agreedPriceRef}
              type="number"
              id="agreedPrice"
              name="agreedPrice"
              className="form-input"
              value={formData.agreedPrice}
              onChange={handleChange}
              onBlur={handleBlur}
              step="any"
              min="0"
              placeholder="210.00"
              required
              aria-required="true"
              aria-invalid={!!errors.agreedPrice}
              aria-describedby={errors.agreedPrice ? 'agreedPriceError' : 'agreedPriceDesc'}
            />
          </div>

          {errors.agreedPrice ? (
            <span id="agreedPriceError" className="form-field-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errors.agreedPrice}</span>
            </span>
          ) : (
            <p id="agreedPriceDesc" className="form-helper">
              Pre-agreed forward delivery price per unit stipulated at contract inception (must be ≥ 0).
            </p>
          )}
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

          <div className={`input-container ${errors.marketPrice ? 'has-error' : ''}`}>
            <span className="input-affix prefix" aria-hidden="true">LKR</span>
            <input
              ref={marketPriceRef}
              type="number"
              id="marketPrice"
              name="marketPrice"
              className="form-input"
              value={formData.marketPrice}
              onChange={handleChange}
              onBlur={handleBlur}
              step="any"
              min="0"
              placeholder="240.00"
              required
              aria-required="true"
              aria-invalid={!!errors.marketPrice}
              aria-describedby={errors.marketPrice ? 'marketPriceError' : 'marketPriceDesc'}
            />
          </div>

          {errors.marketPrice ? (
            <span id="marketPriceError" className="form-field-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errors.marketPrice}</span>
            </span>
          ) : (
            <p id="marketPriceDesc" className="form-helper">
              Actual prevailing spot market price per unit of the underlying asset on delivery date (must be ≥ 0).
            </p>
          )}
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

          <div className={`input-container ${errors.quantity ? 'has-error' : ''}`}>
            <input
              ref={quantityRef}
              type="number"
              id="quantity"
              name="quantity"
              className="form-input"
              value={formData.quantity}
              onChange={handleChange}
              onBlur={handleBlur}
              step="any"
              min="0.0001"
              placeholder="100"
              required
              aria-required="true"
              aria-invalid={!!errors.quantity}
              aria-describedby={errors.quantity ? 'quantityError' : 'quantityDesc'}
            />
            <span className="input-affix suffix" aria-hidden="true">Units</span>
          </div>

          {errors.quantity ? (
            <span id="quantityError" className="form-field-error" role="alert">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errors.quantity}</span>
            </span>
          ) : (
            <p id="quantityDesc" className="form-helper">
              Total contracted volume of the underlying asset across the trade (must be &gt; 0).
            </p>
          )}
        </div>

        {/* Form Validation Summary Warning */}
        {formSummaryError && (
          <div className="validation-summary-banner error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <div>
              <strong>Submission Blocked:</strong> {formSummaryError}
            </div>
          </div>
        )}

        {/* Validated Parameters Notification */}
        {validatedParams && !formSummaryError && (
          <div className="validation-summary-banner success" role="status">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <strong>Input Validation Successful:</strong> Parameters verified (K = {formatCurrency(validatedParams.agreedPrice)}, S = {formatCurrency(validatedParams.marketPrice)}, Q = {formatNumber(validatedParams.quantity)} Units). Typed payload prepared for backend calculation engine.
            </div>
          </div>
        )}

        {/* Form Action Controls */}
        <div className="form-actions">
          <button
            type="submit"
            id="calculateBtn"
            className="btn btn-primary"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
            <span>{isSubmitting ? 'Validating...' : 'Calculate Payoffs'}</span>
          </button>
          <button
            type="reset"
            id="resetBtn"
            className="btn btn-secondary"
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>Reset</span>
          </button>
        </div>

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

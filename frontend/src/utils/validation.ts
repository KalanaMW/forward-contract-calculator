/**
 * Reusable Financial Input Validation Utilities
 * IS4350 Financial Engineering - Forward Contract Profit/Loss Calculator
 */

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
  value?: number;
}

export interface FormValidationErrors {
  agreedPrice?: string;
  marketPrice?: string;
  quantity?: string;
}

export interface ValidatedContractParams {
  agreedPrice: number;
  marketPrice: number;
  quantity: number;
}

export interface FormValidationResult {
  isValid: boolean;
  errors: FormValidationErrors;
  data?: ValidatedContractParams;
}

export interface RawContractFormData {
  agreedPrice: string | number;
  marketPrice: string | number;
  quantity: string | number;
}

const MAX_REASONABLE_VALUE = 1_000_000_000; // 1 Billion

/**
 * Validates the Agreed Forward Price (K):
 * - Required, non-empty
 * - Finite numeric value
 * - Non-negative (K >= 0)
 * - Supports reasonable decimal values
 */
export const validateAgreedPrice = (val: string | number): FieldValidationResult => {
  const str = typeof val === 'number' ? String(val) : (val ?? '').trim();

  if (str === '') {
    return {
      isValid: false,
      error: 'Agreed Forward Price (K) is required.',
    };
  }

  const num = Number(str);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Agreed Forward Price (K) must be a valid numeric price.',
    };
  }

  if (!isFinite(num)) {
    return {
      isValid: false,
      error: 'Agreed Forward Price (K) must be a finite number.',
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      error: 'Agreed Forward Price (K) cannot be negative (must be ≥ 0).',
    };
  }

  if (num > MAX_REASONABLE_VALUE) {
    return {
      isValid: false,
      error: `Agreed Forward Price (K) cannot exceed ${MAX_REASONABLE_VALUE.toLocaleString()} LKR.`,
    };
  }

  return {
    isValid: true,
    value: num,
  };
};

/**
 * Validates the Market Price at Maturity (S):
 * - Required, non-empty
 * - Finite numeric value
 * - Non-negative (S >= 0)
 * - Supports reasonable decimal values
 */
export const validateMarketPrice = (val: string | number): FieldValidationResult => {
  const str = typeof val === 'number' ? String(val) : (val ?? '').trim();

  if (str === '') {
    return {
      isValid: false,
      error: 'Market Price at Maturity (S) is required.',
    };
  }

  const num = Number(str);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Market Price at Maturity (S) must be a valid numeric price.',
    };
  }

  if (!isFinite(num)) {
    return {
      isValid: false,
      error: 'Market Price at Maturity (S) must be a finite number.',
    };
  }

  if (num < 0) {
    return {
      isValid: false,
      error: 'Market Price at Maturity (S) cannot be negative (must be ≥ 0).',
    };
  }

  if (num > MAX_REASONABLE_VALUE) {
    return {
      isValid: false,
      error: `Market Price at Maturity (S) cannot exceed ${MAX_REASONABLE_VALUE.toLocaleString()} LKR.`,
    };
  }

  return {
    isValid: true,
    value: num,
  };
};

/**
 * Validates the Contract Quantity (Q):
 * - Required, non-empty
 * - Finite numeric value
 * - Strictly positive (Q > 0)
 * - Supports reasonable decimal/fractional unit values
 */
export const validateQuantity = (val: string | number): FieldValidationResult => {
  const str = typeof val === 'number' ? String(val) : (val ?? '').trim();

  if (str === '') {
    return {
      isValid: false,
      error: 'Contract Quantity (Q) is required.',
    };
  }

  const num = Number(str);

  if (isNaN(num)) {
    return {
      isValid: false,
      error: 'Contract Quantity (Q) must be a valid numeric volume.',
    };
  }

  if (!isFinite(num)) {
    return {
      isValid: false,
      error: 'Contract Quantity (Q) must be a finite number.',
    };
  }

  if (num <= 0) {
    return {
      isValid: false,
      error: 'Contract Quantity (Q) must be strictly greater than zero (Q > 0).',
    };
  }

  if (num > MAX_REASONABLE_VALUE) {
    return {
      isValid: false,
      error: `Contract Quantity (Q) cannot exceed ${MAX_REASONABLE_VALUE.toLocaleString()} units.`,
    };
  }

  return {
    isValid: true,
    value: num,
  };
};

/**
 * Validates the entire contract input form and returns a typed validation result
 */
export const validateContractForm = (formData: RawContractFormData): FormValidationResult => {
  const agreedResult = validateAgreedPrice(formData.agreedPrice);
  const marketResult = validateMarketPrice(formData.marketPrice);
  const quantityResult = validateQuantity(formData.quantity);

  const errors: FormValidationErrors = {};

  if (!agreedResult.isValid) {
    errors.agreedPrice = agreedResult.error;
  }

  if (!marketResult.isValid) {
    errors.marketPrice = marketResult.error;
  }

  if (!quantityResult.isValid) {
    errors.quantity = quantityResult.error;
  }

  const isValid = agreedResult.isValid && marketResult.isValid && quantityResult.isValid;

  return {
    isValid,
    errors,
    data: isValid
      ? {
          agreedPrice: agreedResult.value!,
          marketPrice: marketResult.value!,
          quantity: quantityResult.value!,
        }
      : undefined,
  };
};

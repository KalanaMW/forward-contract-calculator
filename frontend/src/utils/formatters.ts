import { PositionOutcome } from '../types/payoff';

/**
 * Format a numeric value into a standard currency string in Sri Lankan Rupees (LKR)
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'LKR',
  includeSign: boolean = false
): string => {
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (includeSign) {
    if (amount > 0) return `+${formatted} ${currency}`;
    if (amount < 0) return `-${formatted} ${currency}`;
    return `0.00 ${currency}`;
  }

  const prefix = amount < 0 ? '-' : '';
  return `${prefix}${formatted} ${currency}`;
};

/**
 * Format standard integers or quantities with thousands separator
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Determine financial position outcome category
 */
export const getOutcomeType = (payoff: number): PositionOutcome => {
  if (payoff > 0.0001) return 'profit';
  if (payoff < -0.0001) return 'loss';
  return 'breakeven';
};

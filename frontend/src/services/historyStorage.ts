import { CalculationHistoryItem, ContractParameters, PositionOutcome } from '../types/payoff';
import { getOutcomeType } from '../utils/formatters';

const STORAGE_KEY = 'forward_contract_history_v1';
const MAX_HISTORY_RECORDS = 50;

/**
 * Validate that an object has the required structure of a CalculationHistoryItem
 */
const isValidHistoryItem = (item: any): item is CalculationHistoryItem => {
  if (!item || typeof item !== 'object') return false;
  if (typeof item.id !== 'string') return false;
  if (typeof item.timestamp !== 'string') return false;
  if (typeof item.buyerPayoff !== 'number' || isNaN(item.buyerPayoff)) return false;
  if (typeof item.sellerPayoff !== 'number' || isNaN(item.sellerPayoff)) return false;

  const params = item.parameters;
  if (!params || typeof params !== 'object') return false;
  if (typeof params.agreedPrice !== 'number' || isNaN(params.agreedPrice)) return false;
  if (typeof params.marketPrice !== 'number' || isNaN(params.marketPrice)) return false;
  if (typeof params.quantity !== 'number' || isNaN(params.quantity)) return false;

  return true;
};

export const historyStorage = {
  /**
   * Safely load calculation history from browser LocalStorage.
   * Handles empty, corrupted, or invalid data without crashing.
   */
  loadHistory(): CalculationHistoryItem[] {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      // Filter and sanitize valid records
      const validItems = parsed.filter(isValidHistoryItem).map((item) => ({
        ...item,
        buyerOutcome: (item.buyerOutcome as PositionOutcome) || getOutcomeType(item.buyerPayoff),
        sellerOutcome: (item.sellerOutcome as PositionOutcome) || getOutcomeType(item.sellerPayoff),
      }));

      return validItems;
    } catch {
      // JSON syntax error or storage security exception
      return [];
    }
  },

  /**
   * Save a newly calculated forward contract result to LocalStorage.
   * Places newest records at the top and enforces maximum item limit.
   */
  saveCalculation(
    params: ContractParameters,
    buyerPayoff: number,
    sellerPayoff: number
  ): CalculationHistoryItem[] {
    const current = this.loadHistory();

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
    }) + ', ' + now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newItem: CalculationHistoryItem = {
      id: `calc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: formattedTimestamp,
      parameters: {
        agreedPrice: params.agreedPrice,
        marketPrice: params.marketPrice,
        quantity: params.quantity,
      },
      buyerPayoff,
      sellerPayoff,
      buyerOutcome: getOutcomeType(buyerPayoff),
      sellerOutcome: getOutcomeType(sellerPayoff),
    };

    const updated = [newItem, ...current].slice(0, MAX_HISTORY_RECORDS);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // QuotaExceededError or private browsing restrictions
      }
    }

    return updated;
  },

  /**
   * Clears all calculation history entries from LocalStorage.
   */
  clearHistory(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage exceptions
      }
    }
  },
};

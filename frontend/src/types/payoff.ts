/**
 * Financial Engineering Type Definitions for Forward Contracts
 * IS4350 Financial Engineering - University of Moratuwa
 */

export interface ContractParameters {
  agreedPrice: number;    // Agreed delivery forward price K (LKR)
  marketPrice: number;    // Prevailing spot price at maturity S (LKR)
  quantity: number;       // Contracted volume/size Q (Units)
}

export type PositionOutcome = 'profit' | 'loss' | 'breakeven';

export interface PayoffResult {
  parameters: ContractParameters;
  buyerPayoff: number;     // (S - K) * Q
  sellerPayoff: number;    // (K - S) * Q
  buyerOutcome: PositionOutcome;
  sellerOutcome: PositionOutcome;
  unitPayoffBuyer: number; // S - K
  unitPayoffSeller: number;// K - S
  calculatedAt: string;    // Human-readable formatted timestamp
}

export interface ChartDataPoint {
  spotPrice: number;
  buyerPayoff: number;
  sellerPayoff: number;
}

export interface CalculationHistoryItem {
  id: string;
  timestamp: string;
  parameters: ContractParameters;
  buyerPayoff: number;
  sellerPayoff: number;
  buyerOutcome: PositionOutcome;
  sellerOutcome: PositionOutcome;
}

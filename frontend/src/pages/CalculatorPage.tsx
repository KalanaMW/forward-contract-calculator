import React, { useState, useEffect } from 'react';
import { CalculatorForm } from '../components/CalculatorForm';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { PayoffChart } from '../components/PayoffChart';
import { CalculationHistory } from '../components/CalculationHistory';
import { TheorySection } from '../components/TheorySection';
import { AcademicInfo } from '../components/AcademicInfo';
import { apiService, HealthResponse, getApiBaseUrl } from '../services/apiService';
import { historyStorage } from '../services/historyStorage';
import { ContractParameters, PayoffResult, CalculationHistoryItem } from '../types/payoff';
import { ValidatedContractParams } from '../utils/validation';
import { getOutcomeType } from '../utils/formatters';

// Development-only demonstration presets to test UI states in isolation without touching history
const DEV_SCENARIOS: Record<string, { label: string; params: ContractParameters | null; desc: string }> = {
  empty: {
    label: 'Empty State (Default)',
    params: null,
    desc: 'Default state prior to executing any calculation simulation.',
  },
  itmBuyer: {
    label: 'Scenario A: Buyer Profit (S=240, K=210)',
    params: { agreedPrice: 210, marketPrice: 240, quantity: 100 },
    desc: 'Market spot exceeds forward price (S > K). Buyer realizes profit (green), seller suffers loss (red).',
  },
  otmBuyer: {
    label: 'Scenario B: Seller Profit (S=180, K=210)',
    params: { agreedPrice: 210, marketPrice: 180, quantity: 100 },
    desc: 'Forward price exceeds market spot (K > S). Seller realizes profit (green), buyer suffers loss (red).',
  },
  breakeven: {
    label: 'Scenario C: Break-Even (S=210, K=210)',
    params: { agreedPrice: 210, marketPrice: 210, quantity: 100 },
    desc: 'Market spot equals forward price (S = K). Both counterparties break even neutrally.',
  },
};

export const CalculatorPage: React.FC = () => {
  // Live API Connection State
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);

  // Active Calculation Result State
  const [activeResult, setActiveResult] = useState<PayoffResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loadedParams, setLoadedParams] = useState<ValidatedContractParams | null>(null);

  // Calculation History State (persisted via LocalStorage)
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>('empty');

  // Load calculation history from LocalStorage and probe API health upon initial mount
  useEffect(() => {
    // 1. Load persisted history
    const savedHistory = historyStorage.loadHistory();
    setHistory(savedHistory);

    // 2. Probe backend health status
    probeApiHealth();
  }, []);

  const probeApiHealth = async () => {
    try {
      const data = await apiService.checkHealth();
      setApiHealth(data);
      setIsApiOnline(true);
    } catch {
      setApiHealth(null);
      setIsApiOnline(false);
    }
  };

  /**
   * Primary Calculate Action:
   * Calls the authoritative ASP.NET Core Web API (POST /api/forward/calculate).
   * Backend arithmetic determines the payoffs; results are saved to LocalStorage.
   */
  const handleCalculate = async (params: ValidatedContractParams) => {
    setIsLoading(true);
    setApiError(null);

    try {
      // Execute backend API request
      const response = await apiService.calculatePayoff(params);

      // Successfully connected; ensure online status reflects
      setIsApiOnline(true);

      const unitBuyer = params.marketPrice - params.agreedPrice;
      const unitSeller = params.agreedPrice - params.marketPrice;

      const payoffResult: PayoffResult = {
        parameters: params,
        buyerPayoff: response.buyerPayoff,
        sellerPayoff: response.sellerPayoff,
        buyerOutcome: getOutcomeType(response.buyerPayoff),
        sellerOutcome: getOutcomeType(response.sellerPayoff),
        unitPayoffBuyer: unitBuyer,
        unitPayoffSeller: unitSeller,
        calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Set authoritative results
      setActiveResult(payoffResult);
      setActiveScenarioKey('');

      // Persist to LocalStorage and update history state (newest first)
      const updatedHistory = historyStorage.saveCalculation(
        params,
        response.buyerPayoff,
        response.sellerPayoff
      );
      setHistory(updatedHistory);
    } catch (err: any) {
      // Clear result: never show fabricated or stale results when API requests fail
      setActiveResult(null);

      const errorMsg = err?.message || 'An unexpected error occurred while communicating with the backend API.';
      setApiError(errorMsg);

      if (errorMsg.includes('Unable to connect')) {
        setIsApiOnline(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Reset Handler:
   * Clears the current active result and input form without deleting saved history.
   */
  const handleReset = () => {
    setActiveResult(null);
    setApiError(null);
    setLoadedParams(null);
    setActiveScenarioKey('empty');
  };

  /**
   * History Record Selection:
   * Loads parameters and previously calculated payoffs into the dashboard.
   * Does NOT duplicate history records upon viewing.
   */
  const handleSelectHistoryItem = (item: CalculationHistoryItem) => {
    const unitBuyer = item.parameters.marketPrice - item.parameters.agreedPrice;
    const unitSeller = item.parameters.agreedPrice - item.parameters.marketPrice;

    const restoredResult: PayoffResult = {
      parameters: item.parameters,
      buyerPayoff: item.buyerPayoff,
      sellerPayoff: item.sellerPayoff,
      buyerOutcome: item.buyerOutcome,
      sellerOutcome: item.sellerOutcome,
      unitPayoffBuyer: unitBuyer,
      unitPayoffSeller: unitSeller,
      calculatedAt: item.timestamp,
    };

    setActiveResult(restoredResult);
    setLoadedParams({ ...item.parameters });
    setApiError(null);
    setActiveScenarioKey('');
  };

  /**
   * History Clear Handler:
   * Enforces confirmation dialog and wipes LocalStorage.
   */
  const handleClearHistory = () => {
    historyStorage.clearHistory();
    setHistory([]);
  };

  /**
   * Development scenario selector for UI inspection (Dev Mode Only).
   * Generates a preview result that is NEVER written to LocalStorage.
   */
  const handleSelectDevScenario = (key: string) => {
    setActiveScenarioKey(key);
    const scenario = DEV_SCENARIOS[key];
    if (!scenario || !scenario.params) {
      setActiveResult(null);
    } else {
      const p = scenario.params;
      const unitB = p.marketPrice - p.agreedPrice;
      const unitS = p.agreedPrice - p.marketPrice;
      const bPayoff = unitB * p.quantity;
      const sPayoff = unitS * p.quantity;

      setActiveResult({
        parameters: p,
        buyerPayoff: bPayoff,
        sellerPayoff: sPayoff,
        buyerOutcome: getOutcomeType(bPayoff),
        sellerOutcome: getOutcomeType(sPayoff),
        unitPayoffBuyer: unitB,
        unitPayoffSeller: unitS,
        calculatedAt: 'Demo Scenario',
      });
      setLoadedParams({ ...p });
    }
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Hero Introduction Banner */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-pill">
            <span>Financial Derivative Pricing &bull; Live Settlement Engine</span>
          </div>
          <h1 id="hero-title" className="hero-title">
            Forward Contract <span className="gradient-text">Profit/Loss Calculator</span>
          </h1>
          <p className="hero-description">
            A dedicated financial engineering workspace to model, evaluate, and visualize payoff outcomes for long and short forward positions upon contract maturity.
          </p>

          {/* Real-time API Connection Status Badge */}
          {isApiOnline === true && apiHealth ? (
            <div className="api-status-badge connected">
              <span className="api-status-dot" />
              API Connected: {apiHealth.service} ({apiHealth.framework}) — Healthy (Port 5050)
            </div>
          ) : isApiOnline === false ? (
            <div className="api-status-badge disconnected">
              <span className="api-status-dot" />
              API Offline: Backend not responding on {getApiBaseUrl()} (Run 'dotnet run' in backend/ForwardContract.Api)
            </div>
          ) : (
            <div className="api-status-badge checking">
              <span className="api-status-dot" />
              Checking API Connection...
            </div>
          )}
        </section>

        {/* Development Mode Only: Dashboard View Controls (hidden in production builds) */}
        {import.meta.env.DEV && (
          <section className="scenario-toolbar-card" aria-label="Development Dashboard View Controls">
            <div className="toolbar-header">
              <div className="toolbar-label">
                <span className="toolbar-icon" aria-hidden="true">🛠️</span>
                <span className="toolbar-title">Dev Controls: View State Inspector</span>
                <span className="toolbar-subtitle">Test Empty States, Profit, Loss &amp; Break-Even (Dev Mode Only — does not affect LocalStorage)</span>
              </div>
            </div>

            <div className="scenario-buttons-row">
              {Object.entries(DEV_SCENARIOS).map(([key, scenario]) => (
                <button
                  key={key}
                  type="button"
                  className={`scenario-btn ${activeScenarioKey === key ? 'active' : ''}`}
                  onClick={() => handleSelectDevScenario(key)}
                >
                  {scenario.label}
                </button>
              ))}
            </div>

            {DEV_SCENARIOS[activeScenarioKey] && (
              <p className="scenario-desc-note">
                {DEV_SCENARIOS[activeScenarioKey].desc}
              </p>
            )}
          </section>
        )}

        {/* Primary Row: Parameters Form + Results Dashboard */}
        <div className="calculator-layout">
          <CalculatorForm
            onCalculate={handleCalculate}
            onReset={handleReset}
            isLoading={isLoading}
            apiError={apiError}
            loadedParams={loadedParams}
          />
          <ResultsDashboard
            result={activeResult}
            isLoading={isLoading}
          />
        </div>

        {/* Secondary Row: Payoff Curve Visualization */}
        <div className="section-spacer">
          <PayoffChart
            parameters={activeResult ? activeResult.parameters : null}
            actualBuyerPayoff={activeResult ? activeResult.buyerPayoff : undefined}
            actualSellerPayoff={activeResult ? activeResult.sellerPayoff : undefined}
          />
        </div>

        {/* Tertiary Row: Calculation History + Contract Theory */}
        <div className="calculator-layout section-spacer">
          <CalculationHistory
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
          />
          <TheorySection />
        </div>

        {/* Academic Details */}
        <AcademicInfo />
      </div>
    </main>
  );
};


import React, { useState, useEffect } from 'react';
import { CalculatorForm } from '../components/CalculatorForm';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { PayoffChart } from '../components/PayoffChart';
import { CalculationHistory } from '../components/CalculationHistory';
import { TheorySection } from '../components/TheorySection';
import { AcademicInfo } from '../components/AcademicInfo';
import { apiService, HealthResponse } from '../services/apiService';
import { ContractParameters, PayoffResult, CalculationHistoryItem } from '../types/payoff';
import { getOutcomeType } from '../utils/formatters';

// Development-only demonstration presets to test all UI states (Profit, Loss, Break-Even, Empty)
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

const DEV_SAMPLE_HISTORY: CalculationHistoryItem[] = [
  {
    id: 'demo-1',
    timestamp: 'Today, 10:15 AM',
    parameters: { agreedPrice: 210, marketPrice: 240, quantity: 100 },
    buyerPayoff: 3000,
    sellerPayoff: -3000,
    buyerOutcome: 'profit',
    sellerOutcome: 'loss',
  },
  {
    id: 'demo-2',
    timestamp: 'Today, 09:40 AM',
    parameters: { agreedPrice: 210, marketPrice: 195, quantity: 100 },
    buyerPayoff: -1500,
    sellerPayoff: 1500,
    buyerOutcome: 'loss',
    sellerOutcome: 'profit',
  },
  {
    id: 'demo-3',
    timestamp: 'Yesterday, 04:20 PM',
    parameters: { agreedPrice: 200, marketPrice: 200, quantity: 150 },
    buyerPayoff: 0,
    sellerPayoff: 0,
    buyerOutcome: 'breakeven',
    sellerOutcome: 'breakeven',
  },
];

export const CalculatorPage: React.FC = () => {
  const [apiHealth, setApiHealth] = useState<HealthResponse | null>(null);

  // Active calculation result & history state (initially null/empty to preserve empty states)
  const [activeResult, setActiveResult] = useState<PayoffResult | null>(null);
  const [history, setHistory] = useState<CalculationHistoryItem[]>([]);
  const [activeScenarioKey, setActiveScenarioKey] = useState<string>('empty');

  useEffect(() => {
    // Attempt health check on initial load (optional graceful degraded status)
    apiService
      .checkHealth()
      .then((data) => setApiHealth(data))
      .catch(() => {
        // Backend not yet running or still starting
      });
  }, []);

  // Compute a typed PayoffResult structure for display (strictly decoupled from history persistence)
  const createPayoffResult = (params: ContractParameters): PayoffResult => {
    const unitBuyer = params.marketPrice - params.agreedPrice;
    const unitSeller = params.agreedPrice - params.marketPrice;
    const buyerPayoff = unitBuyer * params.quantity;
    const sellerPayoff = unitSeller * params.quantity;

    return {
      parameters: params,
      buyerPayoff,
      sellerPayoff,
      buyerOutcome: getOutcomeType(buyerPayoff),
      sellerOutcome: getOutcomeType(sellerPayoff),
      unitPayoffBuyer: unitBuyer,
      unitPayoffSeller: unitSeller,
      calculatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Form reset handler
  const handleReset = () => {
    setActiveResult(null);
    setActiveScenarioKey('empty');
  };

  // Form calculate preview handler
  const handleCalculate = (params: ContractParameters) => {
    // In Issue #2, provides typed props to dashboard/chart without saving to actual history
    const result = createPayoffResult(params);
    setActiveResult(result);
    setActiveScenarioKey('custom');
  };

  // Development scenario selector - strictly for UI verification, never saved to history
  const handleSelectDevScenario = (key: string) => {
    setActiveScenarioKey(key);
    const scenario = DEV_SCENARIOS[key];
    if (!scenario || !scenario.params) {
      setActiveResult(null);
    } else {
      const res = createPayoffResult(scenario.params);
      setActiveResult(res);
    }
  };

  // History clear handler
  const handleClearHistory = () => {
    setHistory([]);
  };

  // Dev toggle to test history table UI rendering vs empty state
  const handleToggleDevHistory = () => {
    setHistory((prev) => (prev.length === 0 ? DEV_SAMPLE_HISTORY : []));
  };

  return (
    <main className="main-content">
      <div className="container">
        {/* Hero Introduction Banner */}
        <section className="hero-section" aria-labelledby="hero-title">
          <div className="hero-pill">
            <span>Financial Derivative Pricing &bull; Issue #2 Results Dashboard</span>
          </div>
          <h1 id="hero-title" className="hero-title">
            Forward Contract <span className="gradient-text">Profit/Loss Calculator</span>
          </h1>
          <p className="hero-description">
            A dedicated financial engineering workspace to model, evaluate, and visualize payoff outcomes for long and short forward positions upon contract maturity.
          </p>

          {apiHealth && (
            <div style={{ marginTop: '1rem', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', fontSize: '0.75rem', color: '#10b981' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              API Connected: {apiHealth.service} ({apiHealth.framework}) - {apiHealth.status}
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
                <span className="toolbar-subtitle">Test Empty States, Profit, Loss &amp; Break-Even (Dev Mode Only)</span>
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

              <button
                type="button"
                className={`scenario-btn ${history.length > 0 ? 'active' : ''}`}
                onClick={handleToggleDevHistory}
                title="Toggle sample history records for UI review without touching LocalStorage"
              >
                {history.length === 0 ? 'Preview Sample History Table' : 'Hide Sample History Table'}
              </button>
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
          />
          <ResultsDashboard result={activeResult} />
        </div>

        {/* Secondary Row: Payoff Curve Visualization */}
        <div className="section-spacer">
          <PayoffChart
            parameters={activeResult ? activeResult.parameters : null}
          />
        </div>

        {/* Tertiary Row: Calculation History + Contract Theory */}
        <div className="calculator-layout section-spacer">
          <CalculationHistory
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={(item) => handleCalculate(item.parameters)}
          />
          <TheorySection />
        </div>

        {/* Academic Details */}
        <AcademicInfo />
      </div>
    </main>
  );
};

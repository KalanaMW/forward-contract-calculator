import React, { useEffect, useRef } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { ContractParameters, ChartDataPoint } from '../types/payoff';
import { formatCurrency, formatNumber } from '../utils/formatters';

export interface PayoffChartProps {
  parameters?: ContractParameters | null;
  dataPoints?: ChartDataPoint[];
  actualBuyerPayoff?: number;
  actualSellerPayoff?: number;
}

export const PayoffChart: React.FC<PayoffChartProps> = ({
  parameters,
  dataPoints,
  actualBuyerPayoff,
  actualSellerPayoff,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstanceRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !parameters) {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
      return;
    }

    const { agreedPrice: K, quantity: Q } = parameters;

    // Generate or use provided data points around agreed price K and maturity price S
    let points: ChartDataPoint[] = [];

    if (dataPoints && dataPoints.length > 0) {
      points = dataPoints;
    } else {
      // Calculate a range of spot prices spanning from 60% of K to 140% of K
      const minSpot = Math.max(0, Math.floor((K * 0.6) / 10) * 10);
      const maxSpot = Math.ceil((Math.max(K, parameters.marketPrice) * 1.3) / 10) * 10;
      const step = Math.max(5, Math.round((maxSpot - minSpot) / 14));

      const spotValues: number[] = [];
      for (let s = minSpot; s <= maxSpot; s += step) {
        spotValues.push(s);
      }
      // Ensure K and current S are included in the axis points
      if (!spotValues.includes(K)) spotValues.push(K);
      if (!spotValues.includes(parameters.marketPrice)) spotValues.push(parameters.marketPrice);
      spotValues.sort((a, b) => a - b);

      points = spotValues.map((spot) => {
        const isActualSpot = Math.abs(spot - parameters.marketPrice) < 0.0001;
        const buyer = isActualSpot && actualBuyerPayoff !== undefined
          ? actualBuyerPayoff
          : (spot - K) * Q;
        const seller = isActualSpot && actualSellerPayoff !== undefined
          ? actualSellerPayoff
          : (K - spot) * Q;

        return {
          spotPrice: spot,
          buyerPayoff: buyer,
          sellerPayoff: seller,
        };
      });
    }

    const labels = points.map((p) => `${formatNumber(p.spotPrice, 0)} LKR`);
    const buyerData = points.map((p) => p.buyerPayoff);
    const sellerData = points.map((p) => p.sellerPayoff);
    const zeroLineData = points.map(() => 0);

    const isActualMaturity = (spot: number) => Math.abs(spot - parameters.marketPrice) < 0.0001;
    const isBreakEven = (spot: number) => Math.abs(spot - parameters.agreedPrice) < 0.0001;

    const buyerPointRadii = points.map(p => isActualMaturity(p.spotPrice) ? 7 : (isBreakEven(p.spotPrice) ? 5 : 3.5));
    const buyerPointHoverRadii = points.map(p => isActualMaturity(p.spotPrice) ? 9 : 6);
    const buyerPointBorderWidths = points.map(p => isActualMaturity(p.spotPrice) ? 3 : 1.5);

    const sellerPointRadii = points.map(p => isActualMaturity(p.spotPrice) ? 7 : (isBreakEven(p.spotPrice) ? 5 : 3.5));
    const sellerPointHoverRadii = points.map(p => isActualMaturity(p.spotPrice) ? 9 : 6);
    const sellerPointBorderWidths = points.map(p => isActualMaturity(p.spotPrice) ? 3 : 1.5);

    // Destroy existing instance before recreation
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Buyer Payoff (Long)',
            data: buyerData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderWidth: 2.5,
            pointBackgroundColor: points.map(p => isActualMaturity(p.spotPrice) ? '#38bdf8' : '#10b981'),
            pointBorderColor: '#0a0e17',
            pointBorderWidth: buyerPointBorderWidths,
            pointRadius: buyerPointRadii,
            pointHoverRadius: buyerPointHoverRadii,
            tension: 0,
            fill: false,
          },
          {
            label: 'Seller Payoff (Short)',
            data: sellerData,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            borderWidth: 2.5,
            pointBackgroundColor: points.map(p => isActualMaturity(p.spotPrice) ? '#38bdf8' : '#f59e0b'),
            pointBorderColor: '#0a0e17',
            pointBorderWidth: sellerPointBorderWidths,
            pointRadius: sellerPointRadii,
            pointHoverRadius: sellerPointHoverRadii,
            tension: 0,
            fill: false,
          },
          {
            label: 'Zero Profit Baseline',
            data: zeroLineData,
            borderColor: 'rgba(148, 163, 184, 0.45)',
            borderWidth: 1.5,
            borderDash: [6, 6],
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#cbd5e1',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 12,
                weight: 600,
              },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 20,
            },
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            titleColor: '#f8fafc',
            bodyColor: '#cbd5e1',
            borderColor: 'rgba(59, 130, 246, 0.3)',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              family: "'Plus Jakarta Sans', sans-serif",
              size: 13,
              weight: 'bold',
            },
            bodyFont: {
              family: "'JetBrains Mono', monospace",
              size: 12,
            },
            callbacks: {
              title: (context) => {
                const index = context[0]?.dataIndex;
                const p = points[index];
                if (!p) return `Maturity Spot Price: ${context[0]?.label}`;
                const isActual = isActualMaturity(p.spotPrice);
                const isBe = isBreakEven(p.spotPrice);
                if (isActual && isBe) {
                  return `Spot Price: ${context[0]?.label} ★ (Actual Maturity & Break-Even S = K)`;
                }
                if (isActual) {
                  return `Spot Price: ${context[0]?.label} ★ (Actual Contract Maturity Spot S)`;
                }
                if (isBe) {
                  return `Spot Price: ${context[0]?.label} (Break-Even Price S = K)`;
                }
                return `Maturity Spot Price: ${context[0]?.label}`;
              },
              label: (context) => {
                const label = context.dataset.label || '';
                const val = Number(context.parsed.y);
                if (label.includes('Baseline')) return ' Zero P/L Threshold';
                return ` ${label}: ${formatCurrency(val, 'LKR', true)}`;
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Market Price at Maturity — S (LKR)',
              color: '#94a3b8',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 12,
                weight: 600,
              },
              padding: { top: 10 },
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.08)',
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: "'JetBrains Mono', monospace",
                size: 11,
              },
              maxRotation: 45,
            },
          },
          y: {
            title: {
              display: true,
              text: 'Net Payoff — (LKR)',
              color: '#94a3b8',
              font: {
                family: "'Plus Jakarta Sans', sans-serif",
                size: 12,
                weight: 600,
              },
              padding: { bottom: 10 },
            },
            grid: {
              color: 'rgba(148, 163, 184, 0.08)',
            },
            ticks: {
              color: '#94a3b8',
              font: {
                family: "'JetBrains Mono', monospace",
                size: 11,
              },
              callback: (value) => `${Number(value).toLocaleString()} LKR`,
            },
          },
        },
      },
    };

    chartInstanceRef.current = new Chart(ctx, config);

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [parameters, dataPoints]);

  return (
    <section className="card chart-card" id="chart" aria-labelledby="chart-heading">
      {/* Chart Section Header */}
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
          </div>
          <div>
            <h2 id="chart-heading" className="card-title">Payoff Profile Visualization</h2>
          </div>
        </div>

        {parameters && (
          <div className="breakeven-indicator" title="Price where neither counterparty makes profit or loss">
            <span className="be-dot" />
            <span>Break-Even Price: <strong>{formatCurrency(parameters.agreedPrice)}</strong></span>
          </div>
        )}
      </div>

      {/* Chart Container or Empty State */}
      {!parameters ? (
        <div className="chart-empty-state">
          <div className="empty-chart-grid" aria-hidden="true">
            <div className="mock-line mock-buyer" />
            <div className="mock-line mock-seller" />
            <div className="mock-zero-line" />
          </div>
          <div className="empty-state-overlay">
            <h3 className="empty-state-title">Payoff Chart Awaiting Simulation</h3>
            <p className="empty-state-description">
              The chart plots the linear payout profile across potential maturity spot prices, featuring counterparty cross-over curves, zero-profit threshold, and break-even markers.
            </p>
          </div>
        </div>
      ) : (
        <div className="chart-canvas-wrapper">
          <canvas ref={canvasRef} />
        </div>
      )}

      {/* Chart Educational Footer Legend */}
      {parameters && (
        <div className="chart-footer-notes">
          <div className="note-item">
            <span className="dot green" />
            <span>Buyer profits when <strong>S &gt; {formatCurrency(parameters.agreedPrice)}</strong></span>
          </div>
          <div className="note-item">
            <span className="dot amber" />
            <span>Seller profits when <strong>S &lt; {formatCurrency(parameters.agreedPrice)}</strong></span>
          </div>
          <div className="note-item">
            <span className="dot grey" />
            <span>Zero-Sum intersection at <strong>S = K ({formatCurrency(parameters.agreedPrice)})</strong></span>
          </div>
          <div className="note-item">
            <span className="dot blue" style={{ backgroundColor: '#38bdf8' }} />
            <span>Contract Spot: <strong>S = {formatCurrency(parameters.marketPrice)}</strong> (Highlighted Curve Point)</span>
          </div>
        </div>
      )}
    </section>
  );
};

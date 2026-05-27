import React, { useEffect, useState } from 'react';
import { X, TrendingUp, BarChart2, AlertCircle } from 'lucide-react';

export default function DetailPanel({ item, onClose }) {
  const [chartType, setChartType] = useState('sparkline'); // 'sparkline' | 'bars'

  // Keyboard accessibility: Escape key to close the panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!item) return null;

  const weeklyDemand = item.weekly_demand;
  const target = item.target;

  // Computations
  const totalDemand = weeklyDemand.reduce((sum, val) => sum + val, 0);
  const averageDemand = (totalDemand / weeklyDemand.length).toFixed(1);
  const zeroWeeks = weeklyDemand.filter((val) => val === 0).length;

  // Determine overall status
  let trackingStatus = 'on target';
  let trackingClass = 'tracking-on-target';
  let statCardClass = 'stat-success';
  const ratio = parseFloat(averageDemand) / target;

  if (ratio < 0.5 || zeroWeeks > 2) {
    trackingStatus = 'at risk';
    trackingClass = 'tracking-at-risk';
    statCardClass = 'stat-danger';
  } else if (ratio < 0.9) {
    trackingStatus = 'below target';
    trackingClass = 'tracking-below-target';
    statCardClass = 'stat-warning';
  }

  // Chart math
  const maxVal = Math.max(...weeklyDemand, target, 50); // scale chart based on max demand or target
  const chartHeight = 80;
  const chartWidth = 320;
  const paddingX = 20;
  const paddingY = 15;
  const graphWidth = chartWidth - paddingX * 2;
  const graphHeight = chartHeight - paddingY * 2;

  // Map values to coordinates
  const getCoords = (val, index) => {
    const x = paddingX + (index / (weeklyDemand.length - 1)) * graphWidth;
    const y = chartHeight - paddingY - (val / maxVal) * graphHeight;
    return { x, y };
  };

  // Coordinates for Sparkline
  const points = weeklyDemand.map((val, index) => getCoords(val, index));
  const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  // SVG Area path for fill under the sparkline
  const areaPointsStr = points.length > 0 
    ? `${points[0].x},${chartHeight - paddingY} ${pointsStr} ${points[points.length - 1].x},${chartHeight - paddingY}`
    : '';

  // Y coordinate for Target Line
  const targetY = chartHeight - paddingY - (target / maxVal) * graphHeight;

  // Bar chart configurations
  const barWidth = graphWidth / weeklyDemand.length - 4;
  const getBarHeightAndY = (val) => {
    const h = (val / maxVal) * graphHeight;
    const y = chartHeight - paddingY - h;
    return { h, y };
  };

  const getDemandColor = (val) => {
    if (val === 0) return 'var(--status-red)';
    const r = val / target;
    if (r >= 0.9) return 'var(--status-green)';
    if (r >= 0.5) return 'var(--status-amber)';
    return 'var(--status-red)';
  };

  return (
    <div className="glass-panel detail-panel" id="detail-panel-container">
      {/* Detail Header */}
      <div className="detail-header">
        <div className="detail-title-wrapper">
          <span className="badge" style={{ marginBottom: '0.5rem', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: 'var(--color-indigo)' }}>
            {item.category}
          </span>
          <h3 id="detail-item-name">{item.item}</h3>
          <p className="brand-subtitle">{item.region} Region • {item.status}</p>
        </div>
        <button
          className="detail-close-btn"
          onClick={onClose}
          aria-label="Close details"
          id="detail-close-btn"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Status & Computations */}
      <div className="detail-stats-grid">
        <div className={`stat-card ${statCardClass}`}>
          <div className="stat-label">Avg Weekly</div>
          <div className="stat-value" id="detail-avg-demand">{averageDemand}</div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
          <div className="stat-label">Tracking Overall</div>
          <span className={`tracking-badge ${trackingClass}`} id="detail-tracking-status">
            {trackingStatus}
          </span>
        </div>
      </div>

      {/* Meta grid */}
      <div className="detail-meta-grid">
        <div className="meta-card">
          <div className="meta-label">Weekly Target</div>
          <div className="meta-value" id="detail-target">{target} items</div>
        </div>
        <div className="meta-card">
          <div className="meta-label">Zero Demand Weeks</div>
          <div className="meta-value" id="detail-zero-weeks" style={{ color: zeroWeeks > 0 ? 'var(--status-amber)' : 'inherit' }}>
            {zeroWeeks} {zeroWeeks === 1 ? 'week' : 'weeks'}
          </div>
        </div>
      </div>

      {/* Custom SVG Chart Trend Section */}
      <div className="trend-section">
        <div className="chart-title">
          <span>Weekly Trend</span>
          <div className="chart-type-selector">
            <button
              className={`chart-tab-btn ${chartType === 'sparkline' ? 'active' : ''}`}
              onClick={() => setChartType('sparkline')}
              title="Line Sparkline"
            >
              <TrendingUp size={12} />
            </button>
            <button
              className={`chart-tab-btn ${chartType === 'bars' ? 'active' : ''}`}
              onClick={() => setChartType('bars')}
              title="Bar Chart"
            >
              <BarChart2 size={12} />
            </button>
          </div>
        </div>

        {/* Custom SVG Trend Drawing */}
        <svg className="svg-chart-container" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
          <defs>
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-indigo)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-indigo)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal axis & labels) */}
          <line
            x1={paddingX}
            y1={chartHeight - paddingY}
            x2={chartWidth - paddingX}
            y2={chartHeight - paddingY}
            stroke="var(--border-color)"
            strokeWidth={1}
          />

          {/* Target Line */}
          <line
            className="target-line"
            x1={paddingX}
            y1={targetY}
            x2={chartWidth - paddingX}
            y2={targetY}
          />
          <text
            x={chartWidth - paddingX}
            y={targetY - 4}
            fill="var(--text-muted)"
            fontSize="8"
            textAnchor="end"
            fontWeight="bold"
          >
            Target ({target})
          </text>

          {/* Render Sparkline Chart */}
          {chartType === 'sparkline' && (
            <>
              {/* Shaded Area under Curve */}
              <polygon className="sparkline-area" points={areaPointsStr} />
              
              {/* Curve Line */}
              <polyline className="sparkline-line" points={pointsStr} />

              {/* Data points */}
              {points.map((p, idx) => (
                <g key={idx}>
                  <circle
                    className="chart-point"
                    cx={p.x}
                    cy={p.y}
                    r={4}
                  />
                  <text
                    className="chart-point-label"
                    x={p.x}
                    y={p.y - 8}
                  >
                    {weeklyDemand[idx]}
                  </text>
                  <text
                    className="chart-axis-label"
                    x={p.x}
                    y={chartHeight - 4}
                  >
                    W{idx + 1}
                  </text>
                </g>
              ))}
            </>
          )}

          {/* Render Bar Chart */}
          {chartType === 'bars' && (
            <>
              {weeklyDemand.map((val, idx) => {
                const { h, y } = getBarHeightAndY(val);
                const xCoord = paddingX + idx * (graphWidth / weeklyDemand.length) + 2;
                return (
                  <g key={idx}>
                    <rect
                      x={xCoord}
                      y={y}
                      width={barWidth}
                      height={Math.max(h, 2)} // ensure at least 2px height for visual placeholder of 0
                      fill={getDemandColor(val)}
                      rx={2}
                      opacity={0.8}
                    />
                    <text
                      className="chart-point-label"
                      x={xCoord + barWidth / 2}
                      y={y - 4}
                    >
                      {val}
                    </text>
                    <text
                      className="chart-axis-label"
                      x={xCoord + barWidth / 2}
                      y={chartHeight - 4}
                    >
                      W{idx + 1}
                    </text>
                  </g>
                );
              })}
            </>
          )}
        </svg>
      </div>

      {/* Complete Weekly Demands Grid */}
      <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'rgba(0, 0, 0, 0.15)' }}>
        <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '0.75rem', fontWeight: 600 }}>Weekly Demands Breakdown</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
          {weeklyDemand.map((val, idx) => {
            const ratio = val / target;
            let valColor = 'var(--text-primary)';
            if (val === 0) valColor = 'var(--status-red)';
            else if (ratio >= 0.9) valColor = 'var(--status-green)';
            else if (ratio >= 0.5) valColor = 'var(--status-amber)';
            else valColor = 'var(--status-red)';

            return (
              <div
                key={idx}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  padding: '0.5rem',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>W{idx + 1}</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: valColor }}>{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

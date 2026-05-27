import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Info } from 'lucide-react';

export default function DemandGrid({
  items,
  selectedItem,
  onItemSelect,
  sortBy,
  sortOrder,
  onSort
}) {
  // Helper to determine the color class of a weekly demand cell against its target
  const getDemandClass = (val, target) => {
    if (val === 0) return 'demand-red'; // explicitly handle zero as red per instructions
    const ratio = val / target;
    if (ratio >= 0.9) return 'demand-green';
    if (ratio >= 0.5) return 'demand-amber';
    return 'demand-red';
  };

  // Helper to render sort indicator icon
  const renderSortIndicator = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="sort-indicator" size={12} style={{ opacity: 0.3 }} />;
    }
    return sortOrder === 'asc' 
      ? <ArrowUp className="sort-indicator" size={12} />
      : <ArrowDown className="sort-indicator" size={12} />;
  };

  const renderSortHeader = (label, field, className = '') => {
    return (
      <th
        key={field}
        className={`sortable ${className}`}
        onClick={() => onSort(field)}
        style={{ whiteSpace: 'nowrap' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: className.includes('col-num') ? 'flex-end' : 'flex-start', gap: '0.25rem' }}>
          {label}
          {renderSortIndicator(field)}
        </div>
      </th>
    );
  };

  // Compute column totals for visible rows
  const wTotals = Array(8).fill(0);
  items.forEach(item => {
    item.weekly_demand.forEach((val, idx) => {
      wTotals[idx] += val;
    });
  });
  const grandTotal = wTotals.reduce((sum, val) => sum + val, 0);

  return (
    <div className="glass-panel table-container" style={{ padding: 0 }}>
      {items.length === 0 ? (
        <div className="empty-state">
          <Info className="empty-state-icon" size={48} />
          <h4 className="empty-state-title">No planning items found</h4>
          <p className="empty-state-desc">Try resetting your filters or adjusting your search parameters.</p>
        </div>
      ) : (
        <table className="demand-table" id="demand-grid-table">
          <thead>
            <tr>
              {renderSortHeader('Item Name', 'item')}
              {renderSortHeader('Category', 'category')}
              {renderSortHeader('Region', 'region')}
              {renderSortHeader('Status', 'status')}
              {Array.from({ length: 8 }).map((_, idx) => 
                renderSortHeader(`W${idx + 1}`, `w${idx + 1}`, 'col-num')
              )}
              {renderSortHeader('Total', 'total', 'col-num')}
            </tr>
          </thead>
          <tbody>
            {items.map((row) => {
              const rowTotal = row.weekly_demand.reduce((sum, val) => sum + val, 0);
              const isSelected = selectedItem && selectedItem.id === row.id;
              
              return (
                <tr
                  key={row.id}
                  id={`grid-row-${row.id}`}
                  className={isSelected ? 'selected' : ''}
                  onClick={() => onItemSelect(row)}
                >
                  <td style={{ fontWeight: 600 }}>{row.item}</td>
                  <td>{row.category}</td>
                  <td>{row.region}</td>
                  <td>
                    <span className={`badge ${row.status}`}>{row.status}</span>
                  </td>
                  {row.weekly_demand.map((val, idx) => (
                    <td key={idx} className="col-num">
                      <span className={`cell-demand ${getDemandClass(val, row.target)}`}>
                        {val}
                      </span>
                    </td>
                  ))}
                  <td className="col-num" style={{ fontWeight: 700 }}>{rowTotal}</td>
                </tr>
              );
            })}

            {/* Summary Row */}
            <tr className="summary-row" id="grid-summary-row">
              <td style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Demand</td>
              <td></td>
              <td></td>
              <td></td>
              {wTotals.map((val, idx) => (
                <td key={idx} className="col-num" id={`summary-w${idx + 1}`}>
                  {val}
                </td>
              ))}
              <td className="col-num" id="summary-total" style={{ fontSize: '1rem' }}>{grandTotal}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

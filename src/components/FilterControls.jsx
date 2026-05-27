import React from 'react';
import { Search, RotateCcw } from 'lucide-react';

export default function FilterControls({
  categories,
  selectedCategory,
  onCategoryChange,
  selectedStatuses,
  onStatusToggle,
  searchQuery,
  onSearchChange,
  onReset
}) {
  return (
    <div className="glass-panel filter-controls">
      {/* Search Input */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="search-input">Search Items</label>
        <div className="search-wrapper">
          <Search className="search-icon" size={16} />
          <input
            id="search-input"
            type="text"
            className="input-search"
            placeholder="Search by item name..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div className="filter-group">
        <label className="filter-label" htmlFor="category-select">Category</label>
        <select
          id="category-select"
          className="select-dropdown"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Status Checkboxes */}
      <div className="filter-group">
        <label className="filter-label">Status Filter</label>
        <div className="status-checkbox-group">
          {['active', 'paused', 'discontinued'].map((status) => {
            const isChecked = selectedStatuses.includes(status);
            return (
              <label key={status} className="status-checkbox-label" htmlFor={`status-chk-${status}`}>
                <input
                  id={`status-chk-${status}`}
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => onStatusToggle(status)}
                />
                <span className={`badge ${status}`}>{status}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Reset Action */}
      <div className="filter-group" style={{ marginLeft: 'auto', alignSelf: 'flex-end' }}>
        <button
          id="reset-filters-btn"
          className="btn btn-secondary"
          onClick={onReset}
          title="Reset all filters and sorting"
        >
          <RotateCcw size={16} />
          Reset Filters
        </button>
      </div>
    </div>
  );
}

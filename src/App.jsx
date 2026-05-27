import React, { useState, useEffect } from 'react';
import { Plus, BarChart2 } from 'lucide-react';
import { initialDemandData } from './data/demand_data';
import FilterControls from './components/FilterControls';
import DemandGrid from './components/DemandGrid';
import DetailPanel from './components/DetailPanel';
import AddItemModal from './components/AddItemModal';

export default function App() {
  // 1. Initial State: items loaded from localStorage or hardcoded fallback
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('terra_demand_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse localStorage items, falling back to initial data', e);
      }
    }
    return initialDemandData;
  });

  // 2. Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatuses, setSelectedStatuses] = useState(['active', 'paused', 'discontinued']);

  // 3. Sort States
  const [sortBy, setSortBy] = useState('item'); // default sort by Item Name
  const [sortOrder, setSortOrder] = useState('asc');

  // 4. Detail Panel Selection State
  const [selectedItemId, setSelectedItemId] = useState(null);

  // 5. Add Item Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('terra_demand_items', JSON.stringify(items));
  }, [items]);

  // Dynamically extract unique categories from current items list
  const categories = Array.from(new Set(items.map((item) => item.category))).sort();

  // Status Checkbox Toggle Handler
  const handleStatusToggle = (status) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Sort Handler
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Add Item Handler
  const handleAddItem = (newItem) => {
    // Generate unique ID
    const nextId = items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1;
    const finalItem = { ...newItem, id: nextId };
    
    setItems((prev) => [...prev, finalItem]);
    // Automatically select the newly created item and open its details
    setSelectedItemId(finalItem.id);
  };

  // Reset Filters & Sorting
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatuses(['active', 'paused', 'discontinued']);
    setSortBy('item');
    setSortOrder('asc');
  };

  // --- FILTER & SORT EXECUTION ---
  const filteredItems = items;

  const sortedItems = [...filteredItems].sort((a, b) => {
    if (!sortBy) return 0;
    
    let valA, valB;
    
    if (sortBy.startsWith('w')) {
      // Weekly demand sorting
      const weekIndex = parseInt(sortBy.substring(1), 10) - 1;
      valA = a.weekly_demand[weekIndex];
      valB = b.weekly_demand[weekIndex];
    } else if (sortBy === 'total') {
      // Total sorting
      valA = a.weekly_demand.reduce((sum, v) => sum + v, 0);
      valB = b.weekly_demand.reduce((sum, v) => sum + v, 0);
    } else {
      // String sorting
      valA = a[sortBy] ? a[sortBy].toString().toLowerCase() : '';
      valB = b[sortBy] ? b[sortBy].toString().toLowerCase() : '';
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Get active selected item object if it is currently visible in filtered list
  const activeSelectedItem = sortedItems.find((item) => item.id === selectedItemId);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand-section">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 style={{ color: '#2563eb' }} size={28} />
            <h1 className="brand-title">TerraInsight</h1>
          </div>
          <span className="brand-subtitle">Weekly Demand Grid — Operations Planning Dashboard</span>
        </div>
        <div className="header-actions">
          <button
            id="add-item-btn"
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={16} />
            Add Item
          </button>
        </div>
      </header>

      {/* Filter Controls Component */}
      <FilterControls
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        selectedStatuses={selectedStatuses}
        onStatusToggle={handleStatusToggle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onReset={handleReset}
      />

      {/* Workspace Area: Grid + Detail Sidebar */}
      <div className={`dashboard-workspace ${activeSelectedItem ? 'with-sidebar' : ''}`}>
        <DemandGrid
          items={sortedItems}
          selectedItem={activeSelectedItem}
          onItemSelect={(item) => setSelectedItemId(item.id)}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {activeSelectedItem && (
          <DetailPanel
            item={activeSelectedItem}
            onClose={() => setSelectedItemId(null)}
          />
        )}
      </div>

      {/* Add Item Form Modal */}
      <AddItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddItem}
      />
    </div>
  );
}

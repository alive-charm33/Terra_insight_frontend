import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function AddItemModal({ isOpen, onClose, onSubmit }) {
  const initialFormState = {
    item: '',
    category: 'Electronics',
    region: 'North',
    target: '',
    status: 'active',
    w1: '0',
    w2: '0',
    w3: '0',
    w4: '0',
    w5: '0',
    w6: '0',
    w7: '0',
    w8: '0'
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');

  // Keyboard accessibility: Escape key to close the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear the error for this field as the user edits
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    setGlobalError('');
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Validate Item Name
    if (!formData.item.trim()) {
      newErrors.item = 'Item name is required.';
      isValid = false;
    }

    // Validate Target (must be a positive integer > 0)
    const targetInt = parseInt(formData.target, 10);
    if (!formData.target || isNaN(targetInt) || targetInt <= 0 || targetInt.toString() !== formData.target.trim()) {
      newErrors.target = 'Target must be a positive integer greater than 0.';
      isValid = false;
    }

    // Validate Weekly Demands (W1-W8 must be non-negative integers >= 0)
    for (let i = 1; i <= 8; i++) {
      const fieldName = `w${i}`;
      const valStr = formData[fieldName];
      const valInt = parseInt(valStr, 10);
      if (valStr === '' || isNaN(valInt) || valInt < 0 || valInt.toString() !== valStr.trim()) {
        newErrors[fieldName] = true; // flag individual cell
        isValid = false;
      }
    }

    // If weekly demand validation failed, set a general weekly error message
    const hasWeeklyError = Object.keys(newErrors).some((key) => key.startsWith('w'));
    if (hasWeeklyError) {
      newErrors.weekly = 'All weekly demand values must be non-negative integers (0 or greater).';
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    if (validateForm()) {
      // Construction of new item
      const newItem = {
        item: formData.item.trim(),
        category: formData.category,
        region: formData.region,
        target: parseInt(formData.target, 10),
        status: formData.status,
        weekly_demand: [
          parseInt(formData.w1, 10),
          parseInt(formData.w2, 10),
          parseInt(formData.w3, 10),
          parseInt(formData.w4, 10),
          parseInt(formData.w5, 10),
          parseInt(formData.w6, 10),
          parseInt(formData.w7, 10),
          parseInt(formData.w8, 10)
        ]
      };

      onSubmit(newItem);
      setFormData(initialFormState);
      setErrors({});
      setGlobalError('');
      onClose();
    } else {
      setGlobalError('Please resolve the form errors before submitting.');
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick} id="add-item-modal-overlay">
      <div className="modal-content" id="add-item-modal-content">
        {/* Header */}
        <div className="modal-header">
          <h3>Add New Planning Item</h3>
          <button
            className="detail-close-btn"
            onClick={onClose}
            aria-label="Close form"
            id="modal-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {globalError && (
              <div className="global-error-banner" id="modal-global-error">
                <AlertCircle size={16} />
                <span>{globalError}</span>
              </div>
            )}

            {/* Item Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="form-item-name">Item Name</label>
              <input
                id="form-item-name"
                type="text"
                className={`form-input ${errors.item ? 'input-error' : ''}`}
                placeholder="e.g. Copper Tubing, LED Screen..."
                value={formData.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
              />
              {errors.item && <span className="error-msg" id="error-item-name">{errors.item}</span>}
            </div>

            {/* Category & Region */}
            <div className="form-row-2">
              <div className="form-group margin-none">
                <label className="form-label" htmlFor="form-item-category">Category</label>
                <select
                  id="form-item-category"
                  className="form-input"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Textiles">Textiles</option>
                  <option value="Chemicals">Chemicals</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Pharma">Pharma</option>
                </select>
              </div>

              <div className="form-group margin-none">
                <label className="form-label" htmlFor="form-item-region">Region</label>
                <select
                  id="form-item-region"
                  className="form-input"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>
            </div>

            {/* Target & Status */}
            <div className="form-row-2">
              <div className="form-group margin-none">
                <label className="form-label" htmlFor="form-item-target">Weekly Target Value</label>
                <input
                  id="form-item-target"
                  type="text"
                  className={`form-input ${errors.target ? 'input-error' : ''}`}
                  placeholder="e.g. 100"
                  value={formData.target}
                  onChange={(e) => handleInputChange('target', e.target.value)}
                />
                {errors.target && <span className="error-msg" id="error-item-target">{errors.target}</span>}
              </div>

              <div className="form-group margin-none">
                <label className="form-label" htmlFor="form-item-status">Status</label>
                <select
                  id="form-item-status"
                  className="form-input"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>

            {/* W1-W8 Demand Grid */}
            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label className="form-label">Weekly Demands (W1 - W8)</label>
              {errors.weekly && <span className="error-msg" id="error-weekly-demands" style={{ display: 'block', marginBottom: '0.5rem' }}>{errors.weekly}</span>}
              
              <div className="weekly-inputs-grid">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const weekNum = idx + 1;
                  const fieldName = `w${weekNum}`;
                  const hasCellError = errors[fieldName];
                  
                  return (
                    <div
                      key={weekNum}
                      className="weekly-input-box"
                      style={{ borderColor: hasCellError ? 'var(--status-red)' : 'var(--border-color)' }}
                    >
                      <label htmlFor={`form-item-w${weekNum}`}>W{weekNum}</label>
                      <input
                        id={`form-item-w${weekNum}`}
                        type="text"
                        value={formData[fieldName]}
                        onChange={(e) => handleInputChange(fieldName, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="modal-footer">
            <button
              id="modal-cancel-btn"
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              className="btn btn-primary"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

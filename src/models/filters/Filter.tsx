import React from 'react';
import { FaFilter, FaRedo, FaTruck, FaTag, FaDollarSign } from 'react-icons/fa';
import type { FilterProps } from '../../types/TotalTypes';
import './Filter.css';

const Filter: React.FC<FilterProps> = ({ filter, setFilter }) => {
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'minPrice' | 'maxPrice') => {
    const value = e.target.value;
    setFilter(prev => ({
      ...prev,
      [field]: value === "" ? null : Number(value)
    }));
  };

  const handleCheckboxChange = (field: 'hasDelivery' | 'hasDiscount', checked: boolean) => {
    setFilter(prev => ({
      ...prev,
      [field]: checked ? true : null
    }));
  };

  const handleReset = () => {
    setFilter(prev => ({
      ...prev,
      categoryId: null,
      name: '',
      minPrice: null,
      maxPrice: null,
      hasDelivery: null,
      hasDiscount: null
    }));
  };

  return (
    <div className="filter-wrapper">
      <div className="filter-card">
        <div className="filter-header">
          <FaFilter className="icon-main" size={16} />
          <h3 className="filter-title">Sehrli Filter</h3>
        </div>

        <div className="filter-body">
          <div className="filter-group price-group">
            <div className="price-inputs">
              <div className="input-field">
                <label><FaDollarSign size={10} /> Min</label>
                <input
                  type="number"
                  value={filter.minPrice ?? ""}
                  onChange={(e) => handlePriceChange(e, 'minPrice')}
                  placeholder="0"
                />
              </div>
              <div className="input-field">
                <label><FaDollarSign size={10} /> Max</label>
                <input
                  type="number"
                  value={filter.maxPrice ?? ""}
                  onChange={(e) => handlePriceChange(e, 'maxPrice')}
                  placeholder="1000"
                />
              </div>
            </div>
          </div>

          <div className="filter-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.hasDelivery === true}
                onChange={(e) => handleCheckboxChange('hasDelivery', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="label-text"><FaTruck size={13} /> Çatdırılma</span>
            </label>

            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filter.hasDiscount === true}
                onChange={(e) => handleCheckboxChange('hasDiscount', e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              <span className="label-text"><FaTag size={13} /> Endirim</span>
            </label>
          </div>

          <button onClick={handleReset} className="reset-btn" title="Sıfırla">
            <FaRedo size={12} />
            <span className="btn-text">Sıfırla</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filter;
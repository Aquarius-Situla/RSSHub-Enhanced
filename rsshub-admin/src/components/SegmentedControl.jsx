import React from 'react';

export function SegmentedControl({ options, activeKey, onChange }) {
  return (
    <div className="ios-segmented-control" role="tablist">
      {options.map((opt) => (
        <button
          key={opt.key}
          type="button"
          role="tab"
          aria-selected={activeKey === opt.key}
          className={`segmented-option ${activeKey === opt.key ? 'active' : ''}`}
          onClick={() => onChange(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export default SegmentedControl;

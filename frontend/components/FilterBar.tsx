'use client';

import React from 'react';
import { Button } from './ui/button';
import { X, Filter } from 'lucide-react';

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface FilterBarProps {
  filters: {
    label: string;
    key: string;
    options: FilterOption[];
  }[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
  className?: string;
}

export default function FilterBar({
  filters,
  activeFilters,
  onFilterChange,
  onClearFilter,
  onClearAll,
  className = ""
}: FilterBarProps) {
  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key] !== '');

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Filter className="h-4 w-4" />
        <span>Filters:</span>
      </div>

      {filters.map((filter) => (
        <div key={filter.key} className="flex items-center gap-2">
          <select
            value={activeFilters[filter.key] || ''}
            onChange={(e) => onFilterChange(filter.key, e.target.value)}
            className="h-8 rounded-md border border-gray-300 bg-white px-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
                {option.count !== undefined && ` (${option.count})`}
              </option>
            ))}
          </select>
          
          {activeFilters[filter.key] && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClearFilter(filter.key)}
              className="h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}

      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          className="text-gray-600 hover:text-gray-900"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
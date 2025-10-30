'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';

interface RowsPerPageSelectorProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
  label?: string;
  showLabel?: boolean;
}

export default function RowsPerPageSelector({
  value,
  onChange,
  options = [5, 10, 20, 50, 100],
  className = "",
  label = "Rows per page",
  showLabel = true
}: RowsPerPageSelectorProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {showLabel && (
        <Label 
          htmlFor="rows-per-page-selector"
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          {label}:
        </Label>
      )}
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(parseInt(val))}
      >
        <SelectTrigger 
          id="rows-per-page-selector"
          className="w-20 h-9 text-sm"
          aria-label={`${label}, currently showing ${value} rows`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem 
              key={option} 
              value={option.toString()}
              className="text-sm"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
  debounceMs?: number;
  maxLength?: number;
  allowSpecialChars?: boolean;
}

export default function SearchBar({ 
  placeholder = "Search...", 
  onSearch, 
  className = "",
  debounceMs = 300,
  maxLength = 100,
  allowSpecialChars = true
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Validate and sanitize input
  const validateInput = (value: string): string => {
    let sanitized = value.trim();
    
    // Remove dangerous characters if special chars not allowed
    if (!allowSpecialChars) {
      sanitized = sanitized.replace(/[<>"/\\&]/g, '');
    }
    
    // Limit length
    if (sanitized.length > maxLength) {
      sanitized = sanitized.slice(0, maxLength);
    }
    
    return sanitized;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const validatedQuery = validateInput(query);
      onSearch(validatedQuery);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, onSearch, debounceMs, maxLength, allowSpecialChars]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          className="pl-10 pr-10"
          maxLength={maxLength}
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
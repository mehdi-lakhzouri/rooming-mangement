'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface Sheet {
  id: string;
  name: string;
  rooms?: any[];
}

interface BottomSheetSelectorProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSheetSelect: (sheetId: string) => void;
  onSheetCreate?: () => void;
  onSheetDelete?: (sheetId: string) => void;
  className?: string;
}

export default function BottomSheetSelector({
  sheets,
  activeSheetId,
  onSheetSelect,
  onSheetCreate,
  onSheetDelete,
  className
}: BottomSheetSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  
  // Responsive sheet display configuration
  const getMaxSheetsPerView = useCallback(() => {
    if (containerWidth < 640) return 4; // Mobile: 4 sheets
    if (containerWidth < 768) return 5; // Small tablet: 5 sheets
    if (containerWidth < 1024) return 6; // Tablet: 6 sheets
    return 10; // Desktop: 8 sheets max
  }, [containerWidth]);

  const maxSheetsPerView = getMaxSheetsPerView();
  const totalPages = Math.ceil(sheets.length / maxSheetsPerView);
  const canNavigateLeft = currentPage > 0;
  const canNavigateRight = currentPage < totalPages - 1;

  // Get current page sheets
  const getCurrentPageSheets = useCallback(() => {
    const startIndex = currentPage * maxSheetsPerView;
    const endIndex = startIndex + maxSheetsPerView;
    return sheets.slice(startIndex, endIndex);
  }, [sheets, currentPage, maxSheetsPerView]);

  // Handle container resize
  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);
    return () => window.removeEventListener('resize', updateContainerWidth);
  }, []);

  // Auto-adjust current page when active sheet changes - but don't interfere with manual navigation
  useEffect(() => {
    if (activeSheetId) {
      const activeIndex = sheets.findIndex(sheet => sheet.id === activeSheetId);
      if (activeIndex !== -1) {
        const targetPage = Math.floor(activeIndex / maxSheetsPerView);
        // Only auto-adjust if the active sheet is not visible on the current page
        const startIndex = currentPage * maxSheetsPerView;
        const endIndex = startIndex + maxSheetsPerView;
        const isActiveSheetVisible = activeIndex >= startIndex && activeIndex < endIndex;
        
        if (!isActiveSheetVisible && targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    }
  }, [activeSheetId, sheets, maxSheetsPerView]); // Remove currentPage from dependencies to prevent loops

  // Navigation handlers
  const navigateLeft = useCallback(() => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  }, []);

  const navigateRight = useCallback(() => {
    setCurrentPage(prev => {
      const maxPages = Math.ceil(sheets.length / getMaxSheetsPerView()) - 1;
      return Math.min(maxPages, prev + 1);
    });
  }, [sheets.length, getMaxSheetsPerView]);

  const currentPageSheets = getCurrentPageSheets();

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50",
      className
    )}>
      <div className="flex items-center h-14" ref={containerRef}>
        {/* Left Navigation Button */}
        {totalPages > 1 && (
          <Button
            variant="ghost"  
            size="sm"
            onClick={navigateLeft}
            disabled={currentPage <= 0}
            className="h-full rounded-none px-3 shrink-0 disabled:opacity-30 hover:bg-gray-50 border-r border-gray-200"
            aria-label="Previous sheets"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Sheet Tabs Container - Clean Design */}
        <div className="flex-1 flex items-stretch overflow-hidden">
          <div className="flex items-stretch w-full">
            {currentPageSheets.map((sheet, index) => {
              const isActive = sheet.id === activeSheetId;
              
              // Calculate responsive width - proportionally fill available space
              const tabWidth = `${100 / currentPageSheets.length}%`;
              
              return (
                <div
                  key={sheet.id}
                  style={{ width: tabWidth }}
                  className={cn(
                    "relative flex items-center justify-center group cursor-pointer transition-all duration-200",
                    "px-3 py-2 min-w-0",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  onClick={() => onSheetSelect(sheet.id)}
                >
                  {/* Sheet Content - Clean Layout */}
                  <div className="flex items-center justify-center min-w-0 flex-1">
                    <span className={cn(
                      "font-medium truncate text-center",
                      "text-sm",
                      isActive ? "text-white" : "text-gray-700"
                    )}>
                      {sheet.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Navigation Button */}
        {totalPages > 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateRight}
            disabled={currentPage >= totalPages - 1}
            className="h-full rounded-none px-3 shrink-0 disabled:opacity-30 hover:bg-gray-50 border-l border-gray-200"
            aria-label="Next sheets"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

      </div>


    </div>
  );
}
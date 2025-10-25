'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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

  // Auto-adjust current page when active sheet changes
  useEffect(() => {
    if (activeSheetId) {
      const activeIndex = sheets.findIndex(sheet => sheet.id === activeSheetId);
      if (activeIndex !== -1) {
        const targetPage = Math.floor(activeIndex / maxSheetsPerView);
        if (targetPage !== currentPage) {
          setCurrentPage(targetPage);
        }
      }
    }
  }, [activeSheetId, sheets, maxSheetsPerView, currentPage]);

  // Navigation handlers
  const navigateLeft = () => {
    if (canNavigateLeft) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const navigateRight = () => {
    if (canNavigateRight) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const currentPageSheets = getCurrentPageSheets();

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50",
      className
    )}>
      <div className="flex items-center h-12" ref={containerRef}>
        {/* Left Navigation Button */}
        {sheets.length > maxSheetsPerView && (
          <Button
            variant="ghost"  
            size="sm"
            onClick={navigateLeft}
            disabled={!canNavigateLeft}
            className="h-full rounded-none border-r border-gray-200 px-2 shrink-0 disabled:opacity-30"
            aria-label="Previous sheets"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        )}

        {/* Sheet Tabs Container - Mobile First Responsive */}
        <div className="flex-1 flex items-stretch overflow-hidden">
          <div className="flex items-stretch w-full">
            {currentPageSheets.map((sheet, index) => {
              const isActive = sheet.id === activeSheetId;
              const roomCount = sheet.rooms?.length || 0;
              
              // Calculate responsive width - proportionally fill available space
              const tabWidth = `${100 / currentPageSheets.length}%`;
              
              return (
                <div
                  key={sheet.id}
                  style={{ width: tabWidth }}
                  className={cn(
                    "relative flex items-center group cursor-pointer transition-all duration-300 ease-in-out",
                    "border-r border-gray-200 last:border-r-0",
                    // Mobile-first responsive padding
                    "px-2 sm:px-3 md:px-4",
                    isActive
                      ? "bg-blue-50 border-b-2 border-b-blue-500"
                      : "bg-gray-50 hover:bg-gray-100 border-b-2 border-b-transparent"
                  )}
                  onClick={() => onSheetSelect(sheet.id)}
                  data-active={isActive}
                >
                  {/* Active Sheet Top Indicator */}
                  {isActive && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-blue-500" />
                  )}

                  {/* Sheet Content - Responsive Layout */}
                  <div className="flex flex-col justify-center min-w-0 flex-1 py-2">
                    <div className={cn(
                      "font-medium truncate transition-colors duration-200",
                      // Responsive text sizing
                      "text-xs sm:text-sm",
                      isActive 
                        ? "text-blue-700" 
                        : "text-gray-700 group-hover:text-gray-900"
                    )}>
                      {sheet.name}
                    </div>
                    
                    {/* Room count - hidden on very small screens */}
                    {roomCount > 0 && (
                      <div className={cn(
                        "text-xs mt-0.5 truncate transition-colors duration-200",
                        // Hide on mobile, show on larger screens
                        "hidden sm:block",
                        isActive 
                          ? "text-blue-500" 
                          : "text-gray-500 group-hover:text-gray-600"
                      )}>
                        {roomCount} room{roomCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>

                  {/* Active Sheet Side Indicators */}
                  {isActive && (
                    <>
                      <div className="absolute left-0 top-2 bottom-2 w-1 bg-blue-500 rounded-r" />
                      <div className="absolute right-0 top-2 bottom-2 w-1 bg-blue-500 rounded-l" />
                    </>
                  )}

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-blue-500 opacity-0 group-hover:opacity-5 transition-opacity duration-200" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Navigation Button */}
        {sheets.length > maxSheetsPerView && (
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateRight}
            disabled={!canNavigateRight}
            className="h-full rounded-none border-l border-gray-200 px-2 shrink-0 disabled:opacity-30"
            aria-label="Next sheets"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Add Sheet Button - Responsive */}
        {onSheetCreate && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onSheetCreate}
            className={cn(
              "h-full rounded-none border-l border-gray-200 shrink-0",
              "px-2 sm:px-3 hover:bg-green-50 hover:text-green-600",
              "transition-colors duration-200"
            )}
            aria-label="Add new sheet"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline-block ml-1 text-xs">Add</span>
          </Button>
        )}
      </div>

      {/* Enhanced Bottom Accent Line with Animation */}
      <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-green-500 opacity-40">
        <div className="h-full bg-linear-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />
      </div>

      {/* Page Indicator Dots - Show when paginated */}
      {totalPages > 1 && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-200",
                i === currentPage
                  ? "bg-blue-500 scale-125"
                  : "bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
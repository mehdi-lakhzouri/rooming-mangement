'use client';

import React, { useRef, useEffect } from 'react';
import { Lock, Unlock, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface Sheet {
  id: string;
  name: string;
}

interface MobileSheetSelectorProps {
  sheets: Sheet[];
  activeSheetId: string | null;
  onSheetSelect: (sheetId: string) => void;
  onSheetCreate?: () => void;
  isSheetUnlocked?: (sheetId: string) => boolean;
  className?: string;
}

export default function MobileSheetSelector({
  sheets,
  activeSheetId,
  onSheetSelect,
  onSheetCreate,
  isSheetUnlocked,
  className
}: MobileSheetSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to active tab when it changes
  useEffect(() => {
    if (activeTabRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeTab = activeTabRef.current;
      
      const containerRect = container.getBoundingClientRect();
      const tabRect = activeTab.getBoundingClientRect();
      
      // Check if tab is outside visible area
      if (tabRect.left < containerRect.left || tabRect.right > containerRect.right) {
        activeTab.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest',
          inline: 'center' 
        });
      }
    }
  }, [activeSheetId]);

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40",
      className
    )}>
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto px-4 py-3 space-x-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {sheets.map((sheet) => {
          const isActive = sheet.id === activeSheetId;
          const isUnlocked = isSheetUnlocked?.(sheet.id) ?? true;
          
          return (
            <button
              key={sheet.id}
              ref={isActive ? activeTabRef : null}
              onClick={() => onSheetSelect(sheet.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 shrink-0",
                isActive 
                  ? "bg-blue-600 text-white shadow-md transform scale-105" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95"
              )}
            >
              {/* Lock/Unlock Icon */}
              {sheet.id !== 'all' && (
                <div className="shrink-0">
                  {isUnlocked ? (
                    <Unlock className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-white" : "text-green-600"
                    )} />
                  ) : (
                    <Lock className={cn(
                      "h-3.5 w-3.5",
                      isActive ? "text-white" : "text-gray-500"
                    )} />
                  )}
                </div>
              )}
              
              {/* Sheet Name */}
              <span>{sheet.name}</span>
            </button>
          );
        })}
        
         
      </div>
    </div>
  );
}

import React from 'react';
import { Button } from './ui/button';
import { useRoomStore } from '../store/useRoomStore';

export default function SheetSelector() {
  const { sheets, selectedSheet, setSelectedSheet } = useRoomStore();

  if (sheets.length <= 1) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={selectedSheet === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => setSelectedSheet(null)}
      >
        All Sheets
      </Button>
      {sheets.map((sheet) => (
        <Button
          key={sheet.id}
          variant={selectedSheet === sheet.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedSheet(sheet.id)}
        >
          {sheet.name}
        </Button>
      ))}
    </div>
  );
}
import React from 'react';
import { Button } from './ui/button';
import { useRoomStore } from '../store/useRoomStore';

const genderOptions = [
  { value: 'ALL', label: 'All Rooms', color: 'text-gray-600' },
  { value: 'MALE', label: 'Male', color: 'text-blue-600' },
  { value: 'FEMALE', label: 'Female', color: 'text-pink-600' },
  { value: 'MIXED', label: 'Mixed', color: 'text-purple-600' },
] as const;

export default function GenderFilter() {
  const { selectedGender, setSelectedGender } = useRoomStore();

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {genderOptions.map((option) => (
        <Button
          key={option.value}
          variant={selectedGender === option.value ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedGender(option.value)}
          className={`
            ${selectedGender === option.value 
              ? 'bg-white shadow-sm' 
              : 'hover:bg-white/50'
            }
            ${option.color}
          `}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
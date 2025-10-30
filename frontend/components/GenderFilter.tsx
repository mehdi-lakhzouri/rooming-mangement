import React from 'react';
import { Button } from './ui/button';
import { useRoomStore } from '../store/useRoomStore';
import { Users, Mars, Venus } from 'lucide-react';

const genderOptions = [
  { 
    value: 'ALL', 
    label: 'All Rooms', 
    icon: Users,
    activeColor: 'bg-gray-600 hover:bg-gray-700',
    textColor: 'text-white'
  },
  { 
    value: 'MALE', 
    label: 'Male', 
    icon: Mars,
    activeColor: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white'
  },
  { 
    value: 'FEMALE', 
    label: 'Female', 
    icon: Venus,
    activeColor: 'bg-pink-600 hover:bg-pink-700',
    textColor: 'text-white'
  },
] as const;

export default function GenderFilter() {
  const { selectedGender, setSelectedGender } = useRoomStore();

  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-gray-100 rounded-xl">
      {genderOptions.map((option) => {
        const Icon = option.icon;
        const isActive = selectedGender === option.value;
        
        return (
          <Button
            key={option.value}
            variant="ghost"
            size="sm"
            onClick={() => setSelectedGender(option.value)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium
              ${isActive 
                ? `${option.activeColor} ${option.textColor} shadow-md transform scale-105` 
                : 'hover:bg-white/70 text-gray-600 hover:text-gray-800'
              }
            `}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Users } from 'lucide-react';
import { Room } from '../lib/api';
import JoinRoomModal from './JoinRoomModal';
import { cn } from '../lib/utils';

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const occupancyRate = (room.members.length / room.capacity) * 100;
  // Always calculate based on current members vs capacity, not the stored isFull flag
  const isFull = room.members.length >= room.capacity;

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FEMALE':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'MIXED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGenderProgressColor = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'bg-blue-500';
      case 'FEMALE':
        return 'bg-pink-500';
      case 'MIXED':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow min-w-[320px]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{room.name}</h3>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium border',
                getGenderColor(room.gender)
              )}
            >
              {room.gender}
            </span>
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                isFull
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
              )}
            >
              {isFull ? 'Full' : 'Available'}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">
            {room.members.length} / {room.capacity} people
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={occupancyRate} 
            className="h-2" 
          />
          <div 
            className={cn(
              "absolute top-0 left-0 h-2 rounded-full transition-all",
              getGenderProgressColor(room.gender)
            )}
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 mt-1">
          {Math.round(occupancyRate)}% occupied
        </span>
      </div>

      <div className="flex gap-2">
        <JoinRoomModal
          roomId={room.id}
          roomName={room.name}
          disabled={isFull}
        >
          <Button 
            className="flex-1" 
            disabled={isFull}
            variant={isFull ? "outline" : "default"}
          >
            {isFull ? 'Room Full' : 'Join Room'}
          </Button>
        </JoinRoomModal>
        <Link href={`/room/${room.id}`}>
          <Button variant="outline" size="sm">
            View
          </Button>
        </Link>
      </div>

      {room.members.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Members</h4>
          <div className="space-y-2 max-h-48 overflow-auto pr-2">
            {room.members.map((member) => {
              const initials = `${member.user.firstname.charAt(0)}${member.user.lastname.charAt(0)}`.toUpperCase();
              return (
                <div key={member.id} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                    {initials}
                  </div>
                  <span className="text-xs text-gray-600">
                    {member.user.firstname} {member.user.lastname}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
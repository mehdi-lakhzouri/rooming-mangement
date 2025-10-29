import React from 'react';
import Link from 'next/link';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Users, Eye } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow min-w-[320px]">
      {/* Header with room name and gender badge */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{room.name}</h3>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-sm font-medium',
            room.gender === 'MALE' ? 'bg-blue-100 text-blue-600' :
            room.gender === 'FEMALE' ? 'bg-pink-100 text-pink-600' :
            'bg-purple-100 text-purple-600'
          )}
        >
          {room.gender === 'MALE' ? 'Male' : room.gender === 'FEMALE' ? 'Female' : 'Mixed'}
        </span>
      </div>

      {/* Capacity */}
      <div className="mb-4">
        <p className="text-gray-500 text-sm">Capacity: {room.capacity}</p>
      </div>

      {/* Occupancy Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Occupancy</span>
          <span className={cn(
            "text-sm font-bold",
            isFull ? "text-red-600" : "text-green-600"
          )}>
            {isFull ? 'Full' : 'Available'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="relative mb-2">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className={cn(
                "h-3 rounded-full transition-all duration-300",
                isFull ? "bg-red-500" : "bg-green-500"
              )}
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
        </div>
        
        <p className="text-sm text-gray-500">{room.members.length} / {room.capacity} members</p>
      </div>

      {/* Members Section */}
      {room.members.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-1 mb-3">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Members</span>
          </div>
          <div className="space-y-2">
            {room.members.map((member) => {
              const initials = `${member.user.firstname.charAt(0)}${member.user.lastname.charAt(0)}`.toUpperCase();
              const bgColor = room.gender === 'MALE' ? 'bg-blue-500' : 
                             room.gender === 'FEMALE' ? 'bg-pink-500' : 'bg-purple-500';
              
              return (
                <div key={member.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0",
                    bgColor
                  )}>
                    {initials}
                  </div>
                  <span className="text-sm text-gray-600">
                    {member.user.firstname} {member.user.lastname}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <JoinRoomModal
          roomId={room.id}
          roomName={room.name}
          disabled={isFull}
        >
          <Button 
            className="flex-1 mr-4" 
            disabled={isFull}
            variant={isFull ? "outline" : "default"}
          >
            {isFull ? 'Room Full' : 'Join Room'}
          </Button>
        </JoinRoomModal>
        
        <Link href={`/room/${room.id}`}>
          <Button 
            variant="ghost" 
            size="sm"
            className="flex items-center gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { ArrowLeft, Users, Calendar, UserPlus, Home, Info } from 'lucide-react';
import { roomsApi, Room, RoomMember } from '../../../lib/api';
import { socket } from '../../../lib/socket';
import JoinRoomModal from '../../../components/JoinRoomModal';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils';

export default function RoomDetail() {
  const params = useParams();
  const roomId = params.id as string;
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRoom = async () => {
      setIsLoading(true);
      try {
        const response = await roomsApi.getOne(roomId);
        setRoom(response.data);
      } catch (error) {
        console.error('Error fetching room:', error);
        toast.error('Failed to load room details');
      } finally {
        setIsLoading(false);
      }
    };

    if (roomId) {
      fetchRoom();
    }
  }, [roomId]);

  useEffect(() => {
    const handleRoomUpdated = (updatedRoom: Room) => {
      if (updatedRoom.id === roomId) {
        setRoom(updatedRoom);
      }
    };

    const handleMemberJoined = (data: { roomId: string; member: RoomMember }) => {
      if (data.roomId === roomId && room) {
        setRoom({
          ...room,
          members: [...room.members, data.member],
        });
      }
    };

    const handleMemberLeft = (data: { roomId: string; memberId: string }) => {
      if (data.roomId === roomId && room) {
        setRoom({
          ...room,
          members: room.members.filter(m => m.id !== data.memberId),
        });
      }
    };

    socket.on('room_updated', handleRoomUpdated);
    socket.on('member_joined', handleMemberJoined);
    socket.on('member_left', handleMemberLeft);

    return () => {
      socket.off('room_updated', handleRoomUpdated);
      socket.off('member_joined', handleMemberJoined);
      socket.off('member_left', handleMemberLeft);
    };
  }, [roomId, room]);

  const handleRemoveMember = async (memberId: string) => {
    if (!room) return;

    try {
      await roomsApi.removeMember(room.id, memberId);
      setRoom({
        ...room,
        members: room.members.filter(m => m.id !== memberId),
      });
      toast.success('Member removed successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to remove member';
      toast.error(message);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Room not found</h1>
          <p className="text-gray-600 mb-4">The room you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>Go back home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const occupancyRate = (room.members.length / room.capacity) * 100;
  const isFull = room.members.length >= room.capacity;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-First Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Go back to rooms"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                {room.name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('text-xs border', getGenderColor(room.gender))}>
                  {room.gender}
                </Badge>
                <Badge className={cn('text-xs', isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800')}>
                  {isFull ? 'Full' : 'Available'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Mobile-First Room Info Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-blue-50 pb-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-2">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Info className="h-5 w-5 text-blue-600" />
                  Room Information
                </CardTitle>
                {room.sheet && (
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    Sheet: {room.sheet.name}
                  </p>
                )}
              </div>
              <div className="shrink-0">
                <JoinRoomModal roomId={room.id} roomName={room.name} disabled={isFull}>
                  <Button 
                    disabled={isFull} 
                    size="lg" 
                    className={cn(
                      "w-full sm:w-auto shadow-lg transition-all duration-200",
                      !isFull && "hover:scale-105"
                    )}
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    {isFull ? 'Room Full' : 'Join Room'}
                  </Button>
                </JoinRoomModal>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Mobile-First Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Occupancy</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {room.members.length}/{room.capacity}
                  </p>
                </div>
                <div className={cn(
                  "p-2 sm:p-3 rounded-full",
                  room.gender === 'MALE' ? 'bg-blue-100' : 'bg-pink-100'
                )}>
                  <Users className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5",
                    room.gender === 'MALE' ? 'text-blue-600' : 'text-pink-600'
                  )} />
                </div>
              </div>
              <div className="mt-3">
                <Progress value={occupancyRate} className="h-2" />
                <span className="text-xs text-gray-500 mt-1">
                  {Math.round(occupancyRate)}% occupied
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Status</p>
                  <p className={cn(
                    "text-lg sm:text-2xl font-bold",
                    isFull ? 'text-red-600' : 'text-green-600'
                  )}>
                    {isFull ? 'Full' : 'Available'}
                  </p>
                </div>
                <div className={cn(
                  "p-2 sm:p-3 rounded-full",
                  isFull ? 'bg-red-100' : 'bg-green-100'
                )}>
                  <div className={cn(
                    "h-4 w-4 sm:h-5 sm:w-5 rounded-full",
                    isFull ? 'bg-red-500' : 'bg-green-500'
                  )} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Capacity</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {room.capacity}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-gray-100">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Maximum members</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Created</p>
                  <p className="text-sm sm:text-base font-semibold text-gray-900">
                    {new Date(room.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="p-2 sm:p-3 rounded-full bg-indigo-100">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(room.createdAt).getFullYear()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Members List - Mobile First */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5 text-gray-700" />
              Current Members
              <Badge variant="secondary" className="ml-2">
                {room.members.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {room.members.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No members yet</h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  Be the first to join this room and start building your community!
                </p>
                <div className="mt-6">
                  <JoinRoomModal roomId={room.id} roomName={room.name} disabled={isFull}>
                    <Button size="lg" className="shadow-lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Join This Room
                    </Button>
                  </JoinRoomModal>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {room.members.map((member, index) => {
                  const initials = `${member.user.firstname.charAt(0)}${member.user.lastname.charAt(0)}`.toUpperCase();
                  return (
                    <div 
                      key={member.id} 
                      className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={cn(
                          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-sm",
                          index % 3 === 0 && "bg-blue-500",
                          index % 3 === 1 && "bg-green-500", 
                          index % 3 === 2 && "bg-purple-500"
                        )}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                            {member.user.firstname} {member.user.lastname}
                          </h4>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Joined {new Date(member.joinedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: new Date(member.joinedAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant="secondary" 
                          className="text-xs hidden sm:inline-flex"
                        >
                          Member #{index + 1}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
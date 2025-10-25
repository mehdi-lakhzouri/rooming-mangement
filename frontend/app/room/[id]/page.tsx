'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Progress } from '../../../components/ui/progress';
import { ArrowLeft, Users, Calendar } from 'lucide-react';
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
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to rooms
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{room.name}</h1>
              <div className="flex items-center gap-3">
                <Badge className={cn('border', getGenderColor(room.gender))}>
                  {room.gender}
                </Badge>
                <Badge className={isFull ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}>
                  {isFull ? 'Full' : 'Available'}
                </Badge>
                {room.sheet && (
                  <span className="text-sm text-gray-600">Sheet: {room.sheet.name}</span>
                )}
              </div>
            </div>
            
            <JoinRoomModal roomId={room.id} roomName={room.name} disabled={isFull}>
              <Button disabled={isFull} size="lg">
                {isFull ? 'Room Full' : 'Join Room'}
              </Button>
            </JoinRoomModal>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Room Stats */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Room Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Occupancy</span>
                  <span className="text-sm font-medium">
                    {room.members.length} / {room.capacity}
                  </span>
                </div>
                <div className="relative">
                  <Progress value={occupancyRate} className="h-3" />
                  <div 
                    className={cn(
                      "absolute top-0 left-0 h-3 rounded-full transition-all",
                      getGenderProgressColor(room.gender)
                    )}
                    style={{ width: `${occupancyRate}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {Math.round(occupancyRate)}% occupied
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="h-4 w-4" />
                  Created: {new Date(room.createdAt).toLocaleDateString()}
                </div>
                <div className="text-sm text-gray-600">
                  Capacity: {room.capacity} people
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Members List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Members ({room.members.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {room.members.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No members yet</h3>
                  <p className="text-gray-500">Be the first to join this room!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {room.members.map((member) => {
                    const initials = `${member.user.firstname.charAt(0)}${member.user.lastname.charAt(0)}`.toUpperCase();
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {initials}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {member.user.firstname} {member.user.lastname}
                            </h4>
                            <p className="text-sm text-gray-600">
                              Joined: {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {/* Member removal disabled in view mode */}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
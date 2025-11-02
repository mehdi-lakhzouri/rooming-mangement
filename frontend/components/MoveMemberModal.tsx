'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Loader2, Users, Building, Search, ArrowRight, Shield, Move } from 'lucide-react';
import { roomsApi, Room, RoomMember } from '../lib/api';
import { toast } from 'sonner';

interface MoveMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  member: RoomMember | null;
  onMemberMoved: (updatedMember: RoomMember) => void;
}

export default function MoveMemberModal({
  open,
  onOpenChange,
  member,
  onMemberMoved,
}: MoveMemberModalProps) {
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingRooms, setIsFetchingRooms] = useState(false);

  useEffect(() => {
    if (open && member) {
      fetchAvailableRooms();
      setSelectedRoomId('');
      setSearchQuery('');
    }
  }, [open, member]);

  const fetchAvailableRooms = async () => {
    if (!member) return;
    
    setIsFetchingRooms(true);
    try {
      const response = await roomsApi.getAvailableRoomsForMember(member.id);
      setAvailableRooms(response.data);
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      toast.error('Failed to load available rooms', {
        position: 'bottom-left',
      });
    } finally {
      setIsFetchingRooms(false);
    }
  };

  // Filter rooms based on search query
  const filteredRooms = useMemo(() => {
    if (!searchQuery) return availableRooms;
    return availableRooms.filter(room =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [availableRooms, searchQuery]);

  const handleMoveMember = async () => {
    if (!member || !selectedRoomId) return;

    setIsLoading(true);
    try {
      const response = await roomsApi.moveMember(member.id, {
        destinationRoomId: selectedRoomId,
      });

      toast.success('Member moved successfully!', {
        position: 'bottom-left',
      });

      onMemberMoved(response.data.member);
      onOpenChange(false);
      setSelectedRoomId('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to move member';
      toast.error(message, {
        position: 'bottom-left',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedRoomId('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto" aria-describedby="move-member-description">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Move className="h-5 w-5 text-blue-600" />
            Move Member to Another Room
          </DialogTitle>
          <p id="move-member-description" className="text-sm text-gray-600">
            Select a compatible room to move the member. Only rooms with matching gender and from the same sheet are shown.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Information */}
          {member && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full">
                  <Users className="h-4 w-4 text-gray-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {member.user.firstname} {member.user.lastname}
                  </h4>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Building className="h-3 w-3" />
                    Currently in: <span className="font-medium">{member.room?.name}</span>
                    <Badge 
                      className={`text-xs ${
                        member.room?.gender === 'MALE'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-pink-100 text-pink-800'
                      }`}
                    >
                      {member.room?.gender}
                    </Badge>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filter Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Shield className="h-4 w-4" />
              <span>
                Showing rooms with matching gender ({member?.room?.gender?.toLowerCase()}) within the same sheet
              </span>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search available rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                disabled={isFetchingRooms}
              />
            </div>
          </div>

          {/* Loading State */}
          {isFetchingRooms && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-gray-500">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading available rooms...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isFetchingRooms && filteredRooms.length === 0 && (
            <div className="text-center py-8">
              {availableRooms.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Building className="h-8 w-8 text-amber-500" />
                    <p className="font-medium text-amber-800">No Available Rooms</p>
                    <p className="text-sm text-amber-600">
                      All compatible rooms are currently full or unavailable.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-gray-400" />
                    <p className="font-medium text-gray-600">No Matching Rooms</p>
                    <p className="text-sm text-gray-500">
                      Try adjusting your search query.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Available Rooms List */}
          {!isFetchingRooms && filteredRooms.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Available Rooms ({filteredRooms.length})
              </Label>
              <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-2">
                {filteredRooms.map((room) => (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedRoomId === room.id
                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-1 bg-white rounded border">
                          <Building className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{room.name}</h4>
                          <p className="text-sm text-gray-500">
                            {room.members.length}/{room.capacity} members
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="secondary"
                          className={
                            room.gender === 'MALE'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-pink-100 text-pink-800'
                          }
                        >
                          {room.gender}
                        </Badge>
                        {selectedRoomId === room.id && (
                          <div className="p-1 bg-blue-500 rounded-full">
                            <ArrowRight className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Selected Room Details */}
          {selectedRoomId && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <ArrowRight className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-blue-900">Ready to Move</p>
                  <p className="text-sm text-blue-700">
                    {member?.user.firstname} will be moved to{' '}
                    <strong>{filteredRooms.find(r => r.id === selectedRoomId)?.name}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleMoveMember}
            disabled={!selectedRoomId || isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Moving...
              </>
            ) : (
              'Move Member'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
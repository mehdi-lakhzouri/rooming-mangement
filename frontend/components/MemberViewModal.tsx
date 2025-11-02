'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { RoomMember } from '../lib/api';
import { User, Building, Calendar, MapPin, UserCheck } from 'lucide-react';

interface MemberViewModalProps {
  member: RoomMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MemberViewModal({ member, open, onOpenChange }: MemberViewModalProps) {
  if (!member) return null;

  const joinedDate = new Date(member.joinedAt);
  const createdDate = new Date(member.user.createdAt);

  const getGenderBadgeClass = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FEMALE':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            Member Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Member Header */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white text-2xl font-bold">
                {member.user.firstname[0]}{member.user.lastname[0]}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {member.user.firstname} {member.user.lastname}
                </h2>
                <p className="text-sm text-gray-600 mt-1">Room Member</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Active Member
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Member Since</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {joinedDate.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Calendar className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">User Created</p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      {createdDate.toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <User className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24))} days ago
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Room Information */}
          {member.room && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="h-5 w-5 mr-2 text-gray-600" />
                Assigned Room
              </h3>
              
              <Card className="hover:shadow-md transition-all duration-200">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{member.room.name}</h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge className={getGenderBadgeClass(member.room.gender)}>
                            {member.room.gender}
                          </Badge>
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="h-4 w-4 mr-1" />
                            Sheet: {member.room.sheet?.name || 'Unknown'}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="text-gray-500">Capacity:</span>
                            <span className="ml-2 font-semibold text-gray-900">{member.room.capacity}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Occupancy:</span>
                            <span className="ml-2 font-semibold text-gray-900">
                              {member.room.members.length}/{member.room.capacity}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <Badge 
                              className={member.room.members.length >= member.room.capacity 
                                ? 'bg-red-100 text-red-800 ml-2' 
                                : 'bg-green-100 text-green-800 ml-2'
                              }
                            >
                              {member.room.members.length >= member.room.capacity ? 'Full' : 'Available'}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>Room Occupancy</span>
                            <span>{Math.round((member.room.members.length / member.room.capacity) * 100)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                              style={{ 
                                width: `${Math.round((member.room.members.length / member.room.capacity) * 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* User Information */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">User Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">User ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{member.user.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Member ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{member.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">First Name:</span>
                  <span className="ml-2 text-gray-900">{member.user.firstname}</span>
                </div>
                <div>
                  <span className="text-gray-500">Last Name:</span>
                  <span className="ml-2 text-gray-900">{member.user.lastname}</span>
                </div>
                <div>
                  <span className="text-gray-500">Room ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{member.roomId}</span>
                </div>
                <div>
                  <span className="text-gray-500">Joined Room:</span>
                  <span className="ml-2 text-gray-900">
                    {joinedDate.toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

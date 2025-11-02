'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Sheet } from '../lib/api';
import { FileText, Building, Users, Calendar, Layers, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface SheetViewModalProps {
  sheet: Sheet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SheetViewModal({ sheet, open, onOpenChange }: SheetViewModalProps) {
  const [codeCopied, setCodeCopied] = useState(false);

  if (!sheet) return null;

  const totalCapacity = sheet.rooms.reduce((sum, room) => sum + room.capacity, 0);
  const totalMembers = sheet.rooms.reduce((sum, room) => sum + room.members.length, 0);
  const occupancyRate = totalCapacity > 0 ? Math.round((totalMembers / totalCapacity) * 100) : 0;
  const maleRooms = sheet.rooms.filter(r => r.gender === 'MALE').length;
  const femaleRooms = sheet.rooms.filter(r => r.gender === 'FEMALE').length;

  const handleCopyCode = () => {
    if (sheet.code) {
      navigator.clipboard.writeText(sheet.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <FileText className="h-5 w-5 text-purple-600" />
            </div>
            Sheet Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Sheet Header */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 border border-purple-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{sheet.name}</h2>
                <p className="text-sm text-gray-600 mt-1">Configuration Sheet</p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                {sheet.rooms.length} Rooms
              </Badge>
            </div>

            {/* Access Code */}
            {sheet.code && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Access Code</p>
                    <p className="text-lg font-mono font-bold text-gray-900">{sheet.code}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="ml-4"
                  >
                    {codeCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 rounded-full mb-2">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{sheet.rooms.length}</div>
                  <div className="text-xs text-gray-500">Total Rooms</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-green-100 rounded-full mb-2">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalMembers}</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-amber-100 rounded-full mb-2">
                    <Layers className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalCapacity}</div>
                  <div className="text-xs text-gray-500">Capacity</div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-purple-100 rounded-full mb-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{occupancyRate}%</div>
                  <div className="text-xs text-gray-500">Occupancy</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gender Distribution */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Male Rooms</p>
                    <p className="text-2xl font-bold text-blue-600 mt-1">{maleRooms}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Female Rooms</p>
                    <p className="text-2xl font-bold text-pink-600 mt-1">{femaleRooms}</p>
                  </div>
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Building className="h-6 w-6 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rooms List */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Building className="h-5 w-5 mr-2 text-gray-600" />
              Rooms ({sheet.rooms.length})
            </h3>
            
            {sheet.rooms.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <Building className="h-12 w-12 mx-auto" />
                  </div>
                  <p className="text-gray-500">No rooms configured for this sheet yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sheet.rooms.map((room) => (
                  <Card key={room.id} className="hover:shadow-md transition-all duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{room.name}</h4>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={room.gender === 'MALE' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                              {room.gender}
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {room.members.length}/{room.capacity}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Occupancy</div>
                          <div className="text-lg font-bold text-gray-900">
                            {Math.round((room.members.length / room.capacity) * 100)}%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Sheet Metadata */}
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Sheet Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Sheet ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{sheet.id}</span>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(sheet.createdAt).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Available Spots:</span>
                  <span className="ml-2 text-gray-900">{totalCapacity - totalMembers}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className="ml-2 text-gray-900">
                    {occupancyRate === 100 ? 'Full' : 'Available'}
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

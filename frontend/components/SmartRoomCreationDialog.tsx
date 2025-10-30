'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Plus, Minus, Loader2, Check, X } from 'lucide-react';
import { roomsApi, Sheet, Room } from '../lib/api';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

interface RoomFormData {
  name: string;
  capacity: number;
  gender: 'MALE' | 'FEMALE';
}

interface SmartRoomCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sheet: Sheet | null;
  onRoomsCreated: (rooms: Room[]) => void;
}

export default function SmartRoomCreationDialog({
  open,
  onOpenChange,
  sheet,
  onRoomsCreated
}: SmartRoomCreationDialogProps) {
  const [step, setStep] = useState<'count' | 'forms' | 'creating' | 'success'>('count');
  const [roomCount, setRoomCount] = useState(1);
  const [roomForms, setRoomForms] = useState<RoomFormData[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdRooms, setCreatedRooms] = useState<Room[]>([]);
  const [errors, setErrors] = useState<{ [key: number]: string }>({});
  
  const firstInputRef = useRef<HTMLInputElement>(null);
  const roomCountInputRef = useRef<HTMLInputElement>(null);

  // Initialize room forms when count changes
  useEffect(() => {
    if (step === 'forms') {
      const forms: RoomFormData[] = [];
      for (let i = 0; i < roomCount; i++) {
        forms.push({
          name: `Room ${i + 1}${sheet ? ` - ${sheet.name}` : ''}`,
          capacity: 2,
          gender: 'MALE'
        });
      }
      setRoomForms(forms);
    }
  }, [roomCount, step, sheet]);

  // Focus management
  useEffect(() => {
    if (open && step === 'count' && roomCountInputRef.current) {
      setTimeout(() => roomCountInputRef.current?.focus(), 100);
    }
    if (step === 'forms' && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [open, step]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setStep('count');
      setRoomCount(1);
      setRoomForms([]);
      setIsCreating(false);
      setCreatedRooms([]);
      setErrors({});
    }
  }, [open]);

  const handleRoomCountChange = (value: number) => {
    const clampedValue = Math.max(1, Math.min(8, value));
    setRoomCount(clampedValue);
  };

  const handleFormChange = (index: number, field: keyof RoomFormData, value: any) => {
    const updatedForms = [...roomForms];
    updatedForms[index] = { ...updatedForms[index], [field]: value };
    setRoomForms(updatedForms);
    
    // Clear error when user starts typing
    if (errors[index]) {
      const newErrors = { ...errors };
      delete newErrors[index];
      setErrors(newErrors);
    }
  };

  const validateForms = () => {
    const newErrors: { [key: number]: string } = {};
    
    roomForms.forEach((form, index) => {
      if (!form.name.trim()) {
        newErrors[index] = 'Room name is required';
      } else if (form.name.length > 50) {
        newErrors[index] = 'Room name must be less than 50 characters';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRooms = async () => {
    if (!sheet || !validateForms()) return;

    setIsCreating(true);
    setStep('creating');

    try {
      const createdRoomPromises = roomForms.map(async (form) => {
        return roomsApi.create({
          name: form.name,
          capacity: form.capacity,
          gender: form.gender,
          sheetId: sheet.id
        });
      });

      const responses = await Promise.all(createdRoomPromises);
      const newRooms = responses.map(response => response.data);
      
      setCreatedRooms(newRooms);
      setStep('success');
      
      // Call the callback after a brief delay to show success state
      setTimeout(() => {
        onRoomsCreated(newRooms);
        toast.success(`Successfully created ${newRooms.length} room(s) for ${sheet.name}`);
      }, 1500);

    } catch (error: any) {
      console.error('Error creating rooms:', error);
      const message = error.response?.data?.message || 'Failed to create rooms';
      toast.error(message);
      setStep('forms');
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (step !== 'creating') {
      onOpenChange(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && step !== 'creating') {
      handleClose();
    }
  };

  if (!sheet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        aria-labelledby="room-creation-title"
        role="dialog"
        aria-modal="true"
      >
        <DialogHeader>
          <DialogTitle id="room-creation-title" className="flex items-center gap-2">
            <span>Create Rooms for "{sheet.name}"</span>
            {step === 'success' && <Check className="h-5 w-5 text-green-600" />}
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Room Count Selection */}
        {step === 'count' && (
          <div className="space-y-6" role="tabpanel" aria-label="Select number of rooms">
            <div className="text-center space-y-4">
              <p className="text-gray-600">How many rooms would you like to create?</p>
              
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomCountChange(roomCount - 1)}
                  disabled={roomCount <= 1}
                  aria-label="Decrease room count"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Label htmlFor="room-count" className="sr-only">
                    Number of rooms
                  </Label>
                  <Input
                    id="room-count"
                    ref={roomCountInputRef}
                    type="number"
                    min="1"
                    max="8"
                    value={roomCount}
                    onChange={(e) => handleRoomCountChange(parseInt(e.target.value) || 1)}
                    className="w-20 text-center text-lg font-semibold"
                    aria-describedby="room-count-help"
                  />
                  <span className="text-sm text-gray-500">rooms</span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoomCountChange(roomCount + 1)}
                  disabled={roomCount >= 8}
                  aria-label="Increase room count"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <p id="room-count-help" className="text-xs text-gray-500">
                You can create between 1 and 8 rooms
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleClose}>
                Skip
              </Button>
              <Button 
                onClick={() => setStep('forms')}
                className="min-w-24"
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Room Forms */}
        {step === 'forms' && (
          <div className="space-y-6" role="tabpanel" aria-label="Room configuration forms">
            <div className="text-sm text-gray-600">
              Configure each room for <Badge variant="secondary">{sheet.name}</Badge>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {roomForms.map((form, index) => (
                <Card key={index} className={cn(
                  "transition-colors duration-200",
                  errors[index] ? "border-red-200 bg-red-50" : ""
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>Room #{index + 1}</span>
                      {errors[index] && (
                        <span className="text-red-600 text-xs font-normal">
                          {errors[index]}
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`room-name-${index}`} className="text-xs">
                        Room Name *
                      </Label>
                      <Input
                        id={`room-name-${index}`}
                        ref={index === 0 ? firstInputRef : undefined}
                        value={form.name}
                        onChange={(e) => handleFormChange(index, 'name', e.target.value)}
                        placeholder="Enter room name"
                        className={cn(
                          "mt-1",
                          errors[index] ? "border-red-300 focus:border-red-500" : ""
                        )}
                        aria-invalid={!!errors[index]}
                        aria-describedby={errors[index] ? `room-name-error-${index}` : undefined}
                      />
                      {errors[index] && (
                        <p id={`room-name-error-${index}`} className="text-red-600 text-xs mt-1">
                          {errors[index]}
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`capacity-${index}`} className="text-xs">
                          Capacity
                        </Label>
                        <select
                          id={`capacity-${index}`}
                          value={form.capacity}
                          onChange={(e) => handleFormChange(index, 'capacity', parseInt(e.target.value))}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {[2, 3, 4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} people</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor={`gender-${index}`} className="text-xs">
                          Gender Type
                        </Label>
                        <select
                          id={`gender-${index}`}
                          value={form.gender}
                          onChange={(e) => handleFormChange(index, 'gender', e.target.value)}
                          className="w-full mt-1 p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >

                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setStep('count')}
                disabled={isCreating}
              >
                Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose} disabled={isCreating}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateRooms}
                  disabled={isCreating}
                  className="min-w-32"
                >
                  Create {roomCount} Room{roomCount !== 1 ? 's' : ''}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Creating State */}
        {step === 'creating' && (
          <div className="space-y-6 text-center py-8" role="status" aria-live="polite">
            <div className="flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium">Creating Rooms...</h3>
              <p className="text-gray-600 mt-2">
                Setting up {roomCount} room{roomCount !== 1 ? 's' : ''} for "{sheet.name}"
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Success State */}
        {step === 'success' && (
          <div className="space-y-6 text-center py-8">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-green-900">
                Rooms Created Successfully!
              </h3>
              <p className="text-gray-600 mt-2">
                {createdRooms.length} room{createdRooms.length !== 1 ? 's have' : ' has'} been added to "{sheet.name}"
              </p>
            </div>
            
            {createdRooms.length > 0 && (
              <div className="text-left max-w-md mx-auto">
                <h4 className="text-sm font-medium mb-2">Created Rooms:</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {createdRooms.map((room, index) => (
                    <div key={room.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                      <span>{room.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {room.capacity} seats • {room.gender}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
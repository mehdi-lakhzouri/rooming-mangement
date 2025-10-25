import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { roomsApi } from '../lib/api';
import { useRoomStore } from '../store/useRoomStore';
import { toast } from 'sonner';

interface JoinRoomModalProps {
  roomId: string;
  roomName: string;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function JoinRoomModal({ roomId, roomName, disabled, children }: JoinRoomModalProps) {
  const [open, setOpen] = useState(false);
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const updateRoom = useRoomStore((state) => state.updateRoom);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstname.trim() || !lastname.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await roomsApi.join(roomId, {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
      });
      
      updateRoom(response.data);
      toast.success(`Successfully joined ${roomName}!`);
      setOpen(false);
      setFirstname('');
      setLastname('');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to join room';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild disabled={disabled}>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join {roomName}</DialogTitle>
          <DialogDescription>
            Enter your details to join this room
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstname">First Name</Label>
            <Input
              id="firstname"
              type="text"
              value={firstname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstname(e.target.value)}
              placeholder="Enter your first name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastname">Last Name</Label>
            <Input
              id="lastname"
              type="text"
              value={lastname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastname(e.target.value)}
              placeholder="Enter your last name"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
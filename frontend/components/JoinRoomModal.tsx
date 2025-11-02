import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { UserPlus, AlertCircle, Loader2 } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ firstname?: string; lastname?: string }>({});
  const updateRoom = useRoomStore((state) => state.updateRoom);

  // Validation patterns matching backend
  const namePattern = /^[a-zA-ZÀ-ÿ\u0100-\u017F\u0180-\u024F\u1E00-\u1EFF\s'-]+$/;
  
  const validateField = (value: string, fieldName: string) => {
    const trimmed = value.trim();
    
    if (!trimmed) {
      return `${fieldName} is required`;
    }
    
    if (trimmed.length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    
    if (trimmed.length > 50) {
      return `${fieldName} cannot exceed 50 characters`;
    }
    
    if (!namePattern.test(trimmed)) {
      return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
    }
    
    return '';
  };

  const handleFieldChange = (value: string, field: 'firstname' | 'lastname') => {
    if (field === 'firstname') {
      setFirstname(value);
      if (errors.firstname) {
        const error = validateField(value, 'First name');
        setErrors(prev => ({ ...prev, firstname: error }));
      }
    } else {
      setLastname(value);
      if (errors.lastname) {
        const error = validateField(value, 'Last name');
        setErrors(prev => ({ ...prev, lastname: error }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const firstnameError = validateField(firstname, 'First name');
    const lastnameError = validateField(lastname, 'Last name');
    
    setErrors({
      firstname: firstnameError,
      lastname: lastnameError,
    });

    if (firstnameError || lastnameError) {
      toast.error('Please fix the validation errors', {
        position: 'bottom-left',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await roomsApi.join(roomId, {
        firstname: firstname.trim(),
        lastname: lastname.trim(),
      });
      
      updateRoom(response.data);
      toast.success(`Successfully joined ${roomName}!`, {
        position: 'bottom-left',
      });
      setOpen(false);
      setFirstname('');
      setLastname('');
      setErrors({});
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to join room';
      toast.error(message, {
        position: 'bottom-left',
      });
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
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-blue-600" />
            Join {roomName}
          </DialogTitle>
          <DialogDescription>
            Enter your personal details to join this room. All fields are required and will be validated.
          </DialogDescription>
        </DialogHeader>
        
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 text-sm">
            Names must contain only letters, spaces, hyphens, and apostrophes (2-50 characters)
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="firstname" className="text-sm font-medium">
              First Name *
            </Label>
            <Input
              id="firstname"
              type="text"
              value={firstname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(e.target.value, 'firstname')}
              placeholder="Enter your first name"
              className={errors.firstname ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
              autoComplete="given-name"
            />
            {errors.firstname && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.firstname}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastname" className="text-sm font-medium">
              Last Name *
            </Label>
            <Input
              id="lastname"
              type="text"
              value={lastname}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange(e.target.value, 'lastname')}
              placeholder="Enter your last name"
              className={errors.lastname ? 'border-red-500 focus:border-red-500' : ''}
              disabled={isLoading}
              autoComplete="family-name"
            />
            {errors.lastname && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.lastname}
              </p>
            )}
          </div>
          
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setFirstname('');
                setLastname('');
                setErrors({});
              }}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full sm:w-auto min-w-[120px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Join Room
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
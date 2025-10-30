'use client';

import React from 'react';
import { Lock, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useSheetAccessStore } from '../store/useSheetAccessStore';
import { Sheet } from '../lib/api';

interface SheetLockWrapperProps {
  sheet: Sheet;
  children: React.ReactNode;
}

export default function SheetLockWrapper({ sheet, children }: SheetLockWrapperProps) {
  const { isSheetUnlocked, showUnlockModal } = useSheetAccessStore();

  // If the sheet is unlocked, render the children
  if (isSheetUnlocked(sheet.id)) {
    return <>{children}</>;
  }

  // If the sheet is locked, show the lock screen
  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <Card className="w-full max-w-md mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Sheet Access Required
          </CardTitle>
          <CardDescription className="text-gray-600 mt-2">
            This sheet ("{sheet.name}") is protected and requires an access code to view its contents.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center pt-2">
          <div className="space-y-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-700">
                <Lock className="h-4 w-4 text-blue-500" />
                <span>Protected Content</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Enter your access code to unlock this sheet and view all available rooms.
              </p>
            </div>
            
            <Button
              onClick={() => showUnlockModal(sheet.id)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5"
              size="lg"
            >
              <Lock className="h-4 w-4 mr-2" />
              Enter Access Code
            </Button>
            
          
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

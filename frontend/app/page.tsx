'use client';

import React, { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Building } from 'lucide-react';
import RoomCard from '../components/RoomCard';
import GenderFilter from '../components/GenderFilter';
import BottomSheetSelector from '../components/BottomSheetSelector';
import MobileSheetSelector from '../components/MobileSheetSelector';
import SheetLockWrapper from '../components/SheetLockWrapper';
import SheetUnlockModal from '../components/SheetUnlockModal';
import { useRoomStore } from '../store/useRoomStore';
import { useSheetAccessStore } from '../store/useSheetAccessStore';
import { sheetsApi } from '../lib/api';
import { socket } from '../lib/socket';

export default function Home() {
  const {
    sheets,
    selectedGender,
    selectedSheet,
    setSheets,
    setSelectedSheet,
    setLoading,
    setError,
    handleRoomCreated,
    handleRoomUpdated,
    handleRoomDeleted,
    handleMemberJoined,
    handleMemberLeft,
    handleSheetCreated,
    handleSheetDeleted,
  } = useRoomStore();

  const { isSheetUnlocked } = useSheetAccessStore();

  // Filter rooms based on selected criteria and sheet access
  const filteredRooms = useMemo(() => {
    // If no sheet is selected, select the first available sheet
    const currentSheet = selectedSheet || (sheets.length > 0 ? sheets[0].id : null);
    
    if (!currentSheet) {
      return [];
    }
    
    const sheet = sheets.find(s => s.id === currentSheet);
    if (!sheet || !isSheetUnlocked(sheet.id)) {
      return [];
    }
    
    let rooms = sheet.rooms;
    
    if (selectedGender !== 'ALL') {
      rooms = rooms.filter(room => room.gender === selectedGender);
    }
    
    return rooms;
  }, [sheets, selectedGender, selectedSheet, isSheetUnlocked]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await sheetsApi.getAll();
        const sheetsData = response.data;
        setSheets(sheetsData);
        
        // Set default sheet if none is selected and sheets are available
        if (!selectedSheet && sheetsData.length > 0) {
          setSelectedSheet(sheetsData[0].id);
        }
      } catch (error) {
        setError('Failed to load data');
        console.error('Error fetching sheets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [setSheets, setLoading, setError, selectedSheet, setSelectedSheet]);

  useEffect(() => {
    // Socket event listeners
    socket.on('room_created', handleRoomCreated);
    socket.on('room_updated', handleRoomUpdated);
    socket.on('room_deleted', ({ roomId }) => handleRoomDeleted(roomId));
    socket.on('member_joined', ({ roomId, member }) => handleMemberJoined(roomId, member));
    socket.on('member_left', ({ roomId, memberId }) => handleMemberLeft(roomId, memberId));
    socket.on('sheet_created', handleSheetCreated);
    socket.on('sheet_deleted', ({ sheetId }) => handleSheetDeleted(sheetId));

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_updated', handleRoomUpdated);
      socket.off('room_deleted');
      socket.off('member_joined');
      socket.off('member_left');
      socket.off('sheet_created', handleSheetCreated);
      socket.off('sheet_deleted');
    };
  }, [
    handleRoomCreated,
    handleRoomUpdated,
    handleRoomDeleted,
    handleMemberJoined,
    handleMemberLeft,
    handleSheetCreated,
    handleSheetDeleted,
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Building className="h-12 w-12 text-blue-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-900">Rooming App</h1>
          </div>
          <p className="text-lg text-gray-600 mb-6">Find and join available rooms</p>
          <Link href="/dashboard">
            <Button variant="outline" size="lg">
              Dashboard
            </Button>
          </Link>
        </div>
        {/* Filters */}
        <div className="mb-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Available Rooms</h2>
            <div className="text-sm text-gray-500">
              {filteredRooms.length} rooms found
            </div>
          </div>
          
          <div className="flex justify-center">
            <GenderFilter />
          </div>
        </div>

        {/* Rooms Grid */}
        {(() => {
          const currentSheetId = selectedSheet || (sheets.length > 0 ? sheets[0].id : null);
          const sheet = sheets.find(s => s.id === currentSheetId);
          
          if (!sheet) {
            return (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No sheets available</h3>
                <p className="text-gray-500">Create a sheet to start adding rooms.</p>
              </div>
            );
          }
          
          const sheetRooms = sheet.rooms.filter(room => 
            selectedGender === 'ALL' || room.gender === selectedGender
          );
          
          return (
            <SheetLockWrapper sheet={sheet}>
              {sheetRooms.length === 0 ? (
                <div className="text-center py-12">
                  <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
                  <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sheetRooms.map((room) => (
                    <RoomCard key={room.id} room={room} />
                  ))}
                </div>
              )}
            </SheetLockWrapper>
          );
        })()}
      </main>
      
      {/* Bottom Sheet Selector - Desktop Only */}
      <div className="hidden md:block">
        <BottomSheetSelector
          sheets={sheets.map(sheet => ({
            id: sheet.id,
            name: sheet.name
          }))}
          activeSheetId={selectedSheet || (sheets.length > 0 ? sheets[0].id : '')}
          onSheetSelect={(sheetId) => setSelectedSheet(sheetId)}
          isSheetUnlocked={isSheetUnlocked}
          onSheetCreate={() => {
            // This could open a modal or navigate to create sheet page
            console.log('Add new sheet');
          }}
          onSheetDelete={(sheetId: string) => {
            if (sheetId !== 'all') {
              // This could show a confirmation dialog
              console.log('Delete sheet:', sheetId);
            }
          }}
        />
      </div>

      {/* Mobile Sheet Selector - Mobile Only */}
      <div className="md:hidden">
        <MobileSheetSelector
          sheets={sheets.map(sheet => ({
            id: sheet.id,
            name: sheet.name
          }))}
          activeSheetId={selectedSheet || (sheets.length > 0 ? sheets[0].id : null)}
          onSheetSelect={(sheetId) => setSelectedSheet(sheetId)}
          isSheetUnlocked={isSheetUnlocked}
          onSheetCreate={() => {
            console.log('Add new sheet');
          }}
        />
      </div>
      
      {/* Sheet Unlock Modal */}
      <SheetUnlockModal 
        onUnlock={(sheetId) => {
          console.log(`Sheet ${sheetId} unlocked successfully`);
        }}
      />
    </div>
  );
}

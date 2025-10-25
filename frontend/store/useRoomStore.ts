import { create } from 'zustand';
import { Room, Sheet, RoomMember } from '../lib/api';

interface RoomStore {
  // State
  sheets: Sheet[];
  rooms: Room[];
  selectedGender: 'ALL' | 'MALE' | 'FEMALE' | 'MIXED';
  selectedSheet: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSheets: (sheets: Sheet[]) => void;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  updateRoom: (room: Room) => void;
  removeRoom: (roomId: string) => void;
  addSheet: (sheet: Sheet) => void;
  removeSheet: (sheetId: string) => void;
  setSelectedGender: (gender: 'ALL' | 'MALE' | 'FEMALE' | 'MIXED') => void;
  setSelectedSheet: (sheetId: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Real-time updates
  handleRoomCreated: (room: Room) => void;
  handleRoomUpdated: (room: Room) => void;
  handleRoomDeleted: (roomId: string) => void;
  handleMemberJoined: (roomId: string, member: RoomMember) => void;
  handleMemberLeft: (roomId: string, memberId: string) => void;
  handleSheetCreated: (sheet: Sheet) => void;
  handleSheetDeleted: (sheetId: string) => void;
}

export const useRoomStore = create<RoomStore>((set, get) => ({
  // Initial state
  sheets: [],
  rooms: [],
  selectedGender: 'ALL',
  selectedSheet: null,
  isLoading: false,
  error: null,

  // Basic setters
  setSheets: (sheets) => set({ sheets }),
  setRooms: (rooms) => set({ rooms }),
  setSelectedGender: (selectedGender) => set({ selectedGender }),
  setSelectedSheet: (selectedSheet) => set({ selectedSheet }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  // Room management
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  updateRoom: (updatedRoom) => set((state) => ({
    rooms: state.rooms.map((room) => 
      room.id === updatedRoom.id ? updatedRoom : room
    ),
  })),
  removeRoom: (roomId) => set((state) => ({
    rooms: state.rooms.filter((room) => room.id !== roomId),
  })),

  // Sheet management
  addSheet: (sheet) => set((state) => ({ sheets: [...state.sheets, sheet] })),
  removeSheet: (sheetId) => set((state) => ({
    sheets: state.sheets.filter((sheet) => sheet.id !== sheetId),
  })),

  // Real-time event handlers
  handleRoomCreated: (room) => {
    const { addRoom, sheets, setSheets } = get();
    addRoom(room);
    
    // Update sheet if it exists
    if (room.sheet) {
      const updatedSheets = sheets.map((sheet) =>
        sheet.id === room.sheetId
          ? { ...sheet, rooms: [...sheet.rooms, room] }
          : sheet
      );
      setSheets(updatedSheets);
    }
  },

  handleRoomUpdated: (updatedRoom) => {
    const { updateRoom, sheets, setSheets } = get();
    updateRoom(updatedRoom);
    
    // Update sheet rooms
    const updatedSheets = sheets.map((sheet) =>
      sheet.id === updatedRoom.sheetId
        ? {
            ...sheet,
            rooms: sheet.rooms.map((room) =>
              room.id === updatedRoom.id ? updatedRoom : room
            ),
          }
        : sheet
    );
    setSheets(updatedSheets);
  },

  handleRoomDeleted: (roomId) => {
    const { removeRoom, sheets, setSheets } = get();
    removeRoom(roomId);
    
    // Remove from sheets
    const updatedSheets = sheets.map((sheet) => ({
      ...sheet,
      rooms: sheet.rooms.filter((room) => room.id !== roomId),
    }));
    setSheets(updatedSheets);
  },

  handleMemberJoined: (roomId, member) => {
    const { rooms, updateRoom } = get();
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      const updatedRoom = {
        ...room,
        members: [...room.members, member],
      };
      updateRoom(updatedRoom);
    }
  },

  handleMemberLeft: (roomId, memberId) => {
    const { rooms, updateRoom } = get();
    const room = rooms.find((r) => r.id === roomId);
    if (room) {
      const updatedRoom = {
        ...room,
        members: room.members.filter((m) => m.id !== memberId),
      };
      updateRoom(updatedRoom);
    }
  },

  handleSheetCreated: (sheet) => {
    get().addSheet(sheet);
  },

  handleSheetDeleted: (sheetId) => {
    get().removeSheet(sheetId);
  },
}));
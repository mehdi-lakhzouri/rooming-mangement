import { create } from 'zustand';

interface SheetAccessStore {
  // State
  unlockedSheets: Set<string>; // Sheet IDs that are unlocked in this session
  isModalOpen: boolean;
  targetSheetId: string | null;
  isValidating: boolean;
  validationError: string | null;
  activeSheetId: string | null; // Track the currently active sheet

  // Actions
  unlockSheet: (sheetId: string) => void;
  lockSheet: (sheetId: string) => void;
  isSheetUnlocked: (sheetId: string) => boolean;
  showUnlockModal: (sheetId: string) => void;
  hideUnlockModal: () => void;
  setValidating: (isValidating: boolean) => void;
  setValidationError: (error: string | null) => void;
  setActiveSheet: (sheetId: string | null) => void;
  lockAllExcept: (activeSheetId: string | null) => void;
  clearSession: () => void;
}

export const useSheetAccessStore = create<SheetAccessStore>((set, get) => ({
  // Initial state
  unlockedSheets: new Set<string>(),
  isModalOpen: false,
  targetSheetId: null,
  isValidating: false,
  validationError: null,
  activeSheetId: null,

  // Actions
  unlockSheet: (sheetId: string) => set((state) => ({
    unlockedSheets: new Set([...state.unlockedSheets, sheetId]),
    isModalOpen: false,
    targetSheetId: null,
    validationError: null,
  })),

  lockSheet: (sheetId: string) => set((state) => {
    const newUnlockedSheets = new Set(state.unlockedSheets);
    newUnlockedSheets.delete(sheetId);
    return { unlockedSheets: newUnlockedSheets };
  }),

  isSheetUnlocked: (sheetId: string) => {
    return get().unlockedSheets.has(sheetId);
  },

  showUnlockModal: (sheetId: string) => set({
    isModalOpen: true,
    targetSheetId: sheetId,
    validationError: null,
  }),

  hideUnlockModal: () => set({
    isModalOpen: false,
    targetSheetId: null,
    validationError: null,
    isValidating: false,
  }),

  setValidating: (isValidating: boolean) => set({ isValidating }),

  setValidationError: (validationError: string | null) => set({ validationError }),

  setActiveSheet: (sheetId: string | null) => set((state) => {
    // When setting a new active sheet, lock all other sheets except the new one
    if (sheetId !== state.activeSheetId) {
      const newUnlockedSheets = new Set<string>();
      // Keep the new active sheet unlocked if it was previously unlocked
      if (sheetId && state.unlockedSheets.has(sheetId)) {
        newUnlockedSheets.add(sheetId);
      }
      
      return {
        activeSheetId: sheetId,
        unlockedSheets: newUnlockedSheets,
      };
    }
    
    return { activeSheetId: sheetId };
  }),

  lockAllExcept: (activeSheetId: string | null) => set((state) => {
    const newUnlockedSheets = new Set<string>();
    // Only keep the active sheet unlocked if it was previously unlocked
    if (activeSheetId && state.unlockedSheets.has(activeSheetId)) {
      newUnlockedSheets.add(activeSheetId);
    }
    
    return { unlockedSheets: newUnlockedSheets };
  }),

  clearSession: () => set({
    unlockedSheets: new Set<string>(),
    isModalOpen: false,
    targetSheetId: null,
    isValidating: false,
    validationError: null,
    activeSheetId: null,
  }),
}));
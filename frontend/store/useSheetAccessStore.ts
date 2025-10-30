import { create } from 'zustand';

interface SheetAccessStore {
  // State
  unlockedSheets: Set<string>; // Sheet IDs that are unlocked in this session
  isModalOpen: boolean;
  targetSheetId: string | null;
  isValidating: boolean;
  validationError: string | null;

  // Actions
  unlockSheet: (sheetId: string) => void;
  lockSheet: (sheetId: string) => void;
  isSheetUnlocked: (sheetId: string) => boolean;
  showUnlockModal: (sheetId: string) => void;
  hideUnlockModal: () => void;
  setValidating: (isValidating: boolean) => void;
  setValidationError: (error: string | null) => void;
  clearSession: () => void;
}

export const useSheetAccessStore = create<SheetAccessStore>((set, get) => ({
  // Initial state
  unlockedSheets: new Set<string>(),
  isModalOpen: false,
  targetSheetId: null,
  isValidating: false,
  validationError: null,

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

  clearSession: () => set({
    unlockedSheets: new Set<string>(),
    isModalOpen: false,
    targetSheetId: null,
    isValidating: false,
    validationError: null,
  }),
}));
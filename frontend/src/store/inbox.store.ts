import { create } from 'zustand';

interface InboxState {
  items: string[];
  addItem: (item: string) => void;
}

export const useInboxStore = create<InboxState>((set) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [item, ...state.items] })),
}));

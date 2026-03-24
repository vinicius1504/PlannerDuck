import { create } from "zustand";
import { DocumentTreeItem } from "../types";

interface DocumentsState {
  tree: DocumentTreeItem[];
  setTree: (tree: DocumentTreeItem[]) => void;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
}

export const useDocumentsStore = create<DocumentsState>((set) => ({
  tree: [],
  setTree: (tree) => set({ tree }),
  expandedIds: new Set<string>(),
  toggleExpanded: (id) =>
    set((state) => {
      const next = new Set(state.expandedIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { expandedIds: next };
    }),
}));

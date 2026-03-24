import { create } from "zustand";
import { BoardWithColumns, CardWithLabels, ColumnWithCards } from "../types";

interface BoardState {
  board: BoardWithColumns | null;
  setBoard: (board: BoardWithColumns) => void;
  moveCardOptimistic: (
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    newPosition: number
  ) => void;
  reorderColumnOptimistic: (fromIndex: number, toIndex: number) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  board: null,
  setBoard: (board) => set({ board }),

  moveCardOptimistic: (cardId, fromColumnId, toColumnId, newPosition) =>
    set((state) => {
      if (!state.board) return state;

      const columns = state.board.columns.map((col) => ({ ...col, cards: [...col.cards] }));
      const fromCol = columns.find((c) => c.id === fromColumnId);
      const toCol = columns.find((c) => c.id === toColumnId);
      if (!fromCol || !toCol) return state;

      const cardIndex = fromCol.cards.findIndex((c) => c.id === cardId);
      if (cardIndex === -1) return state;

      const [card] = fromCol.cards.splice(cardIndex, 1);
      toCol.cards.splice(newPosition, 0, { ...card, columnId: toColumnId });

      // Reindex positions
      fromCol.cards.forEach((c, i) => (c.position = i));
      toCol.cards.forEach((c, i) => (c.position = i));

      return { board: { ...state.board, columns } };
    }),

  reorderColumnOptimistic: (fromIndex, toIndex) =>
    set((state) => {
      if (!state.board) return state;

      const columns = [...state.board.columns];
      const [moved] = columns.splice(fromIndex, 1);
      columns.splice(toIndex, 0, moved);
      columns.forEach((c, i) => (c.position = i));

      return { board: { ...state.board, columns } };
    }),
}));

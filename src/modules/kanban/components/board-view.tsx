"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { Label as LabelModel } from "@prisma/client";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BoardWithColumns, CardWithLabels } from "../types";
import { useBoardStore } from "../hooks/use-board";
import { BoardColumn } from "./board-column";
import { BoardCard } from "./board-card";
import { CardDetailDialog } from "./card-detail-dialog";
import { moveCard, createColumn } from "../actions";
import { toast } from "sonner";

interface BoardViewProps {
  board: BoardWithColumns;
  labels: LabelModel[];
}

export function BoardView({ board: initialBoard, labels }: BoardViewProps) {
  const { board, setBoard, moveCardOptimistic } = useBoardStore();
  const [activeCard, setActiveCard] = useState<CardWithLabels | null>(null);
  const [selectedCard, setSelectedCard] = useState<CardWithLabels | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showNewColumn, setShowNewColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");

  useEffect(() => {
    setBoard(initialBoard);
  }, [initialBoard, setBoard]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === "card") {
      setActiveCard(active.data.current.card);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !board) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (activeData?.type !== "card") return;

    const activeCardData = activeData.card as CardWithLabels;
    let toColumnId: string;
    let toPosition: number;

    if (overData?.type === "column") {
      toColumnId = over.id as string;
      const col = board.columns.find((c) => c.id === toColumnId);
      toPosition = col?.cards.length ?? 0;
    } else if (overData?.type === "card") {
      const overCard = overData.card as CardWithLabels;
      toColumnId = overCard.columnId;
      const col = board.columns.find((c) => c.id === toColumnId);
      toPosition = col?.cards.findIndex((c) => c.id === overCard.id) ?? 0;
    } else {
      return;
    }

    if (activeCardData.columnId !== toColumnId) {
      moveCardOptimistic(
        activeCardData.id,
        activeCardData.columnId,
        toColumnId,
        toPosition
      );
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over || !board) return;

    const activeData = active.data.current;
    if (activeData?.type !== "card") return;

    const cardId = active.id as string;
    const overData = over.data.current;

    let toColumnId: string;
    let toPosition: number;

    if (overData?.type === "column") {
      toColumnId = over.id as string;
      const col = board.columns.find((c) => c.id === toColumnId);
      toPosition = col?.cards.findIndex((c) => c.id === cardId) ?? 0;
    } else if (overData?.type === "card") {
      const overCard = overData.card as CardWithLabels;
      toColumnId = overCard.columnId;
      const col = board.columns.find((c) => c.id === toColumnId);
      toPosition = col?.cards.findIndex((c) => c.id === cardId) ?? 0;
    } else {
      return;
    }

    try {
      await moveCard(cardId, { columnId: toColumnId, position: toPosition });
    } catch {
      toast.error("Failed to move card");
    }
  };

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (!board) return;
      for (const col of board.columns) {
        const card = col.cards.find((c) => c.id === cardId);
        if (card) {
          setSelectedCard(card);
          setShowDetail(true);
          break;
        }
      }
    },
    [board]
  );

  const handleAddColumn = async () => {
    if (!newColumnTitle.trim() || !board) return;
    try {
      await createColumn(board.id, { title: newColumnTitle.trim() });
      setNewColumnTitle("");
      setShowNewColumn(false);
    } catch {
      toast.error("Failed to create column");
    }
  };

  if (!board) return null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="flex gap-4 p-4">
            {board.columns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                onCardClick={handleCardClick}
              />
            ))}

            {showNewColumn ? (
              <div className="w-72 shrink-0 space-y-2 rounded-lg border p-3">
                <Input
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddColumn();
                    if (e.key === "Escape") setShowNewColumn(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAddColumn}>
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewColumn(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                className="h-10 w-72 shrink-0"
                onClick={() => setShowNewColumn(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add column
              </Button>
            )}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        <DragOverlay>
          {activeCard && (
            <BoardCard card={activeCard} onClick={() => {}} />
          )}
        </DragOverlay>
      </DndContext>

      <CardDetailDialog
        card={selectedCard}
        labels={labels}
        open={showDetail}
        onOpenChange={(open) => {
          setShowDetail(open);
          if (!open) setSelectedCard(null);
        }}
      />
    </>
  );
}

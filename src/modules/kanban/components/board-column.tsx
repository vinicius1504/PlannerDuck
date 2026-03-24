"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ColumnWithCards } from "../types";
import { BoardCard } from "./board-card";
import { NewCardForm } from "./new-card-form";
import { deleteColumn } from "../actions";
import { toast } from "sonner";

interface BoardColumnProps {
  column: ColumnWithCards;
  onCardClick: (cardId: string) => void;
}

export function BoardColumn({ column, onCardClick }: BoardColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  const handleDelete = async () => {
    try {
      await deleteColumn(column.id);
      toast.success("Column deleted");
    } catch {
      toast.error("Failed to delete column");
    }
  };

  return (
    <div className="bg-muted/50 flex h-full w-72 shrink-0 flex-col rounded-lg border">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          {column.color && (
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: column.color }}
            />
          )}
          <h3 className="text-sm font-semibold">{column.title}</h3>
          <span className="text-muted-foreground text-xs">
            {column.cards.length}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div ref={setNodeRef} className="space-y-2">
          <SortableContext
            items={column.cards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
          >
            {column.cards.map((card) => (
              <BoardCard
                key={card.id}
                card={card}
                onClick={() => onCardClick(card.id)}
              />
            ))}
          </SortableContext>
        </div>
      </ScrollArea>

      <div className="border-t p-2">
        <NewCardForm columnId={column.id} />
      </div>
    </div>
  );
}

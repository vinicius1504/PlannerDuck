import { useState } from "react";
import { DragEndEvent, DragOverEvent, DragStartEvent } from "@dnd-kit/core";
import { CardWithLabels } from "../types";

export function useDragAndDrop() {
  const [activeCard, setActiveCard] = useState<CardWithLabels | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === "card") {
      setActiveCard(event.active.data.current.card);
    }
  };

  const handleDragEnd = () => {
    setActiveCard(null);
  };

  return {
    activeCard,
    handleDragStart,
    handleDragEnd,
  };
}

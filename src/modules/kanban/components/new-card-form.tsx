"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCard } from "../actions";
import { toast } from "sonner";

interface NewCardFormProps {
  columnId: string;
}

export function NewCardForm({ columnId }: NewCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await createCard(columnId, { title: title.trim() });
      setTitle("");
      setIsOpen(false);
    } catch {
      toast.error("Failed to create card");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        className="w-full justify-start text-muted-foreground"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="mr-1 h-4 w-4" />
        Add card
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Card title..."
        autoFocus
        disabled={loading}
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading || !title.trim()}>
          Add
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsOpen(false);
            setTitle("");
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}

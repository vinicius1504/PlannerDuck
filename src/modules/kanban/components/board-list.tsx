"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Kanban, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { createBoard, deleteBoard } from "../actions";
import { DEFAULT_BOARD_COLORS } from "@/lib/constants";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BoardItem {
  id: string;
  title: string;
  description: string | null;
  color: string;
  createdAt: Date;
  _count: { columns: number };
}

interface BoardListProps {
  boards: BoardItem[];
}

export function BoardList({ boards }: BoardListProps) {
  const router = useRouter();
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState<string>(DEFAULT_BOARD_COLORS[0]);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      const board = await createBoard({
        title: title.trim(),
        description: description.trim() || undefined,
        color,
      });
      toast.success("Board created");
      setShowNew(false);
      setTitle("");
      setDescription("");
      router.push(`/kanban/${board.id}`);
    } catch {
      toast.error("Failed to create board");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBoard(deleteId);
      toast.success("Board deleted");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete board");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Kanban Boards</h1>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Board
        </Button>
      </div>

      {boards.length === 0 ? (
        <EmptyState
          icon={Kanban}
          title="No boards yet"
          description="Create your first Kanban board to start organizing tasks."
          actionLabel="Create board"
          onAction={() => setShowNew(true)}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Card
              key={board.id}
              className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => router.push(`/kanban/${board.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: board.color }}
                    />
                    <CardTitle className="text-base">{board.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(board.id);
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                {board.description && (
                  <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
                    {board.description}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  {board._count.columns} columns
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* New Board Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Board</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Board title"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2">
                {DEFAULT_BOARD_COLORS.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "h-8 w-8 rounded-full transition-transform",
                      color === c && "scale-110 ring-2 ring-offset-2"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete board"
        description="This will permanently delete this board and all its columns and cards."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}

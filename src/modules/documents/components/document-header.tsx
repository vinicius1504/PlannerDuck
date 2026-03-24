"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useDocumentAutoSave } from "../hooks/use-document-editor";
import { deleteDocument } from "../actions";
import { toast } from "sonner";

interface DocumentHeaderProps {
  documentId: string;
  title: string;
  icon: string | null;
}

export function DocumentHeader({
  documentId,
  title,
  icon,
}: DocumentHeaderProps) {
  const router = useRouter();
  const { saveTitle } = useDocumentAutoSave(documentId);
  const [currentTitle, setCurrentTitle] = useState(title);
  const [showDelete, setShowDelete] = useState(false);

  const handleTitleChange = (value: string) => {
    setCurrentTitle(value);
    saveTitle(value);
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(documentId);
      toast.success("Document deleted");
      router.push("/documents");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 border-b px-6 py-3">
        <span className="text-2xl">{icon || "📄"}</span>
        <Input
          value={currentTitle}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="border-none text-xl font-bold shadow-none focus-visible:ring-0"
          placeholder="Untitled"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => setShowDelete(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        title="Delete document"
        description="This will permanently delete this document and all its sub-pages."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
}

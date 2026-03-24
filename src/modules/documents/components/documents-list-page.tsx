"use client";

import { useState } from "react";
import { FileText, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { DocumentSidebar } from "./document-sidebar";
import { NewDocumentDialog } from "./new-document-dialog";
import { DocumentTreeItem } from "../types";

interface DocumentsListPageProps {
  tree: DocumentTreeItem[];
}

export function DocumentsListPage({ tree }: DocumentsListPageProps) {
  const [showNew, setShowNew] = useState(false);

  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r p-3">
        <DocumentSidebar tree={tree} />
      </div>
      <div className="flex flex-1 items-center justify-center">
        {tree.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No documents yet"
            description="Create your first document to get started."
            actionLabel="Create document"
            onAction={() => setShowNew(true)}
          />
        ) : (
          <div className="text-center">
            <FileText className="text-muted-foreground mx-auto mb-3 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Select a document from the sidebar or
            </p>
            <Button
              variant="link"
              className="mt-1"
              onClick={() => setShowNew(true)}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create new document
            </Button>
          </div>
        )}
      </div>
      <NewDocumentDialog open={showNew} onOpenChange={setShowNew} />
    </div>
  );
}

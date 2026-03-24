"use client";

import { Document } from "@prisma/client";
import { DocumentSidebar } from "./document-sidebar";
import { DocumentHeader } from "./document-header";
import { DocumentEditor } from "./document-editor";
import { DocumentTreeItem } from "../types";

interface DocumentEditPageProps {
  document: Document & {
    children: { id: string; title: string; icon: string | null }[];
  };
  tree: DocumentTreeItem[];
}

export function DocumentEditPage({ document, tree }: DocumentEditPageProps) {
  return (
    <div className="flex h-full">
      <div className="w-64 shrink-0 border-r p-3">
        <DocumentSidebar tree={tree} activeId={document.id} />
      </div>
      <div className="flex-1">
        <DocumentHeader
          documentId={document.id}
          title={document.title}
          icon={document.icon}
        />
        <div className="mx-auto max-w-4xl px-6 py-4">
          <DocumentEditor
            documentId={document.id}
            initialContent={document.content}
          />
        </div>
      </div>
    </div>
  );
}

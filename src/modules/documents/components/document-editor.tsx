"use client";

import dynamic from "next/dynamic";
import { useDocumentAutoSave } from "../hooks/use-document-editor";

const BlockNoteEditor = dynamic(() => import("./blocknote-wrapper"), {
  ssr: false,
  loading: () => (
    <div className="flex h-96 items-center justify-center">
      <p className="text-muted-foreground text-sm">Loading editor...</p>
    </div>
  ),
});

interface DocumentEditorProps {
  documentId: string;
  initialContent: unknown;
}

export function DocumentEditor({
  documentId,
  initialContent,
}: DocumentEditorProps) {
  const { saveContent } = useDocumentAutoSave(documentId);

  return (
    <div className="min-h-[500px]">
      <BlockNoteEditor
        initialContent={initialContent}
        onChange={saveContent}
      />
    </div>
  );
}

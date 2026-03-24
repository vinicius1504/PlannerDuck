import { useCallback, useRef } from "react";
import { updateDocument } from "../actions";

export function useDocumentAutoSave(documentId: string) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveContent = useCallback(
    (content: unknown) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        await updateDocument(documentId, { content });
      }, 1000);
    },
    [documentId]
  );

  const saveTitle = useCallback(
    (title: string) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      timeoutRef.current = setTimeout(async () => {
        await updateDocument(documentId, { title });
      }, 500);
    },
    [documentId]
  );

  return { saveContent, saveTitle };
}

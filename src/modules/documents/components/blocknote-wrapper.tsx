"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/shadcn";
import { Block } from "@blocknote/core";
import { useTheme } from "@/providers/theme-provider";

interface BlockNoteWrapperProps {
  initialContent: unknown;
  onChange: (content: unknown) => void;
}

export default function BlockNoteWrapper({
  initialContent,
  onChange,
}: BlockNoteWrapperProps) {
  const { theme } = useTheme();

  const resolvedTheme =
    theme === "system"
      ? typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;

  const editor = useCreateBlockNote({
    initialContent: (initialContent as Block[]) || undefined,
  });

  return (
    <BlockNoteView
      editor={editor}
      onChange={() => {
        onChange(editor.document);
      }}
      theme={resolvedTheme}
    />
  );
}

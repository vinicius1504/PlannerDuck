"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDocumentsStore } from "../hooks/use-documents";
import { createDocument } from "../actions";
import { DocumentTreeItem } from "../types";
import { toast } from "sonner";

interface DocumentSidebarProps {
  tree: DocumentTreeItem[];
  activeId?: string;
}

export function DocumentSidebar({ tree, activeId }: DocumentSidebarProps) {
  const { setTree, expandedIds, toggleExpanded } = useDocumentsStore();

  useEffect(() => {
    setTree(tree);
  }, [tree, setTree]);

  const handleCreate = async (parentId?: string) => {
    try {
      const doc = await createDocument({
        title: "Untitled",
        parentId: parentId ?? null,
      });
      toast.success("Document created");
      // Navigate handled by caller
      return doc;
    } catch {
      toast.error("Failed to create document");
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between px-2 py-1">
        <span className="text-muted-foreground text-xs font-medium uppercase">
          Pages
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5"
          onClick={async () => {
            const doc = await handleCreate();
            if (doc) {
              const router = useRouter as unknown as { push: (url: string) => void };
              window.location.href = `/documents/${doc.id}`;
            }
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      {tree.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          level={0}
          activeId={activeId}
          expandedIds={expandedIds}
          onToggle={toggleExpanded}
          onCreate={handleCreate}
        />
      ))}
      {tree.length === 0 && (
        <p className="text-muted-foreground px-2 py-4 text-center text-xs">
          No documents yet
        </p>
      )}
    </div>
  );
}

function TreeNode({
  item,
  level,
  activeId,
  expandedIds,
  onToggle,
  onCreate,
}: {
  item: DocumentTreeItem;
  level: number;
  activeId?: string;
  expandedIds: Set<string>;
  onToggle: (id: string) => void;
  onCreate: (parentId: string) => Promise<unknown>;
}) {
  const router = useRouter();
  const isExpanded = expandedIds.has(item.id);
  const hasChildren = item.children.length > 0;
  const isActive = item.id === activeId;

  return (
    <div>
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1 text-sm hover:bg-accent cursor-pointer",
          isActive && "bg-accent"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => router.push(`/documents/${item.id}`)}
      >
        <button
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded hover:bg-muted-foreground/20"
          onClick={(e) => {
            e.stopPropagation();
            onToggle(item.id);
          }}
        >
          {hasChildren && (
            <ChevronRight
              className={cn(
                "h-3 w-3 transition-transform",
                isExpanded && "rotate-90"
              )}
            />
          )}
        </button>
        <span className="shrink-0">{item.icon || "📄"}</span>
        <span className="truncate">{item.title}</span>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100"
          onClick={async (e) => {
            e.stopPropagation();
            const doc = await onCreate(item.id);
            if (doc) {
              onToggle(item.id);
            }
          }}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      {isExpanded &&
        item.children.map((child) => (
          <TreeNode
            key={child.id}
            item={child}
            level={level + 1}
            activeId={activeId}
            expandedIds={expandedIds}
            onToggle={onToggle}
            onCreate={onCreate}
          />
        ))}
    </div>
  );
}

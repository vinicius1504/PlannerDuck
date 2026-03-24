import { DocumentTreeItem } from "./types";

export function findDocumentInTree(
  tree: DocumentTreeItem[],
  id: string
): DocumentTreeItem | null {
  for (const item of tree) {
    if (item.id === id) return item;
    const found = findDocumentInTree(item.children, id);
    if (found) return found;
  }
  return null;
}

export function getDocumentBreadcrumb(
  tree: DocumentTreeItem[],
  id: string,
  path: DocumentTreeItem[] = []
): DocumentTreeItem[] | null {
  for (const item of tree) {
    const currentPath = [...path, item];
    if (item.id === id) return currentPath;
    const found = getDocumentBreadcrumb(item.children, id, currentPath);
    if (found) return found;
  }
  return null;
}

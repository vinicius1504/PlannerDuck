import { db } from "@/lib/db";

export async function getDocuments(userId: string, parentId?: string | null) {
  return db.document.findMany({
    where: {
      userId,
      parentId: parentId ?? null,
      isArchived: false,
    },
    orderBy: { position: "asc" },
    include: {
      children: {
        where: { isArchived: false },
        orderBy: { position: "asc" },
      },
    },
  });
}

export async function getDocumentTree(userId: string) {
  const documents = await db.document.findMany({
    where: { userId, isArchived: false },
    orderBy: { position: "asc" },
    select: {
      id: true,
      title: true,
      icon: true,
      parentId: true,
    },
  });

  type TreeItem = (typeof documents)[number] & { children: TreeItem[] };

  const map = new Map<string, TreeItem>();
  const roots: TreeItem[] = [];

  for (const doc of documents) {
    map.set(doc.id, { ...doc, children: [] });
  }

  for (const doc of documents) {
    const node = map.get(doc.id)!;
    if (doc.parentId && map.has(doc.parentId)) {
      map.get(doc.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getDocumentById(id: string, userId: string) {
  return db.document.findFirst({
    where: { id, userId },
    include: {
      children: {
        where: { isArchived: false },
        orderBy: { position: "asc" },
        select: { id: true, title: true, icon: true },
      },
    },
  });
}

export async function getRecentDocuments(userId: string, limit = 5) {
  return db.document.findMany({
    where: { userId, isArchived: false },
    orderBy: { updatedAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      icon: true,
      updatedAt: true,
    },
  });
}

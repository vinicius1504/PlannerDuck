import { Document } from "@prisma/client";

export type DocumentWithChildren = Document & {
  children: DocumentWithChildren[];
};

export type DocumentTreeItem = {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  children: DocumentTreeItem[];
};

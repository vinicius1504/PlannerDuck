"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CreateDocumentInput, UpdateDocumentInput } from "./schemas";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createDocument(input: CreateDocumentInput) {
  const userId = await getUserId();

  const maxPosition = await db.document.aggregate({
    where: { userId, parentId: input.parentId ?? null },
    _max: { position: true },
  });

  const document = await db.document.create({
    data: {
      title: input.title,
      parentId: input.parentId ?? null,
      icon: input.icon ?? "📄",
      position: (maxPosition._max.position ?? -1) + 1,
      userId,
    },
  });

  revalidatePath("/documents");
  return document;
}

export async function updateDocument(id: string, input: UpdateDocumentInput) {
  const userId = await getUserId();

  const document = await db.document.update({
    where: { id, userId },
    data: input,
  });

  revalidatePath("/documents");
  revalidatePath(`/documents/${id}`);
  return document;
}

export async function deleteDocument(id: string) {
  const userId = await getUserId();

  await db.document.delete({
    where: { id, userId },
  });

  revalidatePath("/documents");
}

export async function archiveDocument(id: string) {
  const userId = await getUserId();

  await db.document.update({
    where: { id, userId },
    data: { isArchived: true },
  });

  revalidatePath("/documents");
}

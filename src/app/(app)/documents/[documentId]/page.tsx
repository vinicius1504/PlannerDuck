import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getDocumentById, getDocumentTree } from "@/modules/documents/queries";
import { DocumentEditPage } from "@/modules/documents/components/document-edit-page";

interface Props {
  params: Promise<{ documentId: string }>;
}

export default async function DocumentPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { documentId } = await params;
  const [document, tree] = await Promise.all([
    getDocumentById(documentId, session.user.id),
    getDocumentTree(session.user.id),
  ]);

  if (!document) notFound();

  return (
    <DocumentEditPage
      document={JSON.parse(JSON.stringify(document))}
      tree={tree}
    />
  );
}

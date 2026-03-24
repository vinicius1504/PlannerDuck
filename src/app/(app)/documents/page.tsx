import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDocumentTree } from "@/modules/documents/queries";
import { DocumentsListPage } from "@/modules/documents/components/documents-list-page";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const tree = await getDocumentTree(session.user.id);

  return <DocumentsListPage tree={tree} />;
}

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getBoards } from "@/modules/kanban/queries";
import { BoardList } from "@/modules/kanban/components/board-list";

export default async function KanbanPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const boards = await getBoards(session.user.id);

  return <BoardList boards={JSON.parse(JSON.stringify(boards))} />;
}

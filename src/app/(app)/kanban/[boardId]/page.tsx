import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getBoardWithColumns, getLabels } from "@/modules/kanban/queries";
import { BoardView } from "@/modules/kanban/components/board-view";

interface Props {
  params: Promise<{ boardId: string }>;
}

export default async function BoardPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { boardId } = await params;
  const [board, labels] = await Promise.all([
    getBoardWithColumns(boardId, session.user.id),
    getLabels(session.user.id),
  ]);

  if (!board) notFound();

  return (
    <div>
      <div className="flex items-center gap-3 border-b px-6 py-3">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: board.color }}
        />
        <h1 className="text-xl font-bold">{board.title}</h1>
        {board.description && (
          <span className="text-muted-foreground text-sm">
            {board.description}
          </span>
        )}
      </div>
      <BoardView
        board={JSON.parse(JSON.stringify(board))}
        labels={JSON.parse(JSON.stringify(labels))}
      />
    </div>
  );
}

import { Board, Column, Card, Label, Priority } from "@prisma/client";

export type CardWithLabels = Card & {
  labels: { label: Label }[];
};

export type ColumnWithCards = Column & {
  cards: CardWithLabels[];
};

export type BoardWithColumns = Board & {
  columns: ColumnWithCards[];
};

export type BoardSummary = Pick<
  Board,
  "id" | "title" | "description" | "color" | "createdAt"
>;

export { Priority };

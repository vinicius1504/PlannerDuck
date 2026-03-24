import { PrismaClient, Priority, EventType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.cardLabel.deleteMany();
  await prisma.card.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.document.deleteMany();
  await prisma.label.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@plannerduck.com",
      password: hashedPassword,
    },
  });

  console.log("Created user:", user.email);

  // Create labels
  const labels = await Promise.all([
    prisma.label.create({ data: { name: "Bug", color: "#ef4444", userId: user.id } }),
    prisma.label.create({ data: { name: "Feature", color: "#3b82f6", userId: user.id } }),
    prisma.label.create({ data: { name: "Improvement", color: "#8b5cf6", userId: user.id } }),
    prisma.label.create({ data: { name: "Documentation", color: "#06b6d4", userId: user.id } }),
    prisma.label.create({ data: { name: "Urgent", color: "#f97316", userId: user.id } }),
  ]);

  console.log("Created", labels.length, "labels");

  // Create documents
  const gettingStarted = await prisma.document.create({
    data: {
      title: "Getting Started",
      icon: "🚀",
      content: [
        {
          type: "heading",
          props: { level: 1 },
          content: [{ type: "text", text: "Welcome to PlannerDuck!" }],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "PlannerDuck is your all-in-one planner with Documents, Kanban, and Calendar modules.",
            },
          ],
        },
      ],
      position: 0,
      userId: user.id,
    },
  });

  await prisma.document.create({
    data: {
      title: "Project Ideas",
      icon: "💡",
      content: [
        {
          type: "heading",
          props: { level: 2 },
          content: [{ type: "text", text: "Project Ideas" }],
        },
        {
          type: "bulletListItem",
          content: [{ type: "text", text: "Build a portfolio website" }],
        },
        {
          type: "bulletListItem",
          content: [{ type: "text", text: "Create a mobile app" }],
        },
        {
          type: "bulletListItem",
          content: [{ type: "text", text: "Learn a new framework" }],
        },
      ],
      position: 1,
      userId: user.id,
    },
  });

  // Sub-page
  await prisma.document.create({
    data: {
      title: "Setup Guide",
      icon: "📋",
      parentId: gettingStarted.id,
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Follow these steps to get started with the project." },
          ],
        },
      ],
      position: 0,
      userId: user.id,
    },
  });

  console.log("Created documents");

  // Create Kanban board
  const board = await prisma.board.create({
    data: {
      title: "Product Development",
      description: "Main development board",
      color: "#6366f1",
      userId: user.id,
    },
  });

  const todoCol = await prisma.column.create({
    data: { title: "To Do", position: 0, color: "#94a3b8", boardId: board.id },
  });
  const inProgressCol = await prisma.column.create({
    data: { title: "In Progress", position: 1, color: "#3b82f6", boardId: board.id },
  });
  const reviewCol = await prisma.column.create({
    data: { title: "Review", position: 2, color: "#eab308", boardId: board.id },
  });
  const doneCol = await prisma.column.create({
    data: { title: "Done", position: 3, color: "#22c55e", boardId: board.id },
  });

  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  // Cards
  const card1 = await prisma.card.create({
    data: {
      title: "Design landing page",
      description: "Create wireframes and mockups for the new landing page",
      priority: Priority.HIGH,
      dueDate: tomorrow,
      position: 0,
      columnId: todoCol.id,
    },
  });

  await prisma.cardLabel.create({
    data: { cardId: card1.id, labelId: labels[1].id },
  });

  const card2 = await prisma.card.create({
    data: {
      title: "Fix login bug on mobile",
      description: "Users report login form not working on iOS Safari",
      priority: Priority.URGENT,
      dueDate: now,
      position: 1,
      columnId: todoCol.id,
    },
  });

  await prisma.cardLabel.create({
    data: { cardId: card2.id, labelId: labels[0].id },
  });
  await prisma.cardLabel.create({
    data: { cardId: card2.id, labelId: labels[4].id },
  });

  await prisma.card.create({
    data: {
      title: "Implement dark mode",
      priority: Priority.MEDIUM,
      position: 0,
      columnId: inProgressCol.id,
    },
  });

  await prisma.card.create({
    data: {
      title: "Add unit tests",
      priority: Priority.LOW,
      dueDate: nextWeek,
      position: 0,
      columnId: reviewCol.id,
    },
  });

  await prisma.card.create({
    data: {
      title: "Setup CI/CD pipeline",
      priority: Priority.MEDIUM,
      isCompleted: true,
      position: 0,
      columnId: doneCol.id,
    },
  });

  console.log("Created kanban board with cards");

  // Create calendar events
  const todayAt = (hours: number, minutes = 0) => {
    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  await prisma.calendarEvent.create({
    data: {
      title: "Team Standup",
      startTime: todayAt(9),
      endTime: todayAt(9, 30),
      color: "#6366f1",
      type: EventType.EVENT,
      userId: user.id,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      title: "Sprint Planning",
      startTime: todayAt(14),
      endTime: todayAt(15, 30),
      color: "#3b82f6",
      type: EventType.EVENT,
      userId: user.id,
    },
  });

  const tomorrowAt = (hours: number, minutes = 0) => {
    const d = new Date(tomorrow);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  await prisma.calendarEvent.create({
    data: {
      title: "Design Review",
      startTime: tomorrowAt(11),
      endTime: tomorrowAt(12),
      color: "#8b5cf6",
      type: EventType.EVENT,
      userId: user.id,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      title: "Project Deadline",
      startTime: nextWeek,
      endTime: new Date(nextWeek.getTime() + 86400000),
      allDay: true,
      color: "#ef4444",
      type: EventType.DEADLINE,
      userId: user.id,
    },
  });

  await prisma.calendarEvent.create({
    data: {
      title: "Submit Report",
      description: "Monthly progress report",
      startTime: todayAt(17),
      endTime: todayAt(17, 30),
      color: "#eab308",
      type: EventType.REMINDER,
      userId: user.id,
    },
  });

  console.log("Created calendar events");
  console.log("\n✅ Seed complete!");
  console.log("Login with: demo@plannerduck.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

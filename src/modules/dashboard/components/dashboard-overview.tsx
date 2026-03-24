"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  Kanban,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PriorityBadge } from "@/modules/kanban/components/priority-badge";
import { Priority } from "@prisma/client";

interface DashboardData {
  stats: {
    documents: number;
    boards: number;
    events: number;
    completedTasks: number;
    totalTasks: number;
    overdueTasks: number;
  };
  recentDocuments: {
    id: string;
    title: string;
    icon: string | null;
    updatedAt: string;
  }[];
  upcomingEvents: {
    id: string;
    title: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    color: string;
    type: string;
  }[];
  todayTasks: {
    id: string;
    title: string;
    priority: Priority;
    isCompleted: boolean;
    dueDate: string | null;
    column: { title: string };
    labels: { label: { id: string; name: string; color: string } }[];
  }[];
}

interface DashboardOverviewProps {
  data: DashboardData;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
  const { stats, recentDocuments, upcomingEvents, todayTasks } = data;
  const inProgress = stats.totalTasks - stats.completedTasks - stats.overdueTasks;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Documents"
          value={stats.documents}
          icon={FileText}
          href="/documents"
        />
        <StatCard
          title="Boards"
          value={stats.boards}
          icon={Kanban}
          href="/kanban"
        />
        <StatCard
          title="Events"
          value={stats.events}
          icon={Calendar}
          href="/calendar"
        />
        <StatCard
          title="Tasks Done"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon={CheckCircle2}
          href="/kanban"
        />
      </div>

      {/* Task Summary */}
      {stats.totalTasks > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{inProgress > 0 ? inProgress : 0}</p>
                <p className="text-muted-foreground text-sm">In Progress</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.completedTasks}</p>
                <p className="text-muted-foreground text-sm">Completed</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{stats.overdueTasks}</p>
                <p className="text-muted-foreground text-sm">Overdue</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Documents */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            {recentDocuments.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No documents yet.{" "}
                <Link href="/documents" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {recentDocuments.map((doc) => (
                  <Link
                    key={doc.id}
                    href={`/documents/${doc.id}`}
                    className="hover:bg-accent flex items-center gap-2 rounded-md px-2 py-1.5"
                  >
                    <span>{doc.icon || "📄"}</span>
                    <span className="flex-1 truncate text-sm">{doc.title}</span>
                    <span className="text-muted-foreground text-xs">
                      {format(new Date(doc.updatedAt), "MMM d")}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No upcoming events.{" "}
                <Link href="/calendar" className="text-primary hover:underline">
                  Create one
                </Link>
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-2">
                    <div
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: event.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{event.title}</p>
                      <p className="text-muted-foreground text-xs">
                        {event.allDay
                          ? format(new Date(event.startTime), "MMM d")
                          : format(
                              new Date(event.startTime),
                              "MMM d, h:mm a"
                            )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Today&apos;s Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {todayTasks.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No tasks due today.
            </p>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 rounded-md border p-2"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${task.isCompleted ? "bg-green-500" : "bg-yellow-500"}`}
                  />
                  <span className="flex-1 text-sm">{task.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {task.column.title}
                  </Badge>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  href,
}: {
  title: string;
  value: number | string;
  icon: typeof FileText;
  href: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="text-muted-foreground h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </Link>
  );
}

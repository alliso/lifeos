import { TasksSubNav } from "@/components/layout/TasksSubNav";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col">
      <TasksSubNav />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
}

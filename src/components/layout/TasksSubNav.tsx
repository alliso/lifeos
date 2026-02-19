"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const subNavItems = [
  { href: "/tasks/backlog", label: "Backlog" },
  { href: "/tasks/board", label: "Tablero" },
  { href: "/tasks/archived", label: "Archivados" },
];

export function TasksSubNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 border-b px-6 py-2">
      {subNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            pathname === item.href
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

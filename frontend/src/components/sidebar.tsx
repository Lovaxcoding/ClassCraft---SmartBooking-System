"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Layers, 
  Wrench, 
  Users2, 
  BarChart3,
  Settings
} from "lucide-react";

const menuItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Réservations", href: "/dashboard/reservations", icon: CalendarDays },
  { label: "Salles & Matériels", href: "/dashboard/ressources", icon: Layers },
  { label: "Équipements", href: "/dashboard/equipements", icon: Wrench },
  { label: "Utilisateurs / Élèves", href: "/dashboard/utilisateurs", icon: Users2 },
  { label: "Statistiques", href: "/dashboard/stats", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-slate-200 bg-white pt-16 lg:block dark:border-slate-800 dark:bg-slate-950">
      <div className="flex h-full flex-col justify-between px-4 py-6">
        <div className="space-y-1">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Navigation principale
          </p>
          <nav className="space-y-1 pt-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group duration-150",
                    isActive
                      ? "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105",
                    isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                  )} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Option paramètres en bas */}
        <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            Réglages système
          </Link>
        </div>
      </div>
    </aside>
  );
}
// src/app/dashboard/layout.tsx
import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      {/* Composants de navigation fixes */}
      <Navbar />
      <Sidebar />

      {/* Zone de contenu décalée pour laisser la place à la Sidebar et la Navbar */}
      <div className="pt-16 lg:pl-64">
        <main className="p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
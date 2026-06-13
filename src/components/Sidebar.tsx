/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Library, LayoutGrid, History, Settings } from "lucide-react";
import { cn } from "../lib/utils";
import { View } from "../types";

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const items: { icon: any, label: View }[] = [
    { icon: Library, label: "Library" },
    { icon: LayoutGrid, label: "Workspace" },
    { icon: History, label: "History" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-surface border-r border-white/5 h-screen sticky top-0">
      <div className="p-6 mb-8">
        <div className="font-mono text-lg font-bold flex items-center gap-1.5">
          <span className="text-white">prompt.brain()</span>
          <div className="w-2 h-2 rounded-full bg-electric-blue pulse-dot" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => onViewChange(item.label)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
              currentView === item.label 
                ? "bg-electric-blue/10 text-electric-blue border border-electric-blue/20" 
                : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02] border border-transparent"
            )}
          >
            <item.icon size={20} className={cn("transition-colors", currentView === item.label && "text-electric-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]")} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-card border border-white/5 rounded-xl p-4">
          <div className="text-[10px] font-mono text-gray-600 uppercase tracking-widest mb-2">Vault Status</div>
          <div className="flex items-center gap-2 text-xs text-green-400">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 group-hover:scale-110" />
            Synchronized
          </div>
        </div>
      </div>
    </aside>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Library, LayoutGrid, History, Settings } from "lucide-react";
import { cn } from "../lib/utils";

interface NavItemProps {
  icon: any;
  label: string;
  view: string;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, active, onClick }: NavItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 group transition-all",
        active ? "text-white" : "text-gray-500 hover:text-gray-300"
      )}
    >
      <Icon size={22} className={cn("transition-all group-active:scale-90", active && "text-electric-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]")} />
      <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
    </button>
  );
}

interface BottomNavProps {
  currentView: string;
  onViewChange: (view: any) => void;
}

export function BottomNav({ currentView, onViewChange }: BottomNavProps) {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-bg/90 backdrop-blur-xl border-t border-white/5 px-6 flex items-center justify-between z-50">
      <NavItem icon={Library} label="Library" view="Library" active={currentView === "Library"} onClick={() => onViewChange("Library")} />
      <NavItem icon={LayoutGrid} label="Workspace" view="Workspace" active={currentView === "Workspace"} onClick={() => onViewChange("Workspace")} />
      <NavItem icon={History} label="History" view="History" active={currentView === "History"} onClick={() => onViewChange("History")} />
      <NavItem icon={Settings} label="Settings" view="Settings" active={currentView === "Settings"} onClick={() => onViewChange("Settings")} />
    </div>
  );
}

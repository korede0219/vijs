/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { cn } from "../lib/utils";

const TABS = ["All Prompts", "Agentic Workflows", "Data"];

interface TabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Tabs({ activeTab, setActiveTab }: TabsProps) {
  return (
    <div className="px-6 py-2 flex items-center gap-2 border-b border-white/5 overflow-x-auto no-scrollbar">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={cn(
            "relative px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap",
            activeTab === tab ? "text-white" : "text-gray-500 hover:text-gray-300"
          )}
        >
          {tab}
          {activeTab === tab && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-electric-blue"
              initial={false}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}

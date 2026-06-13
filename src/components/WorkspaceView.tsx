/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Cpu, Terminal, Zap, Shield, Activity, HardDrive } from "lucide-react";
import { cn } from "../lib/utils";

export function WorkspaceView() {
  const [load, setLoad] = useState(24);
  const [latency, setLatency] = useState(12);
  const [agentLoads, setAgentLoads] = useState([12, 0, 84]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoad(prev => Math.max(10, Math.min(95, prev + (Math.random() * 10 - 5))));
      setLatency(prev => Math.max(5, Math.min(100, Math.floor(prev + (Math.random() * 4 - 2)))));
      setAgentLoads(prev => prev.map(l => {
        if (l === 0) return 0;
        return Math.max(5, Math.min(100, Math.floor(l + (Math.random() * 10 - 5))));
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: "Active Nodes", value: "14", icon: Cpu, color: "text-blue-400" },
    { label: "System Load", value: `${load.toFixed(1)}%`, icon: Activity, color: "text-orchid-400" },
    { label: "Latency", value: `${latency}ms`, icon: Zap, color: "text-yellow-400" },
  ];

  const agents = [
    { name: "Nexus-Primary", status: "Running", load: `${agentLoads[0]}%`, type: "Logic" },
    { name: "Data-Siphon", status: "Idle", load: `${agentLoads[1]}%`, type: "IO" },
    { name: "Crypto-Guardian", status: "Processing", load: `${agentLoads[2]}%`, type: "Security" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="px-6 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Workspace</h1>
          <div className="text-xs font-mono text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            Control Plane: Online
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface border border-white/5 rounded-xl p-4">
            <stat.icon size={16} className={cn("mb-3", stat.color)} />
            <div className="text-xl font-bold text-white mb-1 transition-all">{stat.value}</div>
            <div className="text-[9px] font-mono uppercase tracking-wider text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Terminal View */}
      <div className="bg-[#0b0f11] border border-white/5 rounded-xl overflow-hidden mb-8">
        <div className="bg-surface/50 px-4 py-2 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-2">
            <Terminal size={14} className="text-gray-500" />
            <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">System Logs</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500/20" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
            <div className="w-2 h-2 rounded-full bg-green-500/20" />
          </div>
        </div>
        <div className="p-4 font-mono text-[11px] space-y-1">
          <p className="text-gray-500 tracking-tight"><span className="text-blue-500/80">root@brain:</span>~ prompt.init --vault=main</p>
          <p className="text-green-500/80 tracking-tight">✓ Connection established with Firebase instances</p>
          <p className="text-gray-400 tracking-tight">Synchronizing neural pathways...</p>
          <p className="text-orchid-400 tracking-tight">AI Agent "Nexus-Primary" active at {load.toFixed(1)}% load.</p>
          <p className="text-gray-500 tracking-tight animate-pulse">_</p>
        </div>
      </div>

      {/* Active Agents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-[0.2em] font-mono">Active Nodes</h3>
          <Activity size={16} className="text-gray-600" />
        </div>
        
        {agents.map((agent) => (
          <div key={agent.name} className="bg-card border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-bg border border-white/5 flex items-center justify-center text-gray-500">
                {agent.type === "Security" ? <Shield size={18} /> : agent.type === "IO" ? <HardDrive size={18} /> : <Cpu size={18} />}
              </div>
              <div>
                <div className="text-sm font-bold text-white mb-0.5">{agent.name}</div>
                <div className="text-[10px] font-mono text-gray-500 uppercase">{agent.type} Module</div>
              </div>
            </div>
            <div className="text-right">
              <div className={cn(
                "text-[10px] font-mono uppercase mb-1",
                agent.status === "Running" ? "text-green-400" : agent.status === "Processing" ? "text-blue-400" : "text-gray-600"
              )}>
                {agent.status}
              </div>
              <div className="w-16 h-1 bg-bg rounded-full overflow-hidden">
                <motion.div 
                  initial={false}
                  animate={{ width: agent.load }}
                  className="h-full bg-electric-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

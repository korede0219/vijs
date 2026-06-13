/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from "motion/react";
import { Clock, CheckCircle2, AlertCircle, RefreshCcw, ShieldCheck, Zap } from "lucide-react";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "../lib/firebase";
import { cn } from "../lib/utils";

export function HistoryView() {
  const historyQuery = query(
    collection(db, "history"),
    orderBy("timestamp", "desc"),
    limit(20)
  );

  const [snapshot, loading] = useCollection(historyQuery);

  const formatTime = (ts: any) => {
    if (!ts) return "Just now";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'execution': return Zap;
      case 'create': return CheckCircle2;
      case 'sync': return RefreshCcw;
      case 'security': return ShieldCheck;
      default: return AlertCircle;
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="px-6 py-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-orchid-400">
          <Clock size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">History</h1>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Audit Logs & Activity</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-[21px] top-4 bottom-0 w-[1px] bg-white/5" />

        <div className="space-y-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
               <div className="flex justify-center py-12">
                 <div className="w-6 h-6 border-2 border-white/10 border-t-orchid-400 rounded-full animate-spin" />
               </div>
            ) : snapshot?.empty ? (
              <div className="text-center py-12 text-gray-600 font-mono text-xs uppercase tracking-widest">
                No telemetry recorded
              </div>
            ) : snapshot?.docs.map((doc, index) => {
              const event = doc.data();
              const Icon = getEventIcon(event.type);
              return (
                <motion.div 
                  key={doc.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative pl-12"
                >
                  <div className={cn(
                    "absolute left-3 top-0 w-5 h-5 rounded-full border-2 border-bg flex items-center justify-center z-10",
                    event.status === 'success' ? "bg-green-500/20 text-green-500" :
                    event.status === 'warning' ? "bg-yellow-500/20 text-yellow-500" :
                    "bg-red-500/20 text-red-500"
                  )}>
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  <div className="bg-card border border-white/5 rounded-xl p-4 hover:border-white/10 transition-colors cursor-default">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={getEventColor(event.status)} />
                        <h3 className="text-sm font-bold text-white tracking-tight">{event.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono text-gray-600 uppercase">{formatTime(event.timestamp)}</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed font-mono">
                      {event.details}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import { Star, MoreVertical, Copy, Trash2, Play } from "lucide-react";
import { doc, deleteDoc } from "firebase/firestore";
import { type Prompt } from "../types";
import { cn } from "../lib/utils";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";

interface PromptCardProps {
  prompt: Prompt;
  index: number;
  onRun?: (prompt: Prompt) => void;
}

export function PromptCard({ prompt, index, onRun }: PromptCardProps) {
  const categoryColors = {
    'Tooling': 'text-orchid-400 bg-soft-orchid/10 border-soft-orchid/20',
    'Data Analysis': 'text-blue-400 bg-electric-blue/10 border-electric-blue/20',
    'Creative': 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    'Automation': 'text-orchid-400 bg-soft-orchid/10 border-soft-orchid/20',
    'DevOps': 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  };

  const isOwner = auth.currentUser?.uid === prompt.authorId;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this prompt?")) return;
    const path = `prompts/${prompt.id}`;
    try {
      await deleteDoc(doc(db, "prompts", prompt.id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(prompt.content);
    alert("Copied to clipboard!");
  };

  const formatTime = (ts: any) => {
    if (!ts) return "Just now";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      layout
      className="bg-card border border-white/5 rounded-xl p-5 group hover:border-white/10 transition-colors h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] font-mono tracking-wider uppercase border",
          categoryColors[prompt.category] || 'text-gray-400 bg-gray-500/10 border-gray-500/20'
        )}>
          {prompt.category}
        </span>
        <div className="flex items-center gap-3 text-gray-500">
          <button className="hover:text-yellow-500 transition-colors">
            <Star size={18} />
          </button>
          {isOwner && (
            <button 
              onClick={handleDelete}
              className="hover:text-red-400 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
          <button className="hover:text-white transition-colors">
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-4 tracking-tight group-hover:text-white transition-colors">
        {prompt.title}
      </h3>

      <div className="bg-bg/50 rounded-lg p-4 mb-4 border border-white/5 flex-1">
        <p className="text-gray-400 text-sm leading-relaxed line-clamp-4 whitespace-pre-wrap">
          {prompt.content}
        </p>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2 font-mono text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-electric-blue pulse-dot" />
            <span className="uppercase">{prompt.model}</span>
          </div>
          <span>•</span>
          <span>{formatTime(prompt.updatedAt)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={copyToClipboard}
            className="p-2.5 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-800 transition-all active:scale-95 shadow-sm hover:shadow-electric-blue/10"
            title="Copy Prompt"
          >
            <Copy size={16} />
          </button>
          <button 
            onClick={() => onRun?.(prompt)}
            className="p-2.5 rounded-lg bg-electric-blue/10 text-electric-blue hover:bg-electric-blue hover:text-white transition-all active:scale-95 shadow-lg shadow-electric-blue/10 border border-electric-blue/20"
            title="Run Prompt"
          >
            <Play size={16} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

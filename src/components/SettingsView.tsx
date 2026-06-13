/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { motion } from "motion/react";
import { Settings as SettingsIcon, Shield, Bell, Cpu, ExternalLink, Github, Database, Sparkles, Loader2, Key, Trash2 } from "lucide-react";
import { collection, addDoc, serverTimestamp, query, where, getDocs, deleteDoc, writeBatch } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";

const SAMPLE_PROMPTS = [
  {
    title: "The Polyglot Architect",
    category: "Tooling",
    content: "Act as a software architect. Translate this Python FastAPI logic into a highly performant Rust Axum equivalent. Prioritize zero-copy abstractions and safety. [Snippet follows...]",
    model: "Gemini 1.5 Pro"
  },
  {
    title: "Senior SRE Debugger",
    category: "DevOps",
    content: "Analyze the following Kubernetes events and logs. Identify the root cause of the crash-loopback-off. Cross-reference with the provided ConfigMap settings to check for environment variable mismatches.",
    model: "Claude 3.5 Sonnet"
  },
  {
    title: "UX Micro-copywriter",
    category: "Creative",
    content: "Generate 5 variations of error messages for a failed payment. Tone should be empathetic but technical, clearly explaining that the CVV was incorrect without using robotic jargon.",
    model: "GPT-4o"
  },
  {
    title: "React Performance Audit",
    category: "Automation",
    content: "Identify 3 potential causes of slow re-renders in this React component. Specifically look for unmemoized object literals in dependency arrays or excessive context provider updates.",
    model: "Gemini 1.5 Flash"
  },
  {
    title: "SQL Indexing Optimizer",
    category: "Data Analysis",
    content: "Assess this query execution plan. Suggest which composite indexes should be added to the users table to reduce the scan time from O(N) to O(log N) for the following filter clause.",
    model: "GPT-4o"
  }
];

export function SettingsView() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const wipeHistory = async () => {
    if (!auth.currentUser) return;
    if (!confirm("Are you sure you want to wipe all neural activity logs? This cannot be undone.")) return;

    setIsWiping(true);
    try {
      const q = query(collection(db, "history"), where("authorId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      alert("Neural cache purged.");
    } catch (error) {
      console.error("Wipe error:", error);
    } finally {
      setIsWiping(false);
    }
  };

  const seedData = async () => {
    if (!auth.currentUser) {
      alert("Please sign in first.");
      return;
    }

    setIsSeeding(true);
    const path = "prompts";
    try {
      const promises = SAMPLE_PROMPTS.map(prompt => 
        addDoc(collection(db, path), {
          ...prompt,
          authorId: auth.currentUser!.uid,
          updatedAt: serverTimestamp(),
        })
      );
      await Promise.all(promises);
      alert("Vault successfully seeded with 5 neural records.");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="px-6 py-8"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-surface border border-white/5 flex items-center justify-center text-blue-400">
          <SettingsIcon size={20} />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white focus:outline-none">Settings</h1>
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Configuration & Nodes</p>
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 px-1">AI Node Configuration</h3>
          <div className="bg-card border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key size={18} className="text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-white">OpenRouter Link</div>
                  <div className="text-[10px] text-gray-500 font-mono">Environment Status: Active</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                <span className="text-[10px] font-mono text-green-500">READY</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 px-1">Library Management</h3>
          <div className="bg-card border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            <button 
              onClick={seedData}
              disabled={isSeeding}
              className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left group disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-orchid-400/10 flex items-center justify-center text-orchid-400">
                  {isSeeding ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Seed Neural Vault</div>
                  <div className="text-[10px] text-gray-500 font-mono">Populate library with sample intelligence records</div>
                </div>
              </div>
              <div className="w-6 h-6 rounded bg-surface border border-white/5 flex items-center justify-center text-gray-600">
                <Database size={12} />
              </div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 px-1">Security</h3>
          <div className="bg-card border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            <button className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Shield size={18} className="text-gray-500 group-hover:text-orchid-400 transition-colors" />
                <div>
                  <div className="text-sm font-medium text-white">Encryption Keys</div>
                  <div className="text-[10px] text-gray-500 font-mono">Vault-standard AES-256</div>
                </div>
              </div>
              <ExternalLink size={14} className="text-gray-700" />
            </button>
            <button className="w-full p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors text-left group">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                <div>
                  <div className="text-sm font-medium text-white">Neural Alerts</div>
                  <div className="text-[10px] text-gray-500 font-mono">System event notifications</div>
                </div>
              </div>
              <div className="w-8 h-4 bg-electric-blue rounded-full relative">
                <div className="absolute right-1 top-1 w-2 h-2 bg-white rounded-full transition-all" />
              </div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 px-1">Infrastructure</h3>
          <div className="bg-card border border-white/5 rounded-xl divide-y divide-white/5 overflow-hidden">
            <div className="p-4 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <Cpu size={18} className="text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-white">Compute Region</div>
                  <div className="text-[10px] text-gray-500 font-mono">europe-west1-run.app</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-green-500 uppercase">Optimal</span>
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3 px-1">About</h3>
          <div className="bg-card border border-white/5 rounded-xl overflow-hidden p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded bg-white flex items-center justify-center text-black">
                <Github size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Synthetic Intelligence Repo</div>
                <div className="text-[10px] text-gray-500 font-mono">v1.2.4-stable</div>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-mono">
              The ultimate high-performance cognitive storage for prompts, agents, and neural workflows.
            </p>
          </div>
        </section>

        <button 
          onClick={wipeHistory}
          disabled={isWiping}
          className="w-full py-4 rounded-xl border border-red-500/20 text-red-100 font-mono text-[10px] uppercase tracking-widest hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
        >
          {isWiping ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Wipe Local Neural Cache
        </button>
      </div>
    </motion.div>
  );
}

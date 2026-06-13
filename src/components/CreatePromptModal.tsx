/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Sparkles } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth, OperationType, handleFirestoreError } from "../lib/firebase";
import { Category } from "../types";
import { cn } from "../lib/utils";

interface CreatePromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: Category[] = ["Tooling", "Data Analysis", "Creative", "Automation", "DevOps"];

export function CreatePromptModal({ isOpen, onClose }: CreatePromptModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "Tooling" as Category,
    content: "",
    model: "GPT-4o",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;

    setLoading(true);
    const path = 'prompts';
    try {
      await addDoc(collection(db, path), {
        ...formData,
        authorId: auth.currentUser.uid,
        updatedAt: serverTimestamp(),
      });
      onClose();
      setFormData({ title: "", category: "Tooling", content: "", model: "GPT-4o" });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/80 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-20 bottom-20 max-w-lg mx-auto bg-card border border-white/10 rounded-2xl p-6 z-[101] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="text-electric-blue" size={24} />
                New Prompt
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Title</label>
                <input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-bg border border-white/5 rounded-lg px-4 py-3 focus:outline-none focus:border-electric-blue/50 transition-colors"
                  placeholder="e.g., Code Refactoring Agent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setFormData({ ...formData, category: cat })}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        formData.category === cat
                          ? "bg-electric-blue border-electric-blue text-white"
                          : "bg-surface border-white/5 text-gray-500 hover:border-white/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Model</label>
                <input
                  required
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full bg-bg border border-white/5 rounded-lg px-4 py-3 focus:outline-none focus:border-electric-blue/50 transition-colors"
                  placeholder="e.g., Gemini 1.5 Pro"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-gray-500">Prompt Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full h-48 bg-bg border border-white/5 rounded-lg px-4 py-3 focus:outline-none focus:border-electric-blue/50 transition-colors font-mono text-sm leading-relaxed"
                  placeholder="Paste your prompt logic here..."
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-electric-blue hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
              >
                {loading ? "Initializing..." : "Publish to Vault"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

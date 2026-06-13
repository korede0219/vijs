/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Bot, User, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { type Prompt } from "../types";
import { cn } from "../lib/utils";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface PromptRunnerModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PromptRunnerModal({ prompt, isOpen, onClose }: PromptRunnerModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && prompt) {
      setMessages([
        { role: 'system', content: prompt.content },
        { role: 'assistant', content: `Neural link established. System primed with your directive: "${prompt.title}". How shall we proceed?` }
      ]);
    } else {
      setMessages([]);
    }
  }, [isOpen, prompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || !prompt) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: prompt.model.includes('GPT') ? 'openai/gpt-4o' : 'google/gemini-flash-1.5',
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || data.error);
      }

      const aiMsg: Message = {
        role: 'assistant',
        content: data.choices[0].message.content
      };

      setMessages(prev => [...prev, aiMsg]);

      // Log to history
      if (auth.currentUser) {
        await addDoc(collection(db, "history"), {
          type: 'execution',
          title: `Executed: ${prompt.title}`,
          details: `Neural response generated using ${prompt.model}. Link established by author: ${auth.currentUser.email}`,
          status: 'success',
          timestamp: serverTimestamp(),
          authorId: auth.currentUser.uid
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `[System Error]: Failed to route request to neural node. ${errorMsg}` 
      }]);

      if (auth.currentUser) {
        await addDoc(collection(db, "history"), {
          type: 'execution',
          title: `Failure: ${prompt.title}`,
          details: `Neural routing failed: ${errorMsg}`,
          status: 'error',
          timestamp: serverTimestamp(),
          authorId: auth.currentUser.uid
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && prompt && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-bg/80 backdrop-blur-md z-[200]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-x-4 md:inset-x-auto md:right-8 bottom-8 top-8 md:w-[500px] bg-card border border-white/10 rounded-3xl flex flex-col z-[201] shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-surface/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-electric-blue/10 flex items-center justify-center text-electric-blue">
                   <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-none mb-1">{prompt.title}</h3>
                  <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-none">{prompt.model}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/5 rounded-full text-gray-500 hover:text-white transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Chat Area */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/5"
            >
              {messages.filter(m => m.role !== 'system').map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                    msg.role === 'user' 
                      ? "bg-surface border-white/5 text-gray-400" 
                      : "bg-electric-blue/10 border-electric-blue/20 text-electric-blue"
                  )}>
                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed",
                    msg.role === 'user'
                      ? "bg-bg border border-white/5 text-gray-300"
                      : "bg-surface/50 border border-white/5 text-gray-200"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                  <div className="bg-surface/50 border border-white/5 rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-electric-blue rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-6 bg-surface/30 border-t border-white/5">
              <div className="relative">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Execute direct command..."
                  className="w-full bg-bg border border-white/5 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-electric-blue/50 transition-all pr-14"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="absolute right-2 top-2 bottom-2 aspect-square bg-electric-blue text-white rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all disabled:opacity-30 disabled:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest text-center mt-4">
                Neural link active via OpenRouter.ai
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

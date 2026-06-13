/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { collection, query, orderBy } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { Header } from "./components/Header";
import { Tabs } from "./components/Tabs";
import { BottomNav } from "./components/BottomNav";
import { PromptCard } from "./components/PromptCard";
import { CreatePromptModal } from "./components/CreatePromptModal";
import { WorkspaceView } from "./components/WorkspaceView";
import { HistoryView } from "./components/HistoryView";
import { SettingsView } from "./components/SettingsView";
import { Sidebar } from "./components/Sidebar";
import { PromptRunnerModal } from "./components/PromptRunnerModal";
import { db } from "./lib/firebase";
import { type Prompt, type View } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("All Prompts");
  const [currentView, setCurrentView] = useState<View>("Library");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  const promptsQuery = useMemo(() => query(
    collection(db, "prompts"),
    orderBy("updatedAt", "desc")
  ), []);

  const [snapshot, loading] = useCollection(promptsQuery);

  const prompts = useMemo(() => {
    return snapshot?.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Prompt[];
  }, [snapshot]);

  const filteredPrompts = useMemo(() => {
    if (!prompts) return [];
    
    return prompts.filter((prompt) => {
      const matchesTab = activeTab === "All Prompts" || prompt.category === activeTab;
      const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [prompts, activeTab, searchQuery]);

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main className="flex-1 pb-32 md:pb-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
          {currentView === "Library" ? (
            <motion.div
              key="library"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-6 py-6 pb-2">
                <p className="font-mono text-[10px] tracking-[0.2em] text-gray-500 uppercase mb-2">Vault Index</p>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-3xl font-bold tracking-tight text-white">Prompt Library</h1>
                </div>
                
                <div className="relative mb-8">
                  <input 
                    type="text"
                    placeholder="Search concepts, tools, or logic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-white/5 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-electric-blue/40 transition-all shadow-inner"
                  />
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 bg-[#adc6ff] hover:bg-[#99b7ff] text-[#002e6a] py-3.5 rounded-xl font-bold transition-all active:scale-[0.98] glow-btn mb-10 shadow-lg"
                >
                  <Plus size={20} strokeWidth={3} />
                  <span>Create New Prompt</span>
                </button>
              </div>

              <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

              <div className="px-6 py-8">
                <AnimatePresence mode="popLayout" initial={false}>
                  {loading ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 gap-4"
                    >
                      <div className="w-8 h-8 border-2 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin" />
                      <span className="font-mono text-[10px] text-gray-500 uppercase tracking-widest">Accessing Vault...</span>
                    </motion.div>
                  ) : filteredPrompts.length > 0 ? (
                    <motion.div
                      key="content"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                      {filteredPrompts.map((prompt: any, index: number) => (
                        <div key={prompt.id}>
                          <PromptCard 
                            prompt={prompt} 
                            index={index} 
                            onRun={(p) => setSelectedPrompt(p)}
                          />
                        </div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-20"
                    >
                      <p className="text-gray-500 font-mono text-sm">No encrypted records found</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : currentView === "Workspace" ? (
            <WorkspaceView key="workspace" />
          ) : currentView === "History" ? (
            <HistoryView key="history" />
          ) : currentView === "Settings" ? (
            <SettingsView key="settings" />
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center py-32 text-gray-500 font-mono text-sm uppercase tracking-widest"
            >
              System View: {currentView} Restricted
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {currentView === "Library" && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="fixed right-6 bottom-24 w-14 h-14 rounded-full bg-electric-blue text-white flex items-center justify-center shadow-lg shadow-electric-blue/40 z-50 blue-glow"
        >
          <Plus size={28} />
        </motion.button>
      )}

      <CreatePromptModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <PromptRunnerModal 
        prompt={selectedPrompt} 
        isOpen={!!selectedPrompt} 
        onClose={() => setSelectedPrompt(null)} 
      />
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
      </div>
    </div>
  );
}


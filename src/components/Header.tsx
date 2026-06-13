/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Search, History, LogIn, LogOut } from "lucide-react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, signIn } from "../lib/firebase";

export function Header() {
  const [user] = useAuthState(auth);

  return (
    <header className="px-6 py-4 flex items-center justify-between bg-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="font-mono text-lg font-bold flex items-center gap-1.5">
          <span className="text-white">prompt.brain()</span>
          <div className="w-2 h-2 rounded-full bg-electric-blue pulse-dot" />
        </div>
      </div>
      
      <div className="flex items-center gap-5 text-gray-400">
        <History size={20} className="hover:text-white cursor-pointer transition-colors" />
        <Search size={20} className="hover:text-white cursor-pointer transition-colors" />
        
        {user ? (
          <button 
            onClick={() => auth.signOut()}
            className="w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-gray-300 hover:border-electric-blue/50 transition-all overflow-hidden"
            title="Sign Out"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <LogOut size={18} />
            )}
          </button>
        ) : (
          <button 
            onClick={signIn}
            className="w-9 h-9 rounded-full bg-electric-blue/10 border border-electric-blue/20 flex items-center justify-center text-electric-blue hover:bg-electric-blue hover:text-white transition-all"
            title="Sign In"
          >
            <LogIn size={18} />
          </button>
        )}
      </div>
    </header>
  );
}

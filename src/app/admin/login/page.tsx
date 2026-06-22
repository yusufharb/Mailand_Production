"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/store/useAdminStore";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const login = useAdminStore(state => state.login);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(password);
    if (success) {
      toast.success("Welcome back!");
      router.push("/admin");
    } else {
      toast.error("Incorrect password.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-pink-50 text-center"
      >
        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="text-primary" size={32} />
        </div>
        <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-500 mb-8">Enter your secure password to continue.</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            placeholder="Enter password..."
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-center tracking-widest text-lg"
            autoFocus
          />
          <button
            type="submit"
            className="w-full bg-gray-900 text-white font-medium py-3 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Access Dashboard
          </button>
        </form>
        
        <p className="text-xs text-gray-400 mt-6">
          Secured by local session storage. Return to <Link href="/" className="text-primary hover:underline">homepage</Link>.
        </p>
      </motion.div>
    </div>
  );
}

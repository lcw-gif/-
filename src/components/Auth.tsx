import React from 'react';
import { loginWithGoogle } from '../lib/firebase';
import { toast } from 'react-hot-toast';
import { LogIn, Tv } from 'lucide-react';
import { motion } from 'motion/react';

export default function Auth() {
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      toast.success('登入成功');
    } catch (error: any) {
      toast.error(error.message || '登入失敗');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 text-center"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
          <Tv className="w-10 h-10 text-white -rotate-3" />
        </div>
        
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">校園電視台</h1>
        <p className="text-slate-500 mb-8 font-medium">早會宣佈預約系統</p>
        
        <div className="space-y-4">
          <p className="text-sm text-slate-400">請使用 Google 帳號登入系統</p>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-700 font-bold py-4 px-6 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            使用 @lstlkkc.edu.hk 登入
          </button>
        </div>
        
        <footer className="mt-12 pt-6 border-t border-slate-100 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          LSTLKKC &copy; {new Date().getFullYear()}
        </footer>
      </motion.div>
    </div>
  );
}

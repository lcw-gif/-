import React, { useState, useEffect } from 'react';
import { auth, db, logout } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { Reservation } from './types';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import BookingList from './components/BookingList';
import Auth from './components/Auth';
import { Toaster } from 'react-hot-toast';
import { LogOut, User as UserIcon, Loader2, Tv } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reservation[];
      setReservations(data);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Auth />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-none">校園電視台</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">早會宣佈預約系統</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-700">{user.displayName || '老師'}</span>
              <span className="text-[10px] text-slate-400 font-medium">{user.email}</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100"
              title="登出"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Calendar Section - Full Width on small, Left Col on Desktop */}
          <section className="lg:col-span-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                預約日曆
              </h2>
              <Calendar 
                selectedDate={selectedDate} 
                onSelectDate={setSelectedDate}
                reservations={reservations}
              />
            </motion.div>
          </section>

          {/* Form and List Section */}
          <section className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <BookingForm 
                selectedDate={selectedDate}
                reservations={reservations}
                onSuccess={() => setSelectedDate('')}
              />
            </motion.div>
          </section>

          <section className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <BookingList 
                reservations={reservations}
                selectedDate={selectedDate}
                onRefresh={() => {}}
              />
            </motion.div>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-200 mt-12 text-center text-slate-400 text-sm font-medium">
        <p>&copy; {new Date().getFullYear()} LSTLKKC 校園電視台. All rights reserved.</p>
      </footer>
    </div>
  );
}

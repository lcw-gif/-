import React, { useState } from 'react';
import { Reservation, AnnouncementType } from '../types';
import { cn } from '../lib/utils';
import { Trash2, RefreshCw, Download, Calendar as CalendarIcon } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface BookingListProps {
  reservations: Reservation[];
  selectedDate: string;
  onRefresh: () => void;
}

export default function BookingList({ reservations, selectedDate, onRefresh }: BookingListProps) {
  const [filterDate, setFilterDate] = useState('all');

  const filteredReservations = reservations
    .filter(r => filterDate === 'all' ? true : r.date === filterDate)
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除此預約嗎？')) return;
    
    try {
      await deleteDoc(doc(db, 'reservations', id));
      toast.success('預約已刪除');
      onRefresh();
    } catch (error) {
      toast.error('刪除失敗');
    }
  };

  const handleExport = () => {
    const headers = ['日期', '類型', '負責老師', '內容', '所需時間(分鐘)', '預約人'];
    const csvContent = [
      headers.join(','),
      ...filteredReservations.map(r => [
        r.date,
        r.type === AnnouncementType.Other ? r.customType : r.type,
        r.teacher,
        `"${r.content.replace(/"/g, '""')}"`,
        r.duration || 0,
        r.teacherEmail
      ].join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `預約列表_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Sync filterDate with selectedDate when component updates or when user clicks calendar
  // We can just add a button or effect, but the requirement says "press the calendar the list will auto jump to that date"
  // So we should probably listen to selectedDate
  React.useEffect(() => {
    if (selectedDate) setFilterDate(selectedDate);
  }, [selectedDate]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          預約列表
        </h2>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={onRefresh}
            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 flex items-center gap-2 text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">同步</span>
          </button>
          <button 
            onClick={handleExport}
            className="p-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors shadow-sm flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">匯出</span>
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">篩選日期</label>
          <select 
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">所有日期</option>
            {Array.from(new Set(reservations.map(r => r.date))).sort().map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-100">
                <th className="px-4 py-3 font-semibold text-slate-600">日期</th>
                <th className="px-4 py-3 font-semibold text-slate-600">類型</th>
                <th className="px-4 py-3 font-semibold text-slate-600">負責老師</th>
                <th className="px-4 py-3 font-semibold text-slate-600">時間 (分鐘)</th>
                <th className="px-4 py-3 font-semibold text-slate-600">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 italic">
                    暫無預約記錄
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-800">{res.date}</td>
                    <td className="px-4 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        res.type === AnnouncementType.Award ? "bg-yellow-100 text-yellow-700" :
                        res.type === AnnouncementType.Speech ? "bg-blue-100 text-blue-700" :
                        res.type === AnnouncementType.Announcement ? "bg-green-100 text-green-700" :
                        "bg-slate-100 text-slate-700"
                      )}>
                        {res.type === AnnouncementType.Other ? res.customType : res.type}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{res.teacher}</td>
                    <td className="px-4 py-4 text-slate-600">{res.duration ? `${res.duration} 分鐘` : '--'}</td>
                    <td className="px-4 py-4">
                      {auth.currentUser?.email === res.teacherEmail && (
                        <button 
                          onClick={() => handleDelete(res.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { getDay, parseISO } from 'date-fns';
import { AnnouncementType, DAY_LIMITS, Reservation } from '../types';
import { toast } from 'react-hot-toast';
import { db, auth } from '../lib/firebase';
import { cn } from '../lib/utils';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Send } from 'lucide-react';

interface BookingFormProps {
  selectedDate: string;
  reservations: Reservation[];
  onSuccess: () => void;
}

export default function BookingForm({ selectedDate, reservations, onSuccess }: BookingFormProps) {
  const [formData, setFormData] = useState({
    type: AnnouncementType.Announcement,
    customType: '',
    teacher: '',
    content: '',
    duration: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dayOfWeek = selectedDate ? getDay(parseISO(selectedDate)) : -1;
  const limit = DAY_LIMITS[dayOfWeek];
  const isTimeRestricted = limit !== null && limit > 0;
  
  const dailyUsedTime = reservations
    .filter(r => r.date === selectedDate)
    .reduce((acc, curr) => acc + (curr.duration || 0), 0);

  const timeLeft = limit !== null ? limit - dailyUsedTime : null;

  useEffect(() => {
    // Reset duraton if switching to non-restricted day
    if (!isTimeRestricted) {
      setFormData(prev => ({ ...prev, duration: '' }));
    }
  }, [isTimeRestricted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast.error('請先登入');
      return;
    }

    if (!selectedDate) {
      toast.error('請選擇日期');
      return;
    }

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      toast.error('週末不可預約');
      return;
    }

    const durationNum = parseInt(formData.duration) || 0;
    if (isTimeRestricted) {
      if (!formData.duration || durationNum <= 0) {
        toast.error('請輸入所需時間');
        return;
      }
      if (timeLeft !== null && durationNum > timeLeft) {
        toast.error(`超過剩餘時間 (剩餘: ${timeLeft}分鐘)`);
        return;
      }
    }

    if (formData.type === AnnouncementType.Other && !formData.customType) {
      toast.error('請說明項目類型');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'reservations'), {
        date: selectedDate,
        type: formData.type,
        customType: formData.type === AnnouncementType.Other ? formData.customType : '',
        teacher: formData.teacher,
        content: formData.content,
        duration: isTimeRestricted ? durationNum : 0,
        teacherEmail: auth.currentUser.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('預約成功');
      setFormData({
        type: AnnouncementType.Announcement,
        customType: '',
        teacher: '',
        content: '',
        duration: ''
      });
      onSuccess();
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('預約失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-6 pb-2 border-b border-slate-100">
        預約表格
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">選擇日期</label>
            <input
              type="text"
              value={selectedDate || '請在日曆選擇日期'}
              readOnly
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">剩餘時間 (分鐘)</label>
            <input
              type="text"
              value={timeLeft === null ? '不設時限' : timeLeft}
              readOnly
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">項目類型</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData(p => ({ ...p, type: e.target.value as AnnouncementType }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            required
          >
            {Object.values(AnnouncementType).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {formData.type === AnnouncementType.Other && (
          <div className="space-y-1 animate-in fade-in slide-in-from-top-1">
            <label className="text-sm font-medium text-slate-700">請說明項目類型</label>
            <input
              type="text"
              placeholder="請輸入項目類型"
              value={formData.customType}
              onChange={(e) => setFormData(p => ({ ...p, customType: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">負責老師</label>
          <input
            type="text"
            placeholder="請輸入負責老師姓名"
            value={formData.teacher}
            onChange={(e) => setFormData(p => ({ ...p, teacher: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">宣佈內容</label>
          <textarea
            placeholder="請輸入宣佈內容"
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            required
          />
        </div>

        {isTimeRestricted && (
          <div className="space-y-1 animate-in fade-in zoom-in-95">
            <label className="text-sm font-medium text-slate-700">所需時間 (分鐘)</label>
            <input
              type="number"
              min={1}
              max={timeLeft || 20}
              placeholder="請輸入所需時間 (分鐘)"
              value={formData.duration}
              onChange={(e) => setFormData(p => ({ ...p, duration: e.target.value }))}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              required
            />
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !selectedDate || (isTimeRestricted && timeLeft === 0)}
          className={cn(
            "w-full py-3 bg-blue-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.98]",
            "hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
          )}
        >
          <Send className="w-4 h-4" />
          {isSubmitting ? '提交中...' : '提交預約'}
        </button>
      </form>
    </div>
  );
}

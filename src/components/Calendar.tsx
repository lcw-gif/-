import React, { useState, useMemo } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  getDay,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { DAY_LIMITS, Reservation } from '../types';

interface CalendarProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  reservations: Reservation[];
}

export default function Calendar({ selectedDate, onSelectDate, reservations }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const getDayStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);
    const limit = DAY_LIMITS[dayOfWeek];
    
    if (limit === 0) return 'disabled';

    const dayReservations = reservations.filter(r => r.date === dateStr);
    const usedTime = dayReservations.reduce((acc, curr) => acc + (curr.duration || 0), 0);

    if (limit !== null && usedTime >= limit) return 'full';
    
    if (dayOfWeek === 2) return 'tuesday'; // 升旗日/Tue
    if (dayOfWeek === 3) return 'wednesday';
    if (dayOfWeek === 5) return 'friday';
    
    return 'available';
  };

  const getUsedTime = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayReservations = reservations.filter(r => r.date === dateStr);
    return dayReservations.reduce((acc, curr) => acc + (curr.duration || 0), 0);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 flex items-center justify-between border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-800">
          {format(currentMonth, 'yyyy年M月')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <ChevronLeft className="w-5 h-5 text-slate-600" />
          </button>
          <button 
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
          >
            <ChevronRight className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
        {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
          <div key={day} className="py-3 text-center text-sm font-medium text-slate-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day, idx) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isSelected = selectedDate === dateStr;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const status = getDayStatus(day);
          const usedTime = getUsedTime(day);
          const dayOfWeek = getDay(day);
          const limit = DAY_LIMITS[dayOfWeek];

          return (
            <button
              key={dateStr}
              onClick={() => status !== 'disabled' && onSelectDate(dateStr)}
              className={cn(
                "min-h-[100px] p-2 border-r border-b border-slate-100 flex flex-col items-start gap-1 transition-all relative text-left",
                !isCurrentMonth && "bg-slate-50/50",
                isSelected && "ring-2 ring-blue-500 z-10 bg-blue-50/30",
                status === 'disabled' && "cursor-not-allowed bg-slate-100 text-slate-300",
                status === 'available' && "hover:bg-slate-50",
                status === 'tuesday' && "bg-yellow-50/50 hover:bg-yellow-50",
                status === 'wednesday' && "bg-blue-50/50 hover:bg-blue-50",
                status === 'friday' && "bg-green-50/50 hover:bg-green-50",
                status === 'full' && "bg-red-50/50 hover:bg-red-50"
              )}
              disabled={status === 'disabled'}
            >
              <span className={cn(
                "text-sm font-semibold",
                !isCurrentMonth ? "text-slate-300" : "text-slate-600",
                isSelected && "text-blue-600"
              )}>
                {format(day, 'd')}
              </span>
              
              {isCurrentMonth && status !== 'disabled' && (
                <div className="mt-1 flex flex-col gap-1 w-full">
                  {dayOfWeek === 2 && (
                    <div className="text-[10px] leading-tight text-yellow-700 font-medium">
                      升旗日 (15分鐘)
                      <br/>
                      <span className="text-slate-500">已用: {usedTime}/{limit}分鐘</span>
                    </div>
                  )}
                  {(dayOfWeek === 3 || dayOfWeek === 5) && (
                    <div className={cn(
                      "text-[10px] leading-tight font-medium",
                      dayOfWeek === 3 ? "text-blue-700" : "text-green-700"
                    )}>
                      星期{dayOfWeek === 3 ? '三' : '五'} (20分鐘)
                      <br/>
                      <span className="text-slate-500">已用: {usedTime}/{limit}分鐘</span>
                    </div>
                  )}
                  {(dayOfWeek === 1 || dayOfWeek === 4) && (
                    <div className="text-[10px] leading-tight text-slate-500 italic">
                      不設時限
                    </div>
                  )}
                  {status === 'full' && (
                    <div className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold w-full text-center">
                      預約已滿
                    </div>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-x-6 gap-y-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded"></div>
          <span>星期二 (升旗日) - 15分鐘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 border border-blue-200 rounded"></div>
          <span>星期三 - 20分鐘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-200 rounded"></div>
          <span>星期五 - 20分鐘</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span>預約已滿</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 border border-slate-300 rounded"></div>
          <span>不可預約</span>
        </div>
      </div>
      
      <div className="p-3 bg-blue-50 text-blue-700 text-sm border-t border-blue-100">
        如有其他需要預約日子可聯絡校園電視台
      </div>
    </div>
  );
}

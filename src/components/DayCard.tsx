import { format, isToday } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Registration } from '../types';
import { ArrowDownToLine, ArrowUpToLine, Home, Edit3 } from 'lucide-react';
import { cn } from '../lib/utils';
import React from 'react';

interface DayCardProps {
  key?: React.Key;
  date: Date;
  registrations: Registration[];
  userReg: Registration | undefined;
  onEdit: () => void;
  index: number;
}

export default function DayCard({ date, registrations, userReg, onEdit, index }: DayCardProps) {
  const isCurrentDay = isToday(date);
  
  const goingDown = registrations.filter(r => r.goingDown);
  const goingUp = registrations.filter(r => r.goingUp);
  const stayingZhudong = registrations.filter(r => r.stayingZhudong);

  const hasActivity = goingDown.length > 0 || goingUp.length > 0 || stayingZhudong.length > 0;

  return (
    <div 
      className={cn(
        "col-span-7 grid grid-cols-7 border-b border-gray-200 min-h-[100px] hover:bg-[#F8F9FA]/80 transition cursor-pointer group",
        isCurrentDay ? "bg-green-50" : index % 2 === 0 ? "bg-white" : "bg-gray-50"
      )}
      onClick={onEdit}
    >
      <div className="p-4 border-r border-gray-200 flex flex-col justify-center items-center">
        <span className={cn(
          "text-2xl font-bold",
          isCurrentDay ? "text-[#1B4332]" : "text-gray-800",
          [0, 6].includes(date.getDay()) ? "text-red-600" : "" // Highlight weekends
        )}>
          {format(date, 'd')}
        </span>
        <span className={cn(
          "text-xs font-medium",
          isCurrentDay ? "text-green-700" : "text-gray-400",
          [0, 6].includes(date.getDay()) && !isCurrentDay ? "text-red-400" : ""
        )}>
          {format(date, 'EEE / eeee', { locale: zhTW }).toUpperCase()}
        </span>
        {userReg && (
          <span className="mt-1 text-[10px] text-white bg-[#1B4332] px-1.5 py-0.5 rounded shadow-sm">
            已登記
          </span>
        )}
      </div>

      <div className="col-span-2 p-3 border-r border-gray-100 flex flex-wrap gap-2 content-start group-hover:bg-gray-100/50 transition">
        {goingDown.map(r => (
          <span key={r.userId} className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded shadow-sm border border-orange-200/50">
            {r.userName}
            {r.note && <span className="ml-1 opacity-70" title={r.note}>({r.note})</span>}
          </span>
        ))}
        {goingDown.length === 0 && <span className="text-xs text-gray-400 italic">無人下山</span>}
      </div>

      <div className="col-span-2 p-3 border-r border-gray-100 flex flex-wrap gap-2 content-start group-hover:bg-gray-100/50 transition">
        {goingUp.map(r => (
          <span key={r.userId} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded shadow-sm border border-blue-200/50">
            {r.userName}
            {r.note && <span className="ml-1 opacity-70" title={r.note}>({r.note})</span>}
          </span>
        ))}
        {goingUp.length === 0 && <span className="text-xs text-gray-400 italic">無人上山</span>}
      </div>

      <div className="col-span-2 p-3 flex flex-wrap gap-2 content-start group-hover:bg-gray-100/50 transition">
        {stayingZhudong.map(r => (
          <span key={r.userId} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded shadow-sm border border-purple-200/50">
            {r.userName}
            {r.note && <span className="ml-1 opacity-70" title={r.note}>({r.note})</span>}
          </span>
        ))}
        {stayingZhudong.length === 0 && <span className="text-xs text-gray-400 italic">當日無人留宿</span>}
      </div>
    </div>
  );
}

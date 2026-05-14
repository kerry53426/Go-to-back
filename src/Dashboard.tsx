import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, ChevronLeft, ChevronRight, Calendar as CalendarIcon, User as UserIcon, Mountain } from 'lucide-react';
import { Registration } from './types';
import RegistrationModal from './components/RegistrationModal';
import DayCard from './components/DayCard';

interface DashboardProps {
  user: any;
}

export default function Dashboard({ user }: DashboardProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;

    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const startDateStr = format(start, 'yyyy-MM-dd');
    const endDateStr = format(end, 'yyyy-MM-dd');

    const q = query(
      collection(db, 'registrations'),
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Registration[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Registration);
      });
      setRegistrations(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'registrations');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentMonth, user]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => setCurrentMonth(new Date());

  const handleSignOut = () => signOut(auth);

  const openRegistration = (date: Date) => {
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans overflow-x-hidden">
      {/* Header Section */}
      <header className="bg-[#1B4332] text-white p-6 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0">
            <div className="w-8 h-8 border-4 border-[#1B4332] rotate-45"></div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">雪霸農場 | 員工上下山接駁登記</h1>
            <p className="text-sm text-[#D8E2DC] opacity-90 hidden sm:block">司機排程與宿舍管理系統</p>
          </div>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs uppercase tracking-widest opacity-70">目前月份</div>
            <div className="text-xl font-semibold">{format(currentMonth, 'yyyy年 M月', { locale: zhTW })}</div>
          </div>
          <button 
            onClick={() => openRegistration(new Date())} 
            className="bg-[#2D6A4F] px-3 sm:px-4 py-2 rounded border border-[#40916C] font-medium whitespace-nowrap hover:bg-[#1B4332] transition"
          >
            登記新行程 +
          </button>
          <button 
            onClick={handleSignOut}
            className="text-[#D8E2DC] hover:text-white transition"
            title="登出"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Sub-Header / Controls */}
      <div className="bg-white border-b border-gray-200 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-x-auto min-w-max">
        <div className="flex gap-2">
          <button 
            onClick={handlePrevMonth}
            className="px-4 py-1 hover:bg-gray-50 rounded-full text-sm font-semibold text-gray-500 whitespace-nowrap"
          >
            上個月
          </button>
          <button 
            onClick={handleToday}
            className="px-4 py-1 bg-gray-100 rounded-full text-sm font-semibold text-gray-600 border border-gray-200 whitespace-nowrap"
          >
            本月
          </button>
          <button 
            onClick={handleNextMonth}
            className="px-4 py-1 hover:bg-gray-50 rounded-full text-sm font-semibold text-gray-500 whitespace-nowrap"
          >
            下個月
          </button>
        </div>
        <div className="flex gap-4 sm:gap-8 text-sm">
          <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-orange-400"></span> 下山 (Down)</div>
          <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-blue-500"></span> 上山 (Up)</div>
          <div className="flex items-center gap-2 whitespace-nowrap"><span className="w-3 h-3 rounded-full bg-purple-500"></span> 竹東過夜 (Stay)</div>
        </div>
      </div>

      <main className="flex-1 overflow-auto">

          <div className="min-w-[768px] grid grid-cols-7 border-l border-t border-gray-200">
            {/* Column Headers */}
            <div className="col-span-7 grid grid-cols-7 bg-[#F1F3F5] text-xs font-bold uppercase tracking-wider text-gray-500 border-b border-gray-200 sticky top-0 z-10">
              <div className="p-3 border-r border-gray-200">日期 (Date)</div>
              <div className="p-3 border-r border-gray-200 col-span-2 bg-orange-50 text-orange-800">下山名單 (Departure)</div>
              <div className="p-3 border-r border-gray-200 col-span-2 bg-blue-50 text-blue-800">上山名單 (Arrival)</div>
              <div className="p-3 border-r border-gray-200 col-span-2 bg-purple-50 text-purple-800">竹東住宿 (Lodging)</div>
            </div>

            {loading ? (
              <div className="col-span-7 flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4332]"></div>
              </div>
            ) : (
              daysInMonth.map((day, index) => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayRegs = registrations.filter(r => r.date === dateStr);
                const userReg = dayRegs.find(r => r.userId === user.uid);
                
                return (
                  <DayCard 
                    key={dateStr} 
                    date={day} 
                    registrations={dayRegs} 
                    userReg={userReg}
                    onEdit={() => openRegistration(day)}
                    index={index}
                  />
                );
              })
            )}
          </div>
      </main>

      {isModalOpen && selectedDate && (
        <RegistrationModal 
          isOpen={isModalOpen}
          date={selectedDate}
          onClose={() => setIsModalOpen(false)}
          user={user}
          existingReg={registrations.find(r => r.date === format(selectedDate, 'yyyy-MM-dd') && r.userId === user.uid)}
        />
      )}
    </div>
  );
}

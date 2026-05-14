import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { X, Loader2, ArrowDownToLine, ArrowUpToLine, Home } from 'lucide-react';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Registration } from '../types';

interface RegistrationModalProps {
  isOpen: boolean;
  date: Date;
  onClose: () => void;
  user: any;
  existingReg?: Registration;
}

export default function RegistrationModal({ isOpen, date, onClose, user, existingReg }: RegistrationModalProps) {
  const [goingDown, setGoingDown] = useState(false);
  const [goingUp, setGoingUp] = useState(false);
  const [stayingZhudong, setStayingZhudong] = useState(false);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingReg) {
      setGoingDown(existingReg.goingDown);
      setGoingUp(existingReg.goingUp);
      setStayingZhudong(existingReg.stayingZhudong);
      setNote(existingReg.note || '');
    } else {
      setGoingDown(false);
      setGoingUp(false);
      setStayingZhudong(false);
      setNote('');
    }
  }, [existingReg, date]);

  if (!isOpen) return null;

  const dateStr = format(date, 'yyyy-MM-dd');
  const docId = `${dateStr}_${user.uid}`;

  const handleSave = async () => {
    setLoading(true);
    try {
      if (!goingDown && !goingUp && !stayingZhudong && !note) {
        // If entirely empty and we have an existing reg, we could delete it to save space
        if (existingReg) {
          await deleteDoc(doc(db, 'registrations', existingReg.id!));
        }
      } else {
        const payload: Registration = {
          userId: user.uid,
          userName: user.displayName || '未命名用戶',
          date: dateStr,
          goingDown,
          goingUp,
          stayingZhudong,
          timestamp: Date.now(),
        };
        if (note.trim()) {
          payload.note = note.trim();
        }
        await setDoc(doc(db, 'registrations', docId), payload);
      }
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `registrations/${docId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReg) return onClose();
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'registrations', existingReg.id!));
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `registrations/${docId}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm sm:p-0 transition-opacity">
      <div 
        className="fixed inset-0"
        onClick={() => !loading && onClose()}
      ></div>
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              行程登記
            </h3>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              {format(date, 'yyyy 年 MM 月 dd 日 (eee)', { locale: zhTW })}
            </p>
          </div>
          <button 
            onClick={onClose}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              您當天的行程
            </label>
            
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <ArrowDownToLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">我需要下山</div>
                  <div className="text-xs text-gray-500">從農場出發往竹東</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                checked={goingDown}
                onChange={(e) => setGoingDown(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-orange-50 hover:border-orange-200 transition">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                  <ArrowUpToLine className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">我需要上山</div>
                  <div className="text-xs text-gray-500">從竹東出發往農場</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                checked={goingUp}
                onChange={(e) => setGoingUp(e.target.checked)}
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-purple-50 hover:border-purple-200 transition">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">竹東過夜</div>
                  <div className="text-xs text-gray-500">需要安排竹東住宿</div>
                </div>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                checked={stayingZhudong}
                onChange={(e) => setStayingZhudong(e.target.checked)}
              />
            </label>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              備註事項 (選填)
            </label>
            <input
              type="text"
              placeholder="例如：提早下山、有同行者..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition outline-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          {existingReg && (
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-3 text-red-600 font-medium hover:bg-red-50 rounded-xl transition"
            >
              清除行程
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-5 h-5 animate-spin" />}
            儲存登記
          </button>
        </div>
      </div>
    </div>
  );
}

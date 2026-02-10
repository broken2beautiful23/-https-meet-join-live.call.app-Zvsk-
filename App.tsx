
import React, { useState, useCallback, useEffect } from 'react';
import Lobby from './components/Lobby';
import MeetingRoom from './components/MeetingRoom';
import EndScreen from './components/EndScreen';
import SignIn from './components/SignIn';
import AdminDashboard from './components/AdminDashboard';
import { MeetingStatus } from './types';

export const HOSTS = [
  { name: "James Wilson", seed: "james" },
  { name: "Sarah Jenkins", seed: "sarah" },
  { name: "Michael Thompson", seed: "michael" },
  { name: "Emily Rodriguez", seed: "emily" },
  { name: "David Chen", seed: "david" },
  { name: "Jessica Miller", seed: "jessica" },
  { name: "Robert Taylor", seed: "robert" }
];

const App: React.FC = () => {
  const [status, setStatus] = useState<MeetingStatus>(MeetingStatus.LOBBY);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [userName, setUserName] = useState('Guest User');
  const [hostIndex, setHostIndex] = useState(() => Math.floor(Math.random() * HOSTS.length));
  
  const currentHost = HOSTS[hostIndex];

  // URL Hash tracking: #admin triggers login
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        setStatus(MeetingStatus.ADMIN_LOGIN);
      } else if (window.location.hash === '') {
        // If user manually clears hash, go back to lobby unless they are logged in
        if (status === MeetingStatus.ADMIN_LOGIN || status === MeetingStatus.ADMIN_DASHBOARD) {
           setStatus(MeetingStatus.LOBBY);
        }
      }
    };
    
    window.addEventListener('hashchange', checkHash);
    checkHash(); // Run on initial load
    
    return () => window.removeEventListener('hashchange', checkHash);
  }, [status]);

  const handleStartJoin = useCallback(() => {
    setStatus(MeetingStatus.SIGNING_IN);
  }, []);

  const handleSignInComplete = useCallback((name: string) => {
    setUserName(name || 'Guest User');
    setStatus(MeetingStatus.JOINED);
  }, []);

  const handleCancelSignIn = useCallback(() => {
    setStatus(MeetingStatus.LOBBY);
  }, []);

  const handleLeave = useCallback(() => {
    setStatus(MeetingStatus.ENDED);
  }, []);

  const toggleMic = () => setIsMicOn(prev => !prev);
  const toggleCamera = () => setIsCameraOn(prev => !prev);

  const cycleHost = useCallback(() => {
    setHostIndex(prev => (prev + 1) % HOSTS.length);
  }, []);

  return (
    <div className="h-screen w-full flex flex-col bg-[#111] overflow-hidden">
      {status === MeetingStatus.LOBBY && (
        <Lobby 
          onJoin={handleStartJoin} 
          isMicOn={isMicOn} 
          isCameraOn={isCameraOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          currentHost={currentHost}
          onCycleHost={cycleHost}
          onAdminClick={() => {
            window.location.hash = 'admin';
            setStatus(MeetingStatus.ADMIN_LOGIN);
          }}
        />
      )}
      {status === MeetingStatus.SIGNING_IN && (
        <SignIn 
          onComplete={handleSignInComplete}
          onCancel={handleCancelSignIn}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          setIsMicOn={setIsMicOn}
          setIsCameraOn={setIsCameraOn}
        />
      )}
      {status === MeetingStatus.JOINED && (
        <MeetingRoom 
          onLeave={handleLeave}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          host={currentHost}
          userName={userName}
        />
      )}
      {status === MeetingStatus.ENDED && (
        <EndScreen onRestart={() => setStatus(MeetingStatus.LOBBY)} />
      )}
      {(status === MeetingStatus.ADMIN_LOGIN || status === MeetingStatus.ADMIN_DASHBOARD) && (
        <AdminDashboard 
          status={status} 
          onLoginSuccess={() => setStatus(MeetingStatus.ADMIN_DASHBOARD)} 
          onLogout={() => {
            window.location.hash = '';
            setStatus(MeetingStatus.LOBBY);
          }}
        />
      )}
    </div>
  );
};

export default App;

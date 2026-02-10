
import React, { useEffect, useRef } from 'react';

interface LobbyProps {
  onJoin: () => void;
  isMicOn: boolean;
  isCameraOn: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  currentHost: { name: string; seed: string };
  onCycleHost: () => void;
  onAdminClick: () => void;
}

const Lobby: React.FC<LobbyProps> = ({ 
  onJoin, 
  isMicOn, 
  isCameraOn, 
  toggleMic, 
  toggleCamera,
  currentHost,
  onCycleHost,
  onAdminClick
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn })
        .then(stream => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => console.error("Error accessing media devices.", err));
    } else {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [isCameraOn, isMicOn]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#202124]">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="z-10 max-w-6xl w-full flex flex-col md:flex-row items-center justify-center gap-16 px-6">
        
        {/* Left: Camera Preview */}
        <div className="flex flex-col items-center w-full max-w-[740px]">
          <div className="relative w-full aspect-video bg-[#3c4043] rounded-lg overflow-hidden shadow-xl border border-[#5f6368] flex items-center justify-center group">
            {isCameraOn ? (
              <video 
                ref={videoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 bg-[#202124] rounded-full flex items-center justify-center mb-4">
                  <span className="text-4xl text-zinc-500">U</span>
                </div>
                <p className="text-white text-lg font-medium">Camera is off</p>
              </div>
            )}
            
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-6">
              <button 
                onClick={toggleMic}
                className={`p-3.5 rounded-full border transition-all ${isMicOn ? 'bg-transparent border-[#5f6368] hover:bg-[#4a4d51]' : 'bg-[#ea4335] border-[#ea4335] hover:bg-[#d93025]'}`}
              >
                {isMicOn ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                )}
              </button>
              <button 
                onClick={toggleCamera}
                className={`p-3.5 rounded-full border transition-all ${isCameraOn ? 'bg-transparent border-[#5f6368] hover:bg-[#4a4d51]' : 'bg-[#ea4335] border-[#ea4335] hover:bg-[#d93025]'}`}
              >
                {isCameraOn ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                )}
              </button>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
             <button className="flex items-center gap-2 text-blue-400 hover:bg-blue-400/10 px-3 py-1.5 rounded text-sm transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                Check your audio and video
             </button>
          </div>
        </div>

        {/* Right: Join Text and Buttons */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left max-w-sm">
          <h1 className="text-4xl text-white font-normal mb-6">Ready to join?</h1>
          
          <button 
            onClick={onCycleHost}
            className="flex items-center gap-2 mb-8 bg-[#3c4043]/30 hover:bg-[#3c4043]/50 px-3 py-1.5 rounded-full transition-all group active:scale-95"
          >
             <div className="flex relative">
               <img 
                 src={`https://picsum.photos/seed/${currentHost.seed}/32`} 
                 className="w-6 h-6 rounded-full border border-[#202124] transition-all" 
                 alt={currentHost.name} 
               />
               <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-[#202124]"></div>
             </div>
             <p className="text-zinc-300 text-sm font-medium">
               <span className="text-white font-semibold group-hover:text-[#8ab4f8]">{currentHost.name}</span> is already in this call
             </p>
          </button>
          
          <div className="flex flex-col gap-4 w-full">
            <button 
              onClick={onJoin}
              className="px-8 py-3 bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#202124] rounded-full font-medium text-base transition-colors shadow-lg"
            >
              Join now
            </button>
            <button className="px-8 py-3 bg-transparent border border-[#5f6368] text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-full font-medium text-base transition-colors">
              Present
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom room ID and info - Admin button removed as requested */}
      <div className="absolute bottom-6 right-8 flex flex-col items-end opacity-20 hover:opacity-100 transition-opacity">
        <div className="text-white text-[10px] font-bold uppercase tracking-widest">
          Meeting ID: hiyk-meet-room
        </div>
      </div>
    </div>
  );
};

export default Lobby;

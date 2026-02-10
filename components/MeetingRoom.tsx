import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import AiAssistant from './AiAssistant';
import ChatSidebar from './ChatSidebar';

interface MeetingRoomProps {
  onLeave: () => void;
  isMicOn: boolean;
  isCameraOn: boolean;
  toggleMic: () => void;
  toggleCamera: () => void;
  host: { name: string; seed: string };
  userName: string;
}

const MeetingRoom: React.FC<MeetingRoomProps> = ({ 
  onLeave, isMicOn, isCameraOn, toggleMic, toggleCamera, host, userName 
}) => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const [isAiTalking, setIsAiTalking] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isCameraOn) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: isMicOn })
        .then(stream => {
          if (userVideoRef.current) userVideoRef.current.srcObject = stream;
        });
    }
  }, [isCameraOn, isMicOn]);

  const handleSendMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const formattedTime = currentTime.toLocaleTimeString([], { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });

  return (
    <div className="flex-1 flex flex-col bg-[#202124] overflow-hidden relative">
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col p-4 md:p-6 pb-0 overflow-y-auto">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
            
            {/* AI Participant Tile */}
            <div className={`relative bg-[#3c4043] rounded-xl overflow-hidden transition-all duration-300 ${isAiTalking ? 'ring-2 ring-[#8ab4f8]' : ''}`}>
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                     <img 
                       src={`https://picsum.photos/seed/${host.seed}/200`} 
                       className="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover shadow-2xl border-4 border-[#202124]" 
                       alt={host.name} 
                     />
                     {isAiTalking && (
                       <div className="absolute -inset-4 border-2 border-[#8ab4f8] rounded-full animate-pulse opacity-50"></div>
                     )}
                  </div>
               </div>
               
               <div className="absolute bottom-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded bg-[#202124]/60 backdrop-blur text-sm font-medium text-white">
                  {isAiTalking && (
                    <div className="flex gap-0.5 items-end h-3">
                       <div className="w-0.5 bg-blue-400 animate-bounce h-2" style={{animationDelay: '0.1s'}}></div>
                       <div className="w-0.5 bg-blue-400 animate-bounce h-3" style={{animationDelay: '0.2s'}}></div>
                       <div className="w-0.5 bg-blue-400 animate-bounce h-1" style={{animationDelay: '0.3s'}}></div>
                    </div>
                  )}
                  {host.name}
               </div>
            </div>

            {/* User Tile */}
            <div className="relative bg-[#3c4043] rounded-xl overflow-hidden shadow-md">
              {isCameraOn ? (
                <video 
                  ref={userVideoRef} 
                  autoPlay 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-[#202124] flex items-center justify-center text-3xl font-medium text-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
              <div className="absolute bottom-4 left-4 px-2.5 py-1 rounded bg-[#202124]/60 backdrop-blur text-sm font-medium text-white">
                  {userName} (You)
              </div>
              {!isMicOn && (
                 <div className="absolute top-4 right-4 bg-[#ea4335] p-1.5 rounded-full shadow-lg">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3zM18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                 </div>
              )}
            </div>
          </div>
        </div>

        {showChat && (
          <ChatSidebar 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onClose={() => setShowChat(false)} 
          />
        )}
      </div>

      <div className="h-20 bg-[#202124] flex items-center justify-between px-6 z-20">
        <div className="hidden lg:flex items-center gap-4 text-white font-medium">
           <span className="border-r border-[#5f6368] pr-4">{formattedTime}</span>
           <span className="text-[#e8eaed]">hiyk-meet-room</span>
        </div>

        <div className="flex items-center gap-3 mx-auto lg:mx-0">
           <button 
             onClick={toggleMic}
             className={`p-3 rounded-full transition-all border ${isMicOn ? 'bg-[#3c4043] border-[#5f6368] hover:bg-[#4a4d51]' : 'bg-[#ea4335] border-[#ea4335] hover:bg-[#d93025]'}`}
             title={isMicOn ? "Turn off microphone" : "Turn on microphone"}
           >
              {isMicOn ? (
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              ) : (
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              )}
           </button>

           <button 
             onClick={toggleCamera}
             className={`p-3 rounded-full transition-all border ${isCameraOn ? 'bg-[#3c4043] border-[#5f6368] hover:bg-[#4a4d51]' : 'bg-[#ea4335] border-[#ea4335] hover:bg-[#d93025]'}`}
             title={isCameraOn ? "Turn off camera" : "Turn on camera"}
           >
              {isCameraOn ? (
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              ) : (
                 <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636" /></svg>
              )}
           </button>

           <button 
             onClick={onLeave}
             className="px-6 py-3 bg-[#ea4335] hover:bg-[#d93025] rounded-full flex items-center gap-2 transition-colors shadow-lg"
             title="Leave call"
           >
              <svg className="w-6 h-6 text-white rotate-[135deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01-.35-1.1-.55-2.28-.55-3.51 0-.55-.45-1-1-1H3.99c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.38c0-.55-.45-1-1-1z"/></svg>
           </button>
        </div>

        <div className="hidden lg:flex items-center gap-2">
           <button 
             onClick={() => setShowChat(!showChat)}
             className={`p-3 rounded-full transition-colors ${showChat ? 'bg-[#8ab4f8] text-[#202124]' : 'text-white hover:bg-[#3c4043]'}`}
           >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
           </button>
        </div>
      </div>

      <AiAssistant 
         isMicOn={isMicOn} 
         hostName={host.name}
         onSpeakingStateChange={setIsAiTalking}
         onTranscript={(text, isAi) => {
            setMessages(prev => [...prev, {
               id: Date.now().toString() + Math.random(),
               sender: isAi ? host.name : 'You',
               text,
               timestamp: new Date(),
               isAi
            }]);
         }}
      />
    </div>
  );
};

export default MeetingRoom;
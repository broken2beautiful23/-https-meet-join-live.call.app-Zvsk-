
import React from 'react';

interface EndScreenProps {
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ onRestart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#202124] text-white font-sans">
      <div className="text-center max-w-md w-full animate-fade-in">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
           <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
           </svg>
        </div>
        
        <h1 className="text-[32px] font-normal mb-4 tracking-tight">You left the meeting</h1>
        <p className="text-[#9aa0a6] text-[15px] mb-10 leading-relaxed px-4">
          Your camera and microphone are now off. To rejoin, click the button below.
        </p>

        <div className="flex flex-col gap-4">
           <button 
             onClick={onRestart}
             className="w-full py-3 bg-[#8ab4f8] text-[#202124] hover:bg-[#aecbfa] rounded-lg font-medium text-base transition-all active:scale-[0.98] shadow-lg shadow-blue-500/10"
           >
             Rejoin call
           </button>
           
           <button 
             onClick={() => window.location.reload()}
             className="w-full py-3 bg-transparent text-[#8ab4f8] hover:bg-[#8ab4f8]/10 rounded-lg font-medium border border-[#5f6368] transition-all"
           >
             Return to home screen
           </button>
        </div>

        <div className="mt-16 flex flex-col items-center gap-4">
           <p className="text-[#5f6368] text-xs font-bold uppercase tracking-widest">Meeting quality</p>
           <div className="flex gap-1.5">
             {[1,2,3,4,5].map(i => (
               <button key={i} className="text-[#8ab4f8] hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                 </svg>
               </button>
             ))}
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default EndScreen;

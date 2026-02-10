
import React from 'react';

interface EndScreenProps {
  onRestart: () => void;
}

const EndScreen: React.FC<EndScreenProps> = ({ onRestart }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-black">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h1 className="text-3xl font-bold mb-4">You left the meeting</h1>
        <p className="text-zinc-400 mb-8">
          The summary of this meeting will be available in your dashboard shortly.
        </p>
        <div className="flex flex-col gap-3">
           <button 
             onClick={onRestart}
             className="w-full py-3 bg-zinc-100 text-black hover:bg-white rounded-lg font-semibold transition-all active:scale-95"
           >
             Rejoin
           </button>
           <button className="w-full py-3 bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg font-semibold border border-zinc-700">
             Go to home screen
           </button>
        </div>
        <p className="mt-12 text-zinc-600 text-sm">
           Meeting quality: 
           <span className="ml-2 text-zinc-400">★★★★★</span>
        </p>
      </div>
    </div>
  );
};

export default EndScreen;

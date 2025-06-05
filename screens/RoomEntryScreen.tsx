
import React, { useState } from 'react';
import { LOGO_SVG_STRING } from '../constants';
import { LogoutIcon, UsersIcon } from '../components/icons'; // Assuming UsersIcon exists or will be added

interface RoomEntryScreenProps {
  userEmail: string;
  onJoinRoom: (roomId: string) => void;
  onLogout: () => void;
}

const RoomEntryScreen: React.FC<RoomEntryScreenProps> = ({ userEmail, onJoinRoom, onLogout }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // Error state can be kept if needed for other potential errors, though not for room ID validation anymore.
  // const [error, setError] = useState<string | null>(null); 

  const handleStartWaiting = () => {
    setIsLoading(true);
    // Generate a unique room ID for the doctor
    // Example: doc-userEmailPrefix-timestampSuffix
    const emailPrefix = userEmail.substring(0, userEmail.indexOf('@')).replace(/[^a-zA-Z0-9]/g, '');
    const timestampSuffix = Date.now().toString().slice(-6);
    const uniqueRoomId = `doc-${emailPrefix}-${timestampSuffix}`;
    
    // setError(null); // Clear previous errors if any
    
    // Simulate a short delay if needed, or directly join
    // setTimeout(() => {
      onJoinRoom(uniqueRoomId);
      // setIsLoading(false); // This will be handled by navigation to CallScreen
    // }, 500);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-indigo-100 to-sky-100">
       <div className="absolute top-6 right-6">
         <button
            onClick={onLogout}
            aria-label="Çıkış Yap"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white/95 text-slate-700 border-2 border-slate-200 hover:border-slate-300 backdrop-blur-sm shadow-md hover:shadow-lg font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95"
          >
            <LogoutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm">Çıkış Yap</span>
          </button>
       </div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl p-6 space-y-6 text-center">
        <div className="flex justify-center mb-4" dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }}></div>
        
        <h2 className="text-3xl lg:text-4xl font-bold text-indigo-700">Danışmanlık Paneli</h2>
        <p className="text-sm text-slate-600">
          Hoş geldiniz, <span className="font-semibold text-indigo-600">{userEmail}</span>.
        </p>
        <p className="text-sm text-slate-500 mt-2">
          Hastaların size bağlanabilmesi için bir danışmanlık odası başlatın.
        </p>
        
        {/* {error && (
           <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl relative flex items-center gap-2 text-left" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )} */}

        <div className="pt-4">
          <button
            onClick={handleStartWaiting}
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <UsersIcon className="w-5 h-5" /> // Example icon
            )}
            {isLoading ? 'Oda Oluşturuluyor...' : 'Hasta Beklemeye Başla'}
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-4">
            Bu işlem sizin için benzersiz bir oda oluşturacak ve hastaların bu odaya bağlanmasını bekleyeceksiniz.
        </p>
      </div>
      <footer className="mt-10 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} Video Call App by BookMeza Design.
      </footer>
    </div>
  );
};

export default RoomEntryScreen;

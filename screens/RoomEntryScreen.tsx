
import React, { useState } from 'react';
import { LOGO_SVG_STRING } from '../constants';
import { LogoutIcon } from '../components/icons';

interface RoomEntryScreenProps {
  userEmail: string;
  onJoinRoom: (roomId: string) => void;
  onLogout: () => void;
}

const RoomEntryScreen: React.FC<RoomEntryScreenProps> = ({ userEmail, onJoinRoom, onLogout }) => {
  const [roomId, setRoomId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('Oda ID\'si boş olamaz.');
      return;
    }
    setError(null);
    onJoinRoom(roomId.trim());
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-purple-100 via-indigo-100 to-sky-100">
       <div className="absolute top-6 right-6">
         <button
            onClick={onLogout}
            aria-label="Çıkış Yap"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white/80 hover:bg-white/95 text-slate-700 border-2 border-slate-200 hover:border-slate-300 backdrop-blur-sm shadow-md hover:shadow-lg font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95" // Adjusted to SecondaryButton
          >
            <LogoutIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline text-sm">Çıkış Yap</span>
          </button>
       </div>
      {/* Using rounded-2xl for main screen cards is a common and acceptable enhancement over rounded-xl for prominence */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl p-6 space-y-6"> {/* Adjusted to Card Pattern, p-6, space-y-6 */}
        <div className="flex justify-center" dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING }}></div>
        <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-indigo-700">Odaya Katıl</h2>
            <p className="text-sm text-slate-600 mt-2">
            Giriş yapıldı: <span className="font-semibold text-indigo-600">{userEmail}</span>
            </p>
        </div>
        
        {error && (
           <div className="bg-red-500/10 border border-red-500/30 text-red-700 px-4 py-3 rounded-xl relative flex items-center gap-2" role="alert">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <span className="block sm:inline text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-slate-700 mb-2">
              Oda ID'si
            </label>
            <input
              id="roomId"
              name="roomId"
              type="text"
              autoComplete="off"
              required
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl text-sm placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:bg-white/90 hover:border-slate-300 transition-all duration-200" // Adjusted to InputBase
              placeholder="örneğin: favori-odam-777"
              aria-describedby="roomId-description"
            />
            <p id="roomId-description" className="mt-2 text-xs text-slate-500">
              Katılmak istediğiniz odanın benzersiz ID'sini girin veya yeni bir ID oluşturun.
            </p>
          </div>

          <div>
            <button
              type="submit"
               className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95" // Adjusted to PrimaryButton
            >
              Odaya Katıl
            </button>
          </div>
        </form>
      </div>
      <footer className="mt-10 text-center text-sm text-slate-600">
        &copy; {new Date().getFullYear()} Video Call App by BookMeza Design.
      </footer>
    </div>
  );
};

export default RoomEntryScreen;

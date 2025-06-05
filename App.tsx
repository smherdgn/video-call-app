
import React, { useState, useEffect, useCallback } from 'react';
import LoginScreen from './screens/LoginScreen';
import RoomEntryScreen from './screens/RoomEntryScreen';
import CallScreen from './screens/CallScreen';
import ConsentModal from './components/ConsentModal';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import { AuthContext } from './contexts/AuthContext';
import { getToken, removeToken, decodeToken } from './services/authService';
import { SocketProvider } from './contexts/SocketContext';

type AppView = 'consent' | 'login' | 'roomEntry' | 'call' | 'privacyPolicy';
const CONSENT_KEY = 'userConsentGiven';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<AppView>('login');
  const [previousViewBeforePrivacy, setPreviousViewBeforePrivacy] = useState<AppView>('login');
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  const checkInitialState = useCallback(() => {
    const consentGiven = localStorage.getItem(CONSENT_KEY) === 'true';
    setHasConsent(consentGiven);

    const token = getToken();
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUserEmail(decoded.email || 'user@example.com');
        setIsAuthenticated(true);
        setCurrentView(consentGiven ? 'roomEntry' : 'consent');
      } else {
        removeToken();
        setIsAuthenticated(false);
        setUserEmail(null);
        setCurrentView(consentGiven ? 'login' : 'consent');
      }
    } else {
      setIsAuthenticated(false);
      setUserEmail(null);
      setCurrentView(consentGiven ? 'login' : 'consent');
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkInitialState();
  }, [checkInitialState]);

  const handleLoginSuccess = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    setCurrentView('roomEntry');
  };

  const handleLogout = () => {
    removeToken();
    setIsAuthenticated(false);
    setUserEmail(null);
    setCurrentView('login'); // Go to login, consent will be checked again if needed or handled by login screen itself
    setCurrentRoomId(null);
  };

  const handleJoinRoom = (roomId: string) => {
    if (isAuthenticated && hasConsent) {
      setCurrentRoomId(roomId);
      setCurrentView('call');
    } else if (!hasConsent) {
      setCurrentView('consent');
    }
  };

  const handleLeaveCall = () => {
    setCurrentView('roomEntry');
    setCurrentRoomId(null);
  };

  const handleConsentAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setHasConsent(true);
    setCurrentView('login'); // After consent, go to login
  };

  const handleConsentDecline = () => {
    // Potentially show a message that app cannot be used without consent
    // For now, keeps them on consent screen or a restricted state.
    alert("Uygulamayı kullanmak için Gizlilik Politikası ve Veri İşleme şartlarını kabul etmeniz gerekmektedir.");
  };

  const handleViewPrivacyPolicy = () => {
    setPreviousViewBeforePrivacy(currentView);
    setCurrentView('privacyPolicy');
  };

  const handleReturnFromPrivacyPolicy = () => {
    setCurrentView(previousViewBeforePrivacy);
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-slate-100">
        <p className="text-2xl font-semibold text-indigo-600">Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userEmail, login: handleLoginSuccess, logout: handleLogout }}>
      {!hasConsent && currentView !== 'privacyPolicy' && (
        <ConsentModal 
          onAccept={handleConsentAccept} 
          onDecline={handleConsentDecline} 
          onViewPolicy={handleViewPrivacyPolicy} 
        />
      )}

      {currentView === 'privacyPolicy' && <PrivacyPolicyScreen onReturn={handleReturnFromPrivacyPolicy} />}
      
      {hasConsent && currentView === 'login' && <LoginScreen onLoginSuccess={handleLoginSuccess} />}
      
      {hasConsent && currentView === 'roomEntry' && isAuthenticated && userEmail && (
        <RoomEntryScreen userEmail={userEmail} onJoinRoom={handleJoinRoom} onLogout={handleLogout} />
      )}
      
      {hasConsent && currentView === 'call' && isAuthenticated && currentRoomId && (
        <SocketProvider>
          <CallScreen roomId={currentRoomId} onLeaveCall={handleLeaveCall} />
        </SocketProvider>
      )}

      {/* Fallback for declined consent or other states if needed */}
      {!hasConsent && currentView === 'login' && (
         <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-slate-100 p-4 text-center">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200"> {/* Adjusted to Card Pattern */}
                <h1 className="text-2xl font-bold text-indigo-700 mb-4">Giriş Gerekli</h1>
                <p className="text-slate-600 mb-6">Uygulamaya devam etmek için lütfen önce veri kullanım koşullarını kabul edin.</p>
                <button 
                    onClick={() => setCurrentView('consent')}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95" // Adjusted to PrimaryButton
                >
                    Koşulları Görüntüle
                </button>
            </div>
        </div>
      )}

    </AuthContext.Provider>
  );
};

export default App;

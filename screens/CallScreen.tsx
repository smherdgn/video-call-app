
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import VideoPlayer from '../components/VideoPlayer';
import LogPanel from '../components/LogPanel';
import { WebRTCHandler } from '../services/webRTCService';
import { SignalingMessage, LogEntry, WebRTCService } from '../types';
import { LOGO_SVG_STRING } from '../constants';
import { MicIcon, MicOffIcon, VideoIcon, VideoOffIcon, LogoutIcon, CallEndIcon, ArrowLeftIcon, WifiIcon, WifiOffIcon } from '../components/icons';

interface CallScreenProps {
  roomId: string;
  onLeaveCall: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ roomId, onLeaveCall }) => {
  const { userEmail, logout } = useAuth();
  const { socket, isConnected, emitMessage } = useSocket();
  
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState<boolean>(true);
  const [otherUserId, setOtherUserId] = useState<string | null>(null);
  const [iceConnectionState, setIceConnectionState] = useState<RTCIceConnectionState>('new');


  const webRTCServiceRef = useRef<WebRTCService | null>(null);

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    // Basic PII masking for email in logs
    const maskedMessage = userEmail ? message.replace(new RegExp(userEmail, 'g'), `${userEmail.substring(0,3)}...`) : message;
    setLogs(prevLogs => [{ id: Date.now().toString(), timestamp: new Date(), message: maskedMessage, type }, ...prevLogs.slice(0, 149)]); // Increased log limit
  }, [userEmail]);

  // Effect to monitor ICE connection state from WebRTCHandler
  useEffect(() => {
    const interval = setInterval(() => {
      if (webRTCServiceRef.current?.peerConnection) {
        setIceConnectionState(webRTCServiceRef.current.peerConnection.iceConnectionState);
      }
    }, 1000); // Check every second
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    webRTCServiceRef.current = WebRTCHandler;
    
    const initWebRTC = async () => {
      try {
        addLog(`Oda için WebRTC başlatılıyor: ${roomId}...`, 'webrtc');
        await webRTCServiceRef.current?.initialize(
          (stream) => {
            setRemoteStream(stream);
            addLog('Uzak akış alındı ve ayarlandı.', 'success');
          },
          (candidate) => {
            if (socket && otherUserId) {
              addLog(`Diğer kullanıcıya (${otherUserId.substring(0,6)}...) ICE adayı gönderiliyor`, 'webrtc');
              emitMessage('ice-candidate', { candidate, targetSocketId: otherUserId, senderSocketId: socket.id, roomId });
            }
          },
          addLog
        );
        setLocalStream(webRTCServiceRef.current?.localStream || null);
        addLog('WebRTC başlatıldı ve yerel akış alındı.', 'success');
        
        if (socket && isConnected) {
           emitMessage('join-room', { roomId });
           addLog(`'${roomId}' odasına katılım isteği gönderildi.`, 'socket');
        }

      } catch (error) {
        console.error("WebRTC başlatma hatası:", error);
        addLog(`Oda ${roomId} için WebRTC başlatma hatası: ${(error as Error).message}`, 'error');
      }
    };

    if (isConnected && socket && roomId) {
       initWebRTC();
    }

    return () => {
      addLog('Çağrı ekranından ayrılınıyor, WebRTC bağlantısı temizleniyor.', 'info');
      webRTCServiceRef.current?.closeConnection();
      if (socket && isConnected) {
        emitMessage('leave-room', { roomId });
         addLog(`'${roomId}' odasından ayrılma isteği gönderildi.`, 'socket');
      }
      setLocalStream(null); // Ensure local stream is also cleared from state
      setRemoteStream(null);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, socket, addLog, roomId]); // emitMessage and otherUserId are not dependencies for init/cleanup

 useEffect(() => {
    if (!socket) {
      addLog('Soket mevcut değil, sinyal işleyicileri ayarlanamıyor.', 'error');
      return;
    }
    addLog('Sinyal mesajı işleyicileri ayarlanıyor.', 'socket');

    const handleUserJoined = (data: { userId: string, userCount: number, roomId: string }) => {
      if (data.roomId !== roomId) return;
      addLog(`➡️ Kullanıcı ${data.userId.substring(0,6)}... odaya katıldı (${data.roomId}). Odadaki kişi sayısı: ${data.userCount}`, 'success');
      if (data.userId !== socket.id && (!otherUserId || otherUserId !== data.userId)) { 
        setOtherUserId(data.userId);
        addLog(`Yeni kullanıcı ${data.userId.substring(0,6)}... algılandı, çağrı başlatmaya hazırlanılıyor.`, 'info');
        // Simple initiator logic: user with "smaller" ID initiates
        if (socket.id && data.userId && socket.id < data.userId) { 
             createAndSendOffer(data.userId);
        }
      } else if (data.userId === socket.id) {
        addLog('Siz odaya katıldınız.', 'info');
      }
    };

    const createAndSendOffer = async (targetId: string) => {
      if (!webRTCServiceRef.current || !socket) {
        addLog('Teklif oluşturulamadı: WebRTC servisi veya soket hazır değil.', 'error');
        return;
      }
      try {
        addLog(`${targetId.substring(0,6)}... için '${roomId}' odasında teklif oluşturuluyor...`, 'webrtc');
        const offer = await webRTCServiceRef.current.createOffer();
        addLog('Teklif oluşturuldu, sunucuya gönderiliyor.', 'webrtc');
        emitMessage('offer', { offer, targetSocketId: targetId, senderSocketId: socket.id, roomId });
      } catch (error) {
        addLog(`Teklif oluşturma hatası: ${(error as Error).message}`, 'error');
      }
    };

    const handleOffer = async (data: { offer: RTCSessionDescriptionInit, senderSocketId: string, roomId: string }) => {
      if (data.roomId !== roomId || !socket || data.senderSocketId === socket.id) return;
      if (!webRTCServiceRef.current) {
         addLog('Teklif işlenemedi: WebRTC servisi hazır değil.', 'error');
         return;
      }
      addLog(`${data.senderSocketId.substring(0,6)}... kullanıcısından '${data.roomId}' odasında teklif alındı.`, 'webrtc');
      if (!otherUserId || otherUserId !== data.senderSocketId) {
        setOtherUserId(data.senderSocketId); // Ensure otherUserId is set if an offer comes first
      }
      try {
        const answer = await webRTCServiceRef.current.createAnswer(data.offer);
        addLog('Cevap oluşturuldu, sunucuya gönderiliyor.', 'webrtc');
        emitMessage('answer', { answer, targetSocketId: data.senderSocketId, senderSocketId: socket.id, roomId });
      } catch (error) {
        addLog(`Cevap oluşturma hatası: ${(error as Error).message}`, 'error');
      }
    };

    const handleAnswer = async (data: { answer: RTCSessionDescriptionInit, senderSocketId: string, roomId: string }) => {
      if (data.roomId !== roomId || data.senderSocketId === socket?.id) return;
      if (!webRTCServiceRef.current) {
        addLog('Cevap işlenemedi: WebRTC servisi hazır değil.', 'error');
        return;
      }
      addLog(`${data.senderSocketId.substring(0,6)}... kullanıcısından '${data.roomId}' odasında cevap alındı.`, 'webrtc');
      try {
        await webRTCServiceRef.current.setRemoteDescription(data.answer);
        addLog('Uzak açıklama ayarlandı (cevap kabul edildi).', 'success');
      } catch (error) {
        addLog(`Cevap için uzak açıklama ayarlama hatası: ${(error as Error).message}`, 'error');
      }
    };

    const handleIceCandidate = async (data: { candidate: RTCIceCandidateInit, senderSocketId: string, roomId: string }) => {
      if (data.roomId !== roomId || data.senderSocketId === socket?.id) return;
      if (!webRTCServiceRef.current) {
        addLog('ICE adayı işlenemedi: WebRTC servisi hazır değil.', 'error');
        return;
      }
      addLog(`${data.senderSocketId.substring(0,6)}... kullanıcısından '${data.roomId}' odasında ICE adayı alındı.`, 'webrtc');
      try {
        await webRTCServiceRef.current.addIceCandidate(data.candidate);
        // No specific log needed here as webRTCService already logs it.
      } catch (error) {
        addLog(`ICE adayı ekleme hatası (CallScreen): ${(error as Error).message}`, 'error');
      }
    };
    
    const handleUserLeft = (data: { userId: string, roomId: string }) => {
      if (data.roomId !== roomId) return;
      addLog(`⬅️ Kullanıcı ${data.userId.substring(0,6)}... odadan ayrıldı (${data.roomId}).`, 'error');
      if (data.userId === otherUserId) {
        setOtherUserId(null);
        setRemoteStream(null);
        webRTCServiceRef.current?.closeConnection(); // Close existing connection with the user who left.
        addLog('Diğer kullanıcı ayrıldı, uzak akış kaldırıldı ve bağlantı sonlandırıldı.', 'info');
        // Re-initialize WebRTC to be ready for a new user, but only if local stream still exists
        if(webRTCServiceRef.current?.localStream){
            addLog('Yeni bir katılımcı için WebRTC yeniden hazırlanıyor...', 'webrtc');
            // Small delay to ensure cleanup completes before re-init
            setTimeout(() => {
                if (socket && isConnected && webRTCServiceRef.current?.localStream) { // Check again before re-init
                     webRTCServiceRef.current?.initialize(
                        (stream) => { setRemoteStream(stream); addLog('Yeni kullanıcı için uzak akış alındı.', 'success'); },
                        (candidate) => {
                            if (socket && otherUserId) { // Check if a new otherUserId is set by then
                                emitMessage('ice-candidate', { candidate, targetSocketId: otherUserId, senderSocketId: socket.id, roomId });
                            }
                        },
                        addLog
                    ).then(() => {
                        addLog('Yeni katılımcı için WebRTC yeniden başlatıldı.', 'success');
                    }).catch(err => {
                        addLog(`WebRTC yeniden başlatma hatası: ${(err as Error).message}`, 'error');
                    });
                }
            }, 500);
        }
      }
    };

    const handleRoomFull = (data: { roomId: string }) => {
        if (data.roomId !== roomId) return;
        addLog(`Katılım başarısız: '${data.roomId}' odası dolu.`, 'error');
        onLeaveCall(); 
    };
    
    const handleHangUpSignal = (data: { senderSocketId: string, roomId: string}) => {
        if (data.roomId !== roomId || data.senderSocketId !== otherUserId) return;
        addLog(`Diğer kullanıcı (${data.senderSocketId.substring(0,6)}...) çağrıyı sonlandırdı.`, 'info');
        setRemoteStream(null);
        setOtherUserId(null);
        webRTCServiceRef.current?.closeConnection();
         if(webRTCServiceRef.current?.localStream){
            addLog('Yeni bir katılımcı için WebRTC yeniden hazırlanıyor...', 'webrtc');
            setTimeout(() => {
                if (socket && isConnected && webRTCServiceRef.current?.localStream) { 
                     webRTCServiceRef.current?.initialize(
                        (stream) => { setRemoteStream(stream); addLog('Yeni kullanıcı için uzak akış alındı.', 'success'); },
                        (candidate) => {
                            if (socket && otherUserId) {
                                emitMessage('ice-candidate', { candidate, targetSocketId: otherUserId, senderSocketId: socket.id, roomId });
                            }
                        },
                        addLog
                    ).then(() => {
                        addLog('Yeni katılımcı için WebRTC yeniden başlatıldı.', 'success');
                    }).catch(err => {
                        addLog(`WebRTC yeniden başlatma hatası: ${(err as Error).message}`, 'error');
                    });
                }
            }, 500);
        }
    };

    socket.on('user-joined', handleUserJoined);
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);
    socket.on('user-left', handleUserLeft);
    socket.on('room-full', handleRoomFull);
    socket.on('hang-up', handleHangUpSignal);


    return () => {
      addLog('Sinyal mesajı işleyicileri kaldırılıyor.', 'socket');
      socket.off('user-joined', handleUserJoined);
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);
      socket.off('user-left', handleUserLeft);
      socket.off('room-full', handleRoomFull);
      socket.off('hang-up', handleHangUpSignal);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, addLog, emitMessage, roomId, onLeaveCall, otherUserId]); // otherUserId is needed to correctly send ICE candidates and re-init logic

  const toggleMedia = (type: 'audio' | 'video') => {
    if (!webRTCServiceRef.current) return;
    if (type === 'audio') {
      const newAudioState = !isAudioEnabled;
      webRTCServiceRef.current.toggleAudio(newAudioState);
      setIsAudioEnabled(newAudioState);
      addLog(`Ses ${newAudioState ? 'AÇILDI' : 'KAPATILDI'}.`, 'info');
    } else {
      const newVideoState = !isVideoEnabled;
      webRTCServiceRef.current.toggleVideo(newVideoState);
      setIsVideoEnabled(newVideoState);
      addLog(`Video ${newVideoState ? 'AÇILDI' : 'KAPATILDI'}.`, 'info');
    }
  };

  const handleHangUp = () => {
    addLog('Çağrı sonlandırılıyor (kullanıcı isteği)...', 'info');
    if(socket && otherUserId){ // Signal other user about hangup
        emitMessage('hang-up', {targetSocketId: otherUserId, senderSocketId: socket?.id, roomId});
    }
    webRTCServiceRef.current?.closeConnection();
    setRemoteStream(null);
    setOtherUserId(null); // Clear other user as we hung up on them
    
    // Re-initialize WebRTC to be ready for a new peer, only if local stream is still active
    if(webRTCServiceRef.current?.localStream){
        addLog('Yeni bir katılımcı için WebRTC yeniden hazırlanıyor...', 'webrtc');
        setTimeout(() => {
             if (socket && isConnected && webRTCServiceRef.current?.localStream) {
                webRTCServiceRef.current?.initialize(
                    (stream) => { setRemoteStream(stream); addLog('Yeni katılımcı için uzak akış alındı.', 'success');},
                    (candidate) => {
                        // Don't send candidates yet, wait for a new otherUserId
                        if (socket && otherUserId) { // This check will likely be false immediately after hangup
                             emitMessage('ice-candidate', { candidate, targetSocketId: otherUserId, senderSocketId: socket.id, roomId });
                        }
                    },
                    addLog
                ).then(() => {
                    addLog('Yeni katılımcı için WebRTC yeniden başlatıldı.', 'success');
                }).catch(err => {
                    addLog(`WebRTC yeniden başlatma hatası: ${(err as Error).message}`, 'error');
                });
            }
        }, 500); // Small delay
    }
  };

  const handleLeaveRoomAndLogout = () => {
    handleHangUp(); // Ensure current call is ended
    logout(); // This will trigger navigation and socket cleanup via AuthContext and App.tsx
  };
  
  const handleReturnToRoomSelection = () => {
    handleHangUp(); // Ensure current call is ended
    onLeaveCall(); // Navigate back to room entry
  }

  const getICEConnectionStatusIndicator = () => {
    switch (iceConnectionState) {
      case 'new':
      case 'checking':
        return <><WifiIcon className="w-3 h-3 text-amber-500 animate-pulse" /> <span className="text-amber-500">Bağlanıyor...</span></>;
      case 'connected':
      case 'completed':
        return <><WifiIcon className="w-3 h-3 text-emerald-500" /> <span className="text-emerald-500">Bağlandı</span></>;
      case 'disconnected':
          return <><WifiOffIcon className="w-3 h-3 text-red-500" /> <span className="text-red-500">Bağlantı Kesildi</span></>;
      case 'failed':
        return <><WifiOffIcon className="w-3 h-3 text-red-600" /> <span className="text-red-600">Bağlantı Hatası</span></>;
      case 'closed':
        return <><WifiOffIcon className="w-3 h-3 text-slate-500" /> <span className="text-slate-500">Kapalı</span></>;
      default:
        return <><WifiIcon className="w-3 h-3 text-slate-400" /> <span className="text-slate-400">{iceConnectionState}</span></>;
    }
  };

  // BookMeza Button Base (for circular icon buttons, slightly different padding)
  const circularButtonBase = "p-3 rounded-full inline-flex items-center justify-center transition-all duration-200 active:scale-95 focus:outline-none shadow-lg hover:shadow-xl";
  
  // BookMeza SuccessButton classes (adapted for circular)
  const successButtonCircular = `${circularButtonBase} bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white focus:ring-2 focus:ring-emerald-500/20`;
  
  // BookMeza DangerButton classes (adapted for circular)
  const dangerButtonCircular = `${circularButtonBase} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-2 focus:ring-red-500/20`;


  return (
    <div className="flex flex-col h-screen bg-slate-100 text-slate-800">
      {/* Header: Adjusted to use standard BookMeza values where possible, keeping glassmorphic enhancements */}
      <header className="bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center space-x-3">
           <button
            onClick={handleReturnToRoomSelection}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95" // Adjusted to GhostButton (icon-only adaptation)
            title="Oda Seçimine Dön"
            aria-label="Oda Seçimine Dön"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div dangerouslySetInnerHTML={{ __html: LOGO_SVG_STRING.replace('width="120"', 'width="100"').replace('height="40"', 'height="32"') }}></div>
          <div className="flex flex-col sm:flex-row sm:items-baseline">
            {userEmail && <span className="text-xs sm:text-sm text-indigo-700 font-medium hidden sm:block">{userEmail.substring(0, userEmail.indexOf('@'))}</span>}
            <span className="text-xs sm:text-sm text-slate-500 sm:ml-2">(Oda: {roomId})</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
            <div className="text-xs flex items-center gap-1 mr-2 p-1.5 bg-slate-200/70 rounded-lg">
                {getICEConnectionStatusIndicator()}
            </div>
            <button
              onClick={handleLeaveRoomAndLogout}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 active:scale-95 text-sm" // Adjusted to DangerButton (kept text-sm for compactness)
              aria-label="Oturumu Kapat"
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col lg:flex-row p-3 sm:p-4 gap-3 sm:gap-4 overflow-hidden">
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {/* Local Video */}
          <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden aspect-video relative border border-slate-700/50">
            <VideoPlayer stream={localStream} muted={true} />
            <div className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-sm text-slate-100 text-xs px-2 py-1 rounded-md shadow">
              Siz ({isAudioEnabled ? 'Ses Açık' : 'Ses Kapalı'}, {isVideoEnabled ? 'Video Açık' : 'Video Kapalı'})
            </div>
          </div>
           {/* Remote Video */}
          <div className="bg-slate-900 rounded-xl shadow-xl overflow-hidden aspect-video relative border border-slate-700/50">
             {remoteStream ? (
                <VideoPlayer stream={remoteStream} />
             ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-4">
                    <svg className="w-16 h-16 text-slate-500 mb-4 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <p className="text-center text-sm">
                        {otherUserId ? `Kullanıcıya (${otherUserId.substring(0,6)}...) bağlanılıyor...` : `Diğer kullanıcı bekleniyor...`}
                    </p>
                     <p className="text-xs text-slate-500 mt-1">Oda ID: <span className="font-semibold">{roomId}</span></p>
                </div>
             )}
            {remoteStream && otherUserId && <div className="absolute bottom-2 left-2 bg-slate-900/70 backdrop-blur-sm text-slate-100 text-xs px-2 py-1 rounded-md shadow">Karşı Taraf ({otherUserId.substring(0,6)}...)</div>}
          </div>
        </div>

        {/* Controls and Log Panel: Adjusted to Card Pattern (rounded-2xl for main panel is fine) */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200 rounded-2xl p-4 space-y-4 overflow-hidden lg:max-h-[calc(100vh-80px)]"> 
          <div className="flex justify-around items-center py-2 border-b border-slate-300/70">
            <button
              onClick={() => toggleMedia('audio')}
              className={isAudioEnabled ? successButtonCircular : dangerButtonCircular} // Using BookMeza Success/Danger for toggles
              title={isAudioEnabled ? 'Sesi Kapat' : 'Sesi Aç'} aria-label={isAudioEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            >
              {isAudioEnabled ? <MicIcon className="w-5 h-5"/> : <MicOffIcon className="w-5 h-5"/>}
            </button>
            <button
              onClick={() => toggleMedia('video')}
              className={isVideoEnabled ? successButtonCircular : dangerButtonCircular} // Using BookMeza Success/Danger for toggles
              title={isVideoEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'} aria-label={isVideoEnabled ? 'Kamerayı Kapat' : 'Kamerayı Aç'}
            >
              {isVideoEnabled ? <VideoIcon className="w-5 h-5"/> : <VideoOffIcon className="w-5 h-5"/>}
            </button>
            <button
              onClick={handleHangUp}
              className={dangerButtonCircular} // Using BookMeza DangerButton
              title="Çağrıyı Sonlandır (Odada Kal)" aria-label="Çağrıyı Sonlandır"
              disabled={!otherUserId && !remoteStream} // Disable if no one to hang up on
            >
              <CallEndIcon className="w-5 h-5"/>
            </button>
          </div>
          
          <div className="flex-grow overflow-hidden min-h-[200px]"> {/* Ensure LogPanel has space */}
             <LogPanel logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CallScreen;


import { ICE_SERVERS } from '../constants';
import { LogEntry, WebRTCService } from '../types';

const webRTCHandlerImplementation = {
  peerConnection: null as RTCPeerConnection | null,
  localStream: null as MediaStream | null,
  remoteStream: null as MediaStream | null,
  _onRemoteStreamCallback: null as ((stream: MediaStream) => void) | null,
  _onIceCandidateCallback: null as ((candidate: RTCIceCandidate) => void) | null,
  _addLogCallback: null as ((message: string, type: LogEntry['type']) => void) | null,

  async initialize(
    this: typeof webRTCHandlerImplementation,
    onRemoteStream: (stream: MediaStream) => void,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    addLog: (message: string, type: LogEntry['type']) => void
  ): Promise<void> {
    this._onRemoteStreamCallback = onRemoteStream;
    this._onIceCandidateCallback = onIceCandidate;
    this._addLogCallback = addLog;

    try {
      this._addLogCallback?.('Yerel medya isteniyor (kamera/mikrofon)...', 'webrtc');
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      this._addLogCallback?.('Yerel medya başarıyla alındı.', 'success');

      const configuration: RTCConfiguration = { 
        iceServers: ICE_SERVERS,
        iceTransportPolicy: 'relay' // Enforce TURN relay to prevent IP leak
      };
      this._addLogCallback?.(`Peer bağlantısı oluşturuluyor. ICE transport policy: "${configuration.iceTransportPolicy}"`, 'webrtc');
      this.peerConnection = new RTCPeerConnection(configuration);
      this._addLogCallback?.('Peer bağlantısı oluşturuldu.', 'webrtc');

      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection) {
            this.peerConnection.addTrack(track, this.localStream!);
          }
        });
        this._addLogCallback?.('Yerel izler peer bağlantısına eklendi.', 'webrtc');
      } else {
         this._addLogCallback?.('Yerel akış alınamadı, izler eklenemiyor.', 'error');
      }
      
      if (this.peerConnection) {
        this.peerConnection.onicecandidate = event => {
          if (event.candidate && this._onIceCandidateCallback) {
            this._addLogCallback?.(`ICE adayı oluşturuldu: ${event.candidate.type}, ${event.candidate.address || 'adres yok'}, ${event.candidate.protocol}`, 'webrtc');
            this._onIceCandidateCallback(event.candidate);
          } else if (!event.candidate) {
            this._addLogCallback?.('Tüm ICE adayları toplandı.', 'webrtc');
          }
        };

        this.peerConnection.ontrack = event => {
          this._addLogCallback?.('Uzak iz (track) alındı.', 'webrtc');
          if (event.streams && event.streams[0]) {
            this.remoteStream = event.streams[0];
            if (this._onRemoteStreamCallback) {
              this._onRemoteStreamCallback(this.remoteStream);
            }
          } else {
            // Handle cases where track might not be part of a stream yet (though typically it is)
             if (event.track && this.remoteStream) {
                this.remoteStream.addTrack(event.track);
                if (this._onRemoteStreamCallback) {
                    this._onRemoteStreamCallback(this.remoteStream); // Notify update
                }
            }
          }
        };

        this.peerConnection.oniceconnectionstatechange = () => {
          if (this.peerConnection) {
              const state = this.peerConnection.iceConnectionState;
              this._addLogCallback?.(`ICE bağlantı durumu değişti: ${state}`, 
                (state === 'connected' || state === 'completed') ? 'success' : 
                (state === 'failed' || state === 'disconnected' || state === 'closed') ? 'error' : 'webrtc'
              );
              // Potentially trigger UI updates based on state
          }
        };
         this.peerConnection.onconnectionstatechange = () => {
            if(this.peerConnection) {
                 this._addLogCallback?.(`Peer bağlantı durumu değişti: ${this.peerConnection.connectionState}`, 'webrtc');
            }
        };
        this.peerConnection.onsignalingstatechange = () => {
            if(this.peerConnection) {
                 this._addLogCallback?.(`Sinyalleşme durumu değişti: ${this.peerConnection.signalingState}`, 'webrtc');
            }
        }


      } else {
        this._addLogCallback?.('Olay işleyicileri için peer bağlantısı başlatılmadı.', 'error');
      }

    } catch (error) {
      this._addLogCallback?.(`WebRTC başlatma hatası: ${(error as Error).message}`, 'error');
      console.error('WebRTC başlatma hatası:', error);
      throw error;
    }
  },

  async createOffer(this: typeof webRTCHandlerImplementation): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection başlatılmadı.');
    this._addLogCallback?.('Teklif oluşturuluyor...', 'webrtc');
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    this._addLogCallback?.('Teklif oluşturuldu ve yerel açıklama ayarlandı.', 'webrtc');
    return offer;
  },

  async createAnswer(this: typeof webRTCHandlerImplementation, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('PeerConnection başlatılmadı.');
    this._addLogCallback?.('Teklif alındı, cevap oluşturuluyor...', 'webrtc');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    this._addLogCallback?.('Cevap oluşturuldu ve yerel açıklama ayarlandı.', 'webrtc');
    return answer;
  },

  async setRemoteDescription(this: typeof webRTCHandlerImplementation, description: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) throw new Error('PeerConnection başlatılmadı.');
    this._addLogCallback?.('Uzak açıklama ayarlanıyor...', 'webrtc');
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(description));
    this._addLogCallback?.('Uzak açıklama ayarlandı.', 'webrtc');
  },

  async addIceCandidate(this: typeof webRTCHandlerImplementation, candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) throw new Error('PeerConnection başlatılmadı.');
    if (!candidate || !candidate.candidate) {
        this._addLogCallback?.('Boş veya geçersiz ICE adayı eklenemedi.', 'error');
        return;
    }
    try {
        await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        this._addLogCallback?.('ICE adayı eklendi.', 'webrtc');
    } catch (e) {
        this._addLogCallback?.(`ICE adayı ekleme hatası: ${(e as Error).message}. Aday: ${candidate.candidate.substring(0,50)}...`, 'error');
    }
  },

  toggleAudio(this: typeof webRTCHandlerImplementation, enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => (track.enabled = enabled));
      this._addLogCallback?.(`Ses ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`, 'info');
    }
  },

  toggleVideo(this: typeof webRTCHandlerImplementation, enabled: boolean): void {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => (track.enabled = enabled));
      this._addLogCallback?.(`Video ${enabled ? 'etkinleştirildi' : 'devre dışı bırakıldı'}.`, 'info');
    }
  },

  closeConnection(this: typeof webRTCHandlerImplementation): void {
    this._addLogCallback?.('WebRTC bağlantısı kapatılıyor.', 'webrtc');
    if (this.peerConnection) {
      this.peerConnection.ontrack = null;
      this.peerConnection.onicecandidate = null;
      this.peerConnection.oniceconnectionstatechange = null;
      this.peerConnection.onsignalingstatechange = null;
      this.peerConnection.onconnectionstatechange = null;
      
      // Stop transceivers to fully tear down connection parts
      this.peerConnection.getTransceivers().forEach(transceiver => {
        transceiver.stop();
      });
      
      this.peerConnection.close();
      this.peerConnection = null; // Important to allow for re-initialization
      this._addLogCallback?.('Peer bağlantısı kapatıldı.', 'webrtc');
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
      this._addLogCallback?.('Yerel akış durduruldu.', 'webrtc');
    }
    this.remoteStream = null; // Clear remote stream reference
    this._addLogCallback?.('Uzak akış referansı temizlendi.', 'webrtc');
  },
};

export const WebRTCHandler: WebRTCService = webRTCHandlerImplementation;

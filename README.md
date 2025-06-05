
# Video Call App (English)

A WebRTC-based video calling application allowing users (envisioned as doctors/consultants) to log in, create unique video call rooms, and wait for another user (e.g., a patient) to join for a one-on-one video consultation. Features include audio/video toggling, call hang-up, connection logging, and user consent management.

## Features

*   **User Authentication:** Secure login for users.
*   **Room Management:**
    *   Authenticated users can create a unique room ID to start a session.
    *   The app is designed for two participants per room (one creator, one joiner).
*   **WebRTC Video/Audio Calls:** Real-time, peer-to-peer video and audio communication.
*   **Media Controls:** Toggle local audio (mute/unmute) and video (show/hide).
*   **Call Controls:** Hang up the current call (the room remains active for the creator to wait for a new participant).
*   **Connection Status:** Visual indicators for WebRTC ICE connection state.
*   **Real-time Logging:** A log panel displays connection events, WebRTC status, and socket messages for debugging and transparency.
*   **Consent Management:** Users must accept a privacy policy before using the application.
*   **Privacy Policy Display:** A dedicated screen to view the privacy policy.
*   **Responsive Design:** UI adapted for various screen sizes using Tailwind CSS.
*   **Centralized Configuration:** Environment-specific settings managed via `services/configService.ts`.

## Tech Stack

*   **Frontend:**
    *   React 19 (using ES Modules via `esm.sh`)
    *   TypeScript
    *   Tailwind CSS (via CDN)
    *   Socket.IO Client (for WebRTC signaling)
*   **Core Web Technologies:**
    *   WebRTC (for peer-to-peer media streams)
    *   HTML5 & CSS3

## Project Structure

*   `index.html`: The main entry point, loads Tailwind CSS, sets up import maps, and mounts the React app.
*   `index.tsx`: Initializes and renders the React application.
*   `App.tsx`: Main application component, handles routing, authentication state, and view management.
*   `constants.ts`: Stores truly static application-wide constants (e.g., SVG logo).
*   `types.ts`: Defines TypeScript interfaces and types.
*   `metadata.json`: Contains app metadata, including permissions for camera and microphone.
*   `demo.env`: Template for environment variables.
*   **`components/`**: Reusable UI components (`VideoPlayer.tsx`, `LogPanel.tsx`, `ConsentModal.tsx`, `icons.tsx`).
*   **`screens/`**: Top-level view components (`LoginScreen.tsx`, `RoomEntryScreen.tsx`, `CallScreen.tsx`, `PrivacyPolicyScreen.tsx`).
*   **`services/`**: Modules for specific functionalities:
    *   `configService.ts`: Central service for managing environment variables and application configuration.
    *   `authService.ts`: Handles user authentication.
    *   `webRTCService.ts`: Manages WebRTC connection logic.
*   **`contexts/`**: React Context providers for global state management (`AuthContext.ts`, `SocketContext.tsx`).

## Application Architecture

### 1. Frontend (Client-Side)

*   **React Components:**
    *   **Screens (`screens/`):** Manage the main views of the application (Login, Room Entry, Call, Privacy Policy).
    *   **UI Components (`components/`):** Reusable UI elements like video players, log panels, modals, and icons.
*   **Services (`services/`):**
    *   **`configService.ts`:** The single source of truth for all environment-dependent configurations (API URLs, TURN server details, API keys). It attempts to load values from `process.env`, `window.APP_CONFIG`, or falls back to defaults.
    *   **`authService.ts`:** Handles user login by communicating with the backend authentication server, stores and retrieves JWT tokens from `localStorage`.
    *   **`webRTCService.ts`:** Encapsulates all WebRTC logic, including initializing `RTCPeerConnection`, handling local and remote media streams, creating offers/answers, and managing ICE candidates. It uses TURN server details from `configService`.
*   **React Contexts (`contexts/`):**
    *   **`AuthContext`:** Provides global authentication state (isAuthenticated, userEmail) and login/logout methods throughout the application.
    *   **`SocketContext`:** Manages the Socket.IO connection to the signaling server. It provides the socket instance and an `emitMessage` function.

### 2. Backend (Assumed)

The frontend application relies on a backend that provides the following services:

*   **Authentication Server:**
    *   An endpoint (e.g., `/api/login`) that validates user credentials (email/password).
    *   Issues JWT (JSON Web Tokens) upon successful authentication.
*   **Signaling Server (Socket.IO):**
    *   Manages WebSocket connections from clients.
    *   Authenticates clients using the JWT token.
    *   Handles room logic: creating rooms, allowing users to join/leave rooms.
    *   Relays WebRTC signaling messages (offers, answers, ICE candidates) between peers in the same room.
    *   Broadcasts events like `user-joined`, `user-left`, `room-full`, `hang-up`.

### 3. External Services

*   **STUN/TURN Servers:**
    *   **STUN (Session Traversal Utilities for NAT):** Used to discover public IP addresses and port numbers. Google's public STUN servers are used by default.
    *   **TURN (Traversal Using Relays around NAT):** Used when direct peer-to-peer connection fails (e.g., due to symmetric NATs or firewalls). The application is configured with `iceTransportPolicy: 'relay'`, making a functional TURN server **mandatory**. TURN server details (URL, username, credential) are provided via `configService.ts`.

## Data Flow and Connection Establishment

1.  **Application Load & Consent:**
    *   `App.tsx` checks `localStorage` for `userConsentGiven`.
    *   If no consent, `ConsentModal` is shown. User views `PrivacyPolicyScreen` if desired.
    *   On acceptance, `userConsentGiven` is set in `localStorage`.

2.  **User Authentication:**
    *   If consent is given, `App.tsx` checks for an existing auth token via `getToken()` from `authService`.
    *   If no valid token, `LoginScreen` is displayed.
    *   User enters credentials. `LoginScreen` calls `loginUser()` in `authService`.
    *   `authService` sends a POST request to the backend's `/api/login` endpoint (URL from `Config.LOGIN_API_URL`).
    *   Backend validates credentials and returns a JWT and user info.
    *   `authService` stores the token in `localStorage` via `setToken()`.
    *   `App.tsx` updates `isAuthenticated` and `userEmail` in `AuthContext`, navigating to `RoomEntryScreen`.

3.  **WebSocket Connection (`SocketProvider`):**
    *   When `CallScreen` is about to be rendered (or any component wrapped by `SocketProvider`), `SocketProvider` initializes.
    *   It retrieves the auth token using `getToken()`.
    *   It establishes a Socket.IO connection to `Config.SOCKET_SERVER_URL` (with `Config.SOCKET_PATH`), passing the token in `auth.token` for server-side authentication.
    *   Connection status (`isConnected`) is managed within `SocketContext`.

4.  **Room Entry & Call Initialization (Two Users: User A - Creator, User B - Joiner):**

    *   **User A (e.g., Doctor) Enters `RoomEntryScreen`:**
        *   User A clicks "Start Waiting".
        *   `RoomEntryScreen` generates a unique `roomId` (e.g., `doc-username-timestamp`).
        *   `onJoinRoom(roomId)` is called, which updates `currentRoomId` in `App.tsx` and navigates to `CallScreen`.

    *   **User A in `CallScreen`:**
        *   `webRTCService.initialize()` is called:
            *   Requests camera/microphone access (`navigator.mediaDevices.getUserMedia()`) -> `localStream`.
            *   Creates `RTCPeerConnection` with ICE servers (STUN + TURN from `Config`).
            *   Sets up event listeners for ICE candidates, tracks (remote stream), and connection state changes.
            *   Adds `localStream` tracks to the `peerConnection`.
        *   `emitMessage('join-room', { roomId })` is sent via `SocketContext` to the Signaling Server.
        *   Log panel updated: "Joining room...", "WebRTC initialized...", "Local stream acquired."

    *   **User B (e.g., Patient) is given `roomId` by User A (out-of-band, e.g., via a link or message):**
        *   User B (after logging in and consenting) would typically enter this `roomId` (current app flow is simplified for the doctor to create and wait). For a two-sided flow, a mechanism for User B to input `roomId` and navigate to `CallScreen` would be needed.
        *   Assuming User B also lands on `CallScreen` with the same `roomId`:
            *   User B's `webRTCService.initialize()` runs similarly, acquiring their `localStream`.
            *   User B sends `emitMessage('join-room', { roomId })`.

    *   **Signaling Server Actions:**
        *   Receives `join-room` from User A. Marks User A as in the room.
        *   Receives `join-room` from User B. Marks User B as in the room.
        *   If room has two users, it typically broadcasts a `user-joined` event to both users, possibly including the socket ID of the *other* user.
        *   `CallScreen` listens for `user-joined`. The user with the "smaller" socket ID (a simple initiator determination logic) decides to create an offer.

5.  **WebRTC Signaling Process (Offer/Answer & ICE Candidates):**

    *   **Offer Creation (User A, the initiator):**
        *   `CallScreen` (User A) receives `user-joined` (with User B's ID, `otherUserId`).
        *   `webRTCService.createOffer()` is called:
            *   `peerConnection.createOffer()`.
            *   `peerConnection.setLocalDescription(offer)`.
        *   User A sends the offer to User B via the Signaling Server: `emitMessage('offer', { offer, targetSocketId: otherUserId, senderSocketId: socket.id, roomId })`.
        *   Log: "Creating offer...", "Offer sent."

    *   **Answer Creation (User B):**
        *   User B's `CallScreen` receives the `offer` event from the Signaling Server.
        *   `webRTCService.createAnswer(offer)` is called:
            *   `peerConnection.setRemoteDescription(offer)`.
            *   `peerConnection.createAnswer()`.
            *   `peerConnection.setLocalDescription(answer)`.
        *   User B sends the answer back to User A: `emitMessage('answer', { answer, targetSocketId: userA_socketId, senderSocketId: socket.id, roomId })`.
        *   Log: "Offer received.", "Creating answer...", "Answer sent."

    *   **Offer Acceptance (User A):**
        *   User A's `CallScreen` receives the `answer` event.
        *   `webRTCService.setRemoteDescription(answer)` is called.
        *   Log: "Answer received.", "Remote description set."

    *   **ICE Candidate Exchange (Both Users):**
        *   As `RTCPeerConnection` instances (on both sides) discover network paths, they trigger `onicecandidate` events.
        *   `webRTCService` captures these ICE candidates.
        *   Each user sends their candidates to the other user via the Signaling Server: `emitMessage('ice-candidate', { candidate, targetSocketId: otherUserId, senderSocketId: socket.id, roomId })`.
        *   Log: "ICE candidate generated...", "Sending ICE candidate..."
        *   When a user receives an `ice-candidate` event:
            *   `webRTCService.addIceCandidate(candidate)` is called.
            *   Log: "ICE candidate received.", "Added ICE candidate."

6.  **Media Stream Handling:**

    *   **Local Stream:** `webRTCService.localStream` is set in `CallScreen`'s state (`localStream`) and passed to a `VideoPlayer` component for local preview (muted).
    *   **Remote Stream:** When User A's `peerConnection.ontrack` event fires (triggered by User B adding tracks after setting local/remote descriptions), `webRTCService` captures the `event.streams[0]` (the remote media stream).
    *   This `remoteStream` is passed via callback to `CallScreen`, set in its state, and then passed to another `VideoPlayer` component to display User B's video/audio. The same happens vice-versa for User B.
    *   Log: "Remote track received.", "Remote stream set."

7.  **Call Termination/Leaving:**
    *   **User Hangs Up (`handleHangUp` in `CallScreen`):**
        *   Sends a `hang-up` signal to the other user via the signaling server.
        *   Calls `webRTCService.closeConnection()`: stops media tracks, closes `peerConnection`.
        *   `remoteStream` and `otherUserId` are cleared. WebRTC is re-initialized to wait for a new peer.
    *   **User Leaves Room (`onLeaveCall` or `logout`):**
        *   Similar to hang up, but also navigates away from `CallScreen`.
        *   Socket.IO `leave-room` message sent.
    *   **User Left Signal (`user-left`):**
        *   If the other user disconnects or leaves, the Signaling Server sends `user-left`.
        *   `CallScreen` cleans up: `remoteStream` cleared, `otherUserId` cleared, `webRTCService.closeConnection()`, and re-initializes WebRTC.

## Setup and Running the Application

### Prerequisites

1.  A modern web browser with support for ES Modules, WebRTC (Camera/Microphone access).
2.  A backend server that provides:
    *   An authentication endpoint (configured via environment variables, see below).
    *   A Socket.IO signaling server (configured via environment variables).
    *   The backend needs to handle room logic, user joining, and relaying WebRTC signaling messages.
3.  A TURN server for reliable WebRTC connections. The application is configured with `iceTransportPolicy: 'relay'`, making a functional TURN server crucial.

### Environment Variables & Configuration

This project uses a centralized configuration service (`services/configService.ts`) that loads settings from environment variables. These variables must be made available to the client-side JavaScript by your **hosting environment**.

1.  **Create `.env` file:**
    Copy `demo.env` to `.env`:
    ```bash
    cp demo.env .env
    ```
2.  **Edit `.env`:**
    Fill in the required values in your local `.env` file. This file tells your *hosting environment* (during local development or deployment) what values to use.
    Refer to `demo.env` for the list of variables (e.g., `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SOCKET_SERVER_URL`, `NEXT_PUBLIC_TURN_URL`, `API_KEY` for Gemini).

3.  **How Configuration is Loaded Client-Side:**
    The `services/configService.ts` attempts to find these values in the following order:
    *   **`process.env.YOUR_VARIABLE_NAME`**: If your hosting platform (like Vercel, Netlify, or AI Studio) injects server-side environment variables into a `process.env` object accessible by client-side code.
    *   **`window.APP_CONFIG.YOUR_VARIABLE_NAME`**: If your server serving `index.html` injects a global JavaScript object. For example, you could modify your server to include:
        ```html
        <script>
          window.APP_CONFIG = {
            NEXT_PUBLIC_API_BASE_URL: "https://your-api.com/api",
            NEXT_PUBLIC_SOCKET_SERVER_URL: "https://your-socket-server.com",
            NEXT_PUBLIC_SOCKET_PATH: "/socket.io",
            NEXT_PUBLIC_TURN_URL: "turn:your.turn.server:3478",
            NEXT_PUBLIC_TURN_USERNAME: "your_turn_username",
            NEXT_PUBLIC_TURN_CREDENTIAL: "your_turn_password",
            API_KEY: "your_gemini_api_key"
            // ... other config values from your server's environment
          };
        </script>
        ```
        This script tag should be placed in `index.html` *before* your main application script (`/index.tsx`).
    *   **Default Placeholder Values**: If not found in the above, the service falls back to placeholders defined within `configService.ts` (which will likely not work for a real deployment and will show warnings in the console).

    **It is your responsibility to ensure your hosting environment makes these variables accessible through one of these mechanisms.**

### Backend Configuration

*   Ensure your backend authentication endpoint (e.g., `Config.LOGIN_API_URL`) is running.
*   Ensure your Socket.IO signaling server (e.g., `Config.SOCKET_SERVER_URL` and `Config.SOCKET_PATH`) is running.
*   Configure CORS on your backend to accept requests from the origin where you are serving the frontend.

### Running the Frontend

Since this application doesn't have a dedicated build step and uses ES modules directly:

1.  **Serve `index.html`:**
    Use any simple HTTP server. Examples:
    *   `npx serve .`
    *   `python -m http.server`
    *   VS Code "Live Server" extension.
    *   If you're using a platform like AI Studio, it will handle serving.

2.  **Access the Application:**
    Open your web browser and navigate to the address provided by your HTTP server or platform.

## Key Configuration Points

*   **`services/configService.ts`**: The central point for all externalized configuration.
*   **`services/webRTCService.ts`**: Constructs `ICE_SERVERS` using STUN defaults and TURN details from `ConfigService`. The `iceTransportPolicy: 'relay'` setting makes a working TURN server (configured via environment variables) **mandatory**.
*   **`.env` (created from `demo.env`)**: Defines values for your *environment*. It's not directly read by the client-side JS but by the hosting/serving mechanism. **DO NOT commit `.env` to version control.**

## Important Notes

*   **TURN Server:** With `iceTransportPolicy: 'relay'`, a correctly configured TURN server is **essential**. Connections will likely fail without it.
*   **Security:**
    *   Keep your `.env` file (containing credentials) out of version control.
    *   The most secure way to handle TURN credentials is to fetch temporary, short-lived credentials from a backend API endpoint just before a call starts. This app currently expects them via environment variables made available through `configService.ts`.
*   **Permissions:** Camera and microphone permissions are required and requested by the application.

## Styling

*   **Tailwind CSS:** Loaded via CDN.
*   **Global Styles:** In `index.html`.
*   **Custom Scrollbar:** In `LogPanel.tsx`.

---

# Video Call Uygulaması (Türkçe)

Kullanıcıların (doktorlar/danışmanlar olarak tasavvur edilen) giriş yapmasına, benzersiz video görüşme odaları oluşturmasına ve başka bir kullanıcının (örneğin bir hasta) bire bir video danışmanlığı için katılmasını beklemesine olanak tanıyan WebRTC tabanlı bir video görüşme uygulamasıdır. Özellikler arasında ses/video açma/kapama, görüşmeyi sonlandırma, bağlantı günlüğü tutma ve kullanıcı onayı yönetimi bulunmaktadır.

## Özellikler

*   **Kullanıcı Kimlik Doğrulaması:** Kullanıcılar için güvenli giriş.
*   **Oda Yönetimi:**
    *   Kimliği doğrulanmış kullanıcılar bir oturum başlatmak için benzersiz bir oda ID'si oluşturabilir.
    *   Uygulama, oda başına iki katılımcı için tasarlanmıştır (bir oluşturucu, bir katılımcı).
*   **WebRTC Video/Sesli Görüşmeler:** Gerçek zamanlı, eşler arası (peer-to-peer) video ve sesli iletişim.
*   **Medya Kontrolleri:** Yerel sesi (sessize al/aç) ve videoyu (göster/gizle) açıp kapatma.
*   **Görüşme Kontrolleri:** Mevcut görüşmeyi sonlandırma (oluşturucu yeni bir katılımcı beklemesi için oda aktif kalır).
*   **Bağlantı Durumu:** WebRTC ICE bağlantı durumu için görsel göstergeler.
*   **Gerçek Zamanlı Günlük Kaydı:** Bir günlük paneli, hata ayıklama ve şeffaflık için bağlantı olaylarını, WebRTC durumunu ve soket mesajlarını görüntüler.
*   **Onay Yönetimi:** Kullanıcılar uygulamayı kullanmadan önce bir gizlilik politikasını kabul etmelidir.
*   **Gizlilik Politikası Görüntüleme:** Gizlilik politikasını görüntülemek için özel bir ekran.
*   **Duyarlı Tasarım:** Tailwind CSS kullanılarak çeşitli ekran boyutlarına uyarlanmış kullanıcı arayüzü.
*   **Merkezi Yapılandırma:** Ortama özgü ayarlar, `services/configService.ts` aracılığıyla yönetilir.

## Teknoloji Yığını

*   **Frontend:**
    *   React 19 (`esm.sh` üzerinden ES Modülleri kullanılarak)
    *   TypeScript
    *   Tailwind CSS (CDN üzerinden)
    *   Socket.IO Client (WebRTC sinyalleşmesi için)
*   **Temel Web Teknolojileri:**
    *   WebRTC (eşler arası medya akışları için)
    *   HTML5 & CSS3

## Proje Yapısı

*   `index.html`: Ana giriş noktası, Tailwind CSS'i yükler, import map'leri ayarlar ve React uygulamasını bağlar.
*   `index.tsx`: React uygulamasını başlatır ve render eder.
*   `App.tsx`: Ana uygulama bileşeni, yönlendirme, kimlik doğrulama durumu ve görünüm yönetimini yapar.
*   `constants.ts`: Gerçekten statik, uygulama genelindeki sabitleri (örneğin, SVG logo) saklar.
*   `types.ts`: TypeScript arayüzlerini ve türlerini tanımlar.
*   `metadata.json`: Kamera ve mikrofon izinleri de dahil olmak üzere uygulama meta verilerini içerir.
*   `demo.env`: Ortam değişkenleri için şablon.
*   **`components/`**: Yeniden kullanılabilir UI bileşenleri (`VideoPlayer.tsx`, `LogPanel.tsx`, `ConsentModal.tsx`, `icons.tsx`).
*   **`screens/`**: Üst düzey görünüm bileşenleri (`LoginScreen.tsx`, `RoomEntryScreen.tsx`, `CallScreen.tsx`, `PrivacyPolicyScreen.tsx`).
*   **`services/`**: Belirli işlevler için modüller:
    *   `configService.ts`: Ortam değişkenlerini ve uygulama yapılandırmasını yönetmek için merkezi servis.
    *   `authService.ts`: Kullanıcı kimlik doğrulamasını yönetir.
    *   `webRTCService.ts`: WebRTC bağlantı mantığını yönetir.
*   **`contexts/`**: Global durum yönetimi için React Context sağlayıcıları (`AuthContext.ts`, `SocketContext.tsx`).

## Uygulama Mimarisi

### 1. Frontend (İstemci Tarafı)

*   **React Bileşenleri:**
    *   **Ekranlar (`screens/`):** Uygulamanın ana görünümlerini yönetir (Giriş, Oda Girişi, Görüşme, Gizlilik Politikası).
    *   **UI Bileşenleri (`components/`):** Video oynatıcılar, günlük panelleri, modallar ve ikonlar gibi yeniden kullanılabilir UI öğeleri.
*   **Servisler (`services/`):**
    *   **`configService.ts`:** Tüm ortama bağlı yapılandırmalar (API URL'leri, TURN sunucu detayları, API anahtarları) için tek doğru kaynaktır. Değerleri `process.env`, `window.APP_CONFIG`'dan yüklemeye çalışır veya varsayılanlara geri döner.
    *   **`authService.ts`:** Backend kimlik doğrulama sunucusuyla iletişim kurarak kullanıcı girişini yönetir, JWT token'larını `localStorage`'da saklar ve alır.
    *   **`webRTCService.ts`:** `RTCPeerConnection` başlatma, yerel ve uzak medya akışlarını yönetme, offer/answer oluşturma ve ICE adaylarını yönetme dahil tüm WebRTC mantığını kapsar. `configService`'den TURN sunucu detaylarını kullanır.
*   **React Context'leri (`contexts/`):**
    *   **`AuthContext`:** Uygulama genelinde global kimlik doğrulama durumu (isAuthenticated, userEmail) ve giriş/çıkış yöntemleri sağlar.
    *   **`SocketContext`:** Sinyalleşme sunucusuna Socket.IO bağlantısını yönetir. Soket örneğini ve bir `emitMessage` işlevini sağlar.

### 2. Backend (Varsayılan)

Frontend uygulaması, aşağıdaki hizmetleri sağlayan bir backend'e dayanır:

*   **Kimlik Doğrulama Sunucusu:**
    *   Kullanıcı kimlik bilgilerini (e-posta/şifre) doğrulayan bir endpoint (örneğin, `/api/login`).
    *   Başarılı kimlik doğrulamasında JWT (JSON Web Token) yayınlar.
*   **Sinyalleşme Sunucusu (Socket.IO):**
    *   İstemcilerden gelen WebSocket bağlantılarını yönetir.
    *   JWT token kullanarak istemcileri doğrular.
    *   Oda mantığını yönetir: oda oluşturma, kullanıcıların odalara katılmasına/ayrılmasına izin verme.
    *   Aynı odadaki eşler arasında WebRTC sinyalleşme mesajlarını (offer, answer, ICE adayları) iletir.
    *   `user-joined`, `user-left`, `room-full`, `hang-up` gibi olayları yayınlar.

### 3. Harici Servisler

*   **STUN/TURN Sunucuları:**
    *   **STUN (Session Traversal Utilities for NAT):** Genel IP adreslerini ve port numaralarını keşfetmek için kullanılır. Varsayılan olarak Google'ın genel STUN sunucuları kullanılır.
    *   **TURN (Traversal Using Relays around NAT):** Doğrudan eşler arası bağlantı başarısız olduğunda (örneğin, simetrik NAT'lar veya güvenlik duvarları nedeniyle) kullanılır. Uygulama `iceTransportPolicy: 'relay'` ile yapılandırılmıştır, bu da işlevsel bir TURN sunucusunu **zorunlu** kılar. TURN sunucu detayları (URL, kullanıcı adı, şifre) `configService.ts` aracılığıyla sağlanır.

## Veri Akışı ve Bağlantı Kurulumu

1.  **Uygulama Yükleme & Onay:**
    *   `App.tsx`, `localStorage`'da `userConsentGiven` olup olmadığını kontrol eder.
    *   Onay yoksa, `ConsentModal` gösterilir. Kullanıcı isterse `PrivacyPolicyScreen`'i görüntüler.
    *   Kabul edildiğinde, `userConsentGiven`, `localStorage`'a kaydedilir.

2.  **Kullanıcı Kimlik Doğrulaması:**
    *   Onay verilmişse, `App.tsx`, `authService`'den `getToken()` aracılığıyla mevcut bir kimlik doğrulama belirtecini kontrol eder.
    *   Geçerli bir belirteç yoksa, `LoginScreen` görüntülenir.
    *   Kullanıcı kimlik bilgilerini girer. `LoginScreen`, `authService`'deki `loginUser()` fonksiyonunu çağırır.
    *   `authService`, backend'in `/api/login` endpoint'ine (URL, `Config.LOGIN_API_URL`'den alınır) bir POST isteği gönderir.
    *   Backend kimlik bilgilerini doğrular ve bir JWT ile kullanıcı bilgilerini döndürür.
    *   `authService`, belirteci `setToken()` aracılığıyla `localStorage`'a kaydeder.
    *   `App.tsx`, `AuthContext`'teki `isAuthenticated` ve `userEmail`'i günceller, `RoomEntryScreen`'e yönlendirir.

3.  **WebSocket Bağlantısı (`SocketProvider`):**
    *   `CallScreen` render edilmek üzereyken (veya `SocketProvider` tarafından sarmalanan herhangi bir bileşen), `SocketProvider` başlatılır.
    *   `getToken()` kullanarak kimlik doğrulama belirtecini alır.
    *   `Config.SOCKET_SERVER_URL`'e (`Config.SOCKET_PATH` ile) bir Socket.IO bağlantısı kurar, sunucu tarafı kimlik doğrulaması için belirteci `auth.token` içinde iletir.
    *   Bağlantı durumu (`isConnected`), `SocketContext` içinde yönetilir.

4.  **Odaya Giriş & Çağrı Başlatma (İki Kullanıcı: Kullanıcı A - Oluşturucu, Kullanıcı B - Katılımcı):**

    *   **Kullanıcı A (örneğin, Doktor) `RoomEntryScreen`'e Girer:**
        *   Kullanıcı A "Beklemeye Başla"ya tıklar.
        *   `RoomEntryScreen`, benzersiz bir `roomId` oluşturur (örneğin, `doc-kullaniciadi-zamanDamgasi`).
        *   `onJoinRoom(roomId)` çağrılır, bu da `App.tsx`'deki `currentRoomId`'yi günceller ve `CallScreen`'e yönlendirir.

    *   **`CallScreen`'deki Kullanıcı A:**
        *   `webRTCService.initialize()` çağrılır:
            *   Kamera/mikrofon erişimi istenir (`navigator.mediaDevices.getUserMedia()`) -> `localStream`.
            *   ICE sunucularıyla (STUN + `Config`'den TURN) `RTCPeerConnection` oluşturulur.
            *   ICE adayları, izler (uzak akış) ve bağlantı durumu değişiklikleri için olay dinleyicileri ayarlanır.
            *   `localStream` izleri `peerConnection`'a eklenir.
        *   `SocketContext` aracılığıyla Sinyalleşme Sunucusuna `emitMessage('join-room', { roomId })` gönderilir.
        *   Günlük paneli güncellenir: "Odaya katılıyor...", "WebRTC başlatıldı...", "Yerel akış alındı."

    *   **Kullanıcı B (örneğin, Hasta) `roomId`'yi Kullanıcı A'dan alır (bant dışı, örneğin bir bağlantı veya mesaj yoluyla):**
        *   Kullanıcı B (giriş yapıp onay verdikten sonra) tipik olarak bu `roomId`'yi girer (mevcut uygulama akışı, doktorun oluşturup beklemesi için basitleştirilmiştir). İki taraflı bir akış için, Kullanıcı B'nin `roomId`'yi girmesi ve `CallScreen`'e gitmesi için bir mekanizma gerekir.
        *   Kullanıcı B'nin de aynı `roomId` ile `CallScreen`'e geldiği varsayıldığında:
            *   Kullanıcı B'nin `webRTCService.initialize()` fonksiyonu benzer şekilde çalışır, kendi `localStream`'ini alır.
            *   Kullanıcı B, `emitMessage('join-room', { roomId })` gönderir.

    *   **Sinyalleşme Sunucusu Eylemleri:**
        *   Kullanıcı A'dan `join-room` alır. Kullanıcı A'yı odada olarak işaretler.
        *   Kullanıcı B'den `join-room` alır. Kullanıcı B'yi odada olarak işaretler.
        *   Oda iki kullanıcıya sahipse, genellikle her iki kullanıcıya da bir `user-joined` olayı yayınlar, muhtemelen *diğer* kullanıcının soket ID'sini içerir.
        *   `CallScreen`, `user-joined` olayını dinler. "Daha küçük" soket ID'sine sahip kullanıcı (basit bir başlatıcı belirleme mantığı) bir teklif oluşturmaya karar verir.

5.  **WebRTC Sinyalleşme Süreci (Offer/Answer & ICE Adayları):**

    *   **Teklif Oluşturma (Kullanıcı A, başlatıcı):**
        *   `CallScreen` (Kullanıcı A), `user-joined` olayını alır (Kullanıcı B'nin ID'si, `otherUserId` ile).
        *   `webRTCService.createOffer()` çağrılır:
            *   `peerConnection.createOffer()`.
            *   `peerConnection.setLocalDescription(offer)`.
        *   Kullanıcı A, teklifi Sinyalleşme Sunucusu aracılığıyla Kullanıcı B'ye gönderir: `emitMessage('offer', { offer, targetSocketId: otherUserId, senderSocketId: socket.id, roomId })`.
        *   Günlük: "Teklif oluşturuluyor...", "Teklif gönderildi."

    *   **Cevap Oluşturma (Kullanıcı B):**
        *   Kullanıcı B'nin `CallScreen`'i, Sinyalleşme Sunucusundan `offer` olayını alır.
        *   `webRTCService.createAnswer(offer)` çağrılır:
            *   `peerConnection.setRemoteDescription(offer)`.
            *   `peerConnection.createAnswer()`.
            *   `peerConnection.setLocalDescription(answer)`.
        *   Kullanıcı B, cevabı Sinyalleşme Sunucusu aracılığıyla Kullanıcı A'ya geri gönderir: `emitMessage('answer', { answer, targetSocketId: userA_socketId, senderSocketId: socket.id, roomId })`.
        *   Günlük: "Teklif alındı.", "Cevap oluşturuluyor...", "Cevap gönderildi."

    *   **Teklif Kabulü (Kullanıcı A):**
        *   Kullanıcı A'nın `CallScreen`'i `answer` olayını alır.
        *   `webRTCService.setRemoteDescription(answer)` çağrılır.
        *   Günlük: "Cevap alındı.", "Uzak açıklama ayarlandı."

    *   **ICE Aday Değişimi (Her İki Kullanıcı):**
        *   `RTCPeerConnection` örnekleri (her iki tarafta da) ağ yollarını keşfettikçe, `onicecandidate` olaylarını tetiklerler.
        *   `webRTCService` bu ICE adaylarını yakalar.
        *   Her kullanıcı, adaylarını Sinyalleşme Sunucusu aracılığıyla diğer kullanıcıya gönderir: `emitMessage('ice-candidate', { candidate, targetSocketId: otherUserId, senderSocketId: socket.id, roomId })`.
        *   Günlük: "ICE adayı oluşturuldu...", "ICE adayı gönderiliyor..."
        *   Bir kullanıcı `ice-candidate` olayı aldığında:
            *   `webRTCService.addIceCandidate(candidate)` çağrılır.
            *   Günlük: "ICE adayı alındı.", "ICE adayı eklendi."

6.  **Medya Akışı Yönetimi:**

    *   **Yerel Akış:** `webRTCService.localStream`, `CallScreen`'in durumunda (`localStream`) ayarlanır ve yerel önizleme için (sessize alınmış) bir `VideoPlayer` bileşenine iletilir.
    *   **Uzak Akış:** Kullanıcı A'nın `peerConnection.ontrack` olayı tetiklendiğinde (Kullanıcı B'nin yerel/uzak açıklamaları ayarladıktan sonra izleri eklemesiyle tetiklenir), `webRTCService`, `event.streams[0]`'ı (uzak medya akışı) yakalar.
    *   Bu `remoteStream`, geri arama yoluyla `CallScreen`'e iletilir, durumunda ayarlanır ve ardından Kullanıcı B'nin video/sesini görüntülemek için başka bir `VideoPlayer` bileşenine iletilir. Aynı işlem Kullanıcı B için de tersi şekilde gerçekleşir.
    *   Günlük: "Uzak iz alındı.", "Uzak akış ayarlandı."

7.  **Çağrı Sonlandırma/Ayrılma:**
    *   **Kullanıcı Çağrıyı Kapatır (`handleHangUp` içinde `CallScreen`):**
        *   Sinyalleşme sunucusu aracılığıyla diğer kullanıcıya bir `hang-up` sinyali gönderir.
        *   `webRTCService.closeConnection()` çağrılır: medya izlerini durdurur, `peerConnection`'ı kapatır.
        *   `remoteStream` ve `otherUserId` temizlenir. WebRTC yeni bir eş beklemek üzere yeniden başlatılır.
    *   **Kullanıcı Odadan Ayrılır (`onLeaveCall` veya `logout`):**
        *   Çağrıyı kapatmaya benzer, ancak aynı zamanda `CallScreen`'den de çıkar.
        *   Socket.IO `leave-room` mesajı gönderilir.
    *   **Kullanıcı Ayrıldı Sinyali (`user-left`):**
        *   Diğer kullanıcı bağlantıyı keserse veya ayrılırsa, Sinyalleşme Sunucusu `user-left` gönderir.
        *   `CallScreen` temizler: `remoteStream` temizlenir, `otherUserId` temizlenir, `webRTCService.closeConnection()` ve WebRTC'yi yeniden başlatır.


## Kurulum ve Çalıştırma

### Önkoşullar

1.  ES Modülleri, WebRTC (Kamera/Mikrofon erişimi) desteği olan modern bir web tarayıcısı.
2.  Aşağıdakileri sağlayan bir backend sunucusu:
    *   Bir kimlik doğrulama endpoint'i (aşağıda açıklandığı gibi ortam değişkenleri aracılığıyla yapılandırılır).
    *   Bir Socket.IO sinyalleşme sunucusu (ortam değişkenleri aracılığıyla yapılandırılır).
    *   Backend'in oda mantığını, kullanıcı katılımını ve WebRTC sinyalleşme mesajlarını iletmeyi işlemesi gerekir.
3.  Güvenilir WebRTC bağlantıları için bir TURN sunucusu. Uygulama, `iceTransportPolicy: 'relay'` ile yapılandırılmıştır, bu da işlevsel bir TURN sunucusunu kritik hale getirir.

### Ortam Değişkenleri & Yapılandırma

Bu proje, ayarları ortam değişkenlerinden yükleyen merkezi bir yapılandırma hizmeti (`services/configService.ts`) kullanır. Bu değişkenler, **barındırma ortamınız** tarafından istemci tarafı JavaScript'e erişilebilir hale getirilmelidir.

1.  **`.env` dosyası oluşturun:**
    `demo.env` dosyasını `.env` olarak kopyalayın:
    ```bash
    cp demo.env .env
    ```
2.  **`.env` dosyasını düzenleyin:**
    Yerel `.env` dosyanızdaki gerekli değerleri doldurun. Bu dosya, *barındırma ortamınıza* (yerel geliştirme veya dağıtım sırasında) hangi değerleri kullanacağını söyler.
    Değişkenlerin listesi için `demo.env` dosyasına bakın (örneğin, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SOCKET_SERVER_URL`, `NEXT_PUBLIC_TURN_URL`, Gemini için `API_KEY`).

3.  **Yapılandırmanın İstemci Tarafında Yüklenmesi:**
    `services/configService.ts` bu değerleri aşağıdaki sırayla bulmaya çalışır:
    *   **`process.env.DEGISKEN_ADINIZ`**: Barındırma platformunuz (Vercel, Netlify veya AI Studio gibi) sunucu tarafı ortam değişkenlerini istemci tarafı kod tarafından erişilebilen bir `process.env` nesnesine enjekte ediyorsa.
    *   **`window.APP_CONFIG.DEGISKEN_ADINIZ`**: `index.html`'i sunan sunucunuz global bir JavaScript nesnesi enjekte ediyorsa. Örneğin, sunucunuzu aşağıdaki gibi değiştirebilirsiniz:
        ```html
        <script>
          window.APP_CONFIG = {
            NEXT_PUBLIC_API_BASE_URL: "https://sizin-api.com/api",
            NEXT_PUBLIC_SOCKET_SERVER_URL: "https://sizin-soket-sunucunuz.com",
            NEXT_PUBLIC_SOCKET_PATH: "/socket.io",
            NEXT_PUBLIC_TURN_URL: "turn:sizin.turn.sunucunuz:3478",
            NEXT_PUBLIC_TURN_USERNAME: "sizin_turn_kullanici_adiniz",
            NEXT_PUBLIC_TURN_CREDENTIAL: "sizin_turn_sifreniz",
            API_KEY: "sizin_gemini_api_anahtariniz"
            // ... sunucunuzun ortamından diğer yapılandırma değerleri
          };
        </script>
        ```
        Bu script etiketi, ana uygulama script'inizden (`/index.tsx`) *önce* `index.html`'e yerleştirilmelidir.
    *   **Varsayılan Yer Tutucu Değerler**: Yukarıdakilerde bulunamazsa, servis `configService.ts` içinde tanımlanan yer tutuculara geri döner (bu, gerçek bir dağıtım için muhtemelen çalışmayacak ve konsolda uyarılar gösterecektir).

    **Barındırma ortamınızın bu değişkenleri bu mekanizmalardan biriyle erişilebilir kılmasını sağlamak sizin sorumluluğunuzdadır.**

### Backend Yapılandırması

*   Backend kimlik doğrulama endpoint'inizin (örneğin, `Config.LOGIN_API_URL`) çalıştığından emin olun.
*   Socket.IO sinyalleşme sunucunuzun (örneğin, `Config.SOCKET_SERVER_URL` ve `Config.SOCKET_PATH`) çalıştığından emin olun.
*   Frontend'i sunduğunuz kaynaktan gelen istekleri kabul etmek için backend'inizde CORS'u yapılandırın.

### Frontend'i Çalıştırma

Bu uygulama özel bir derleme adımına sahip olmadığı ve doğrudan ES modüllerini kullandığı için:

1.  **`index.html`'i sunun:**
    Herhangi bir basit HTTP sunucusu kullanın. Örnekler:
    *   `npx serve .`
    *   `python -m http.server`
    *   VS Code "Live Server" eklentisi.
    *   AI Studio gibi bir platform kullanıyorsanız, sunumu o halledecektir.

2.  **Uygulamaya Erişin:**
    Web tarayıcınızı açın ve HTTP sunucunuz veya platformunuz tarafından sağlanan adrese gidin.

## Önemli Yapılandırma Noktaları

*   **`services/configService.ts`**: Tüm haricileştirilmiş yapılandırmalar için merkezi nokta.
*   **`services/webRTCService.ts`**: STUN varsayılanlarını ve `ConfigService`'den TURN ayrıntılarını kullanarak `ICE_SERVERS`'ı oluşturur. `iceTransportPolicy: 'relay'` ayarı, çalışan bir TURN sunucusunu (ortam değişkenleri aracılığıyla yapılandırılır) **zorunlu** kılar.
*   **`.env` (`demo.env`'den oluşturulur)**: *Ortamınız* için değerleri tanımlar. Doğrudan istemci tarafı JS tarafından okunmaz, barındırma/sunum mekanizması tarafından okunur. **`.env` dosyasını sürüm kontrolüne göndermeyin.**

## Önemli Notlar

*   **TURN Sunucusu:** `iceTransportPolicy: 'relay'` ile doğru yapılandırılmış bir TURN sunucusu **şarttır**. Bağlantılar onsuz büyük olasılıkla başarısız olacaktır.
*   **Güvenlik:**
    *   `.env` dosyanızı (kimlik bilgilerini içeren) sürüm kontrolünden uzak tutun.
    *   TURN kimlik bilgilerini işlemenin en güvenli yolu, bir görüşme başlamadan hemen önce bir backend API endpoint'inden geçici, kısa ömürlü kimlik bilgileri almaktır. Bu uygulama şu anda bunları `configService.ts` aracılığıyla sunulan ortam değişkenleri yoluyla beklemektedir.
*   **İzinler:** Kamera ve mikrofon izinleri gereklidir ve uygulama tarafından istenir.

## Stil

*   **Tailwind CSS:** CDN üzerinden yüklenir.
*   **Global Stiller:** `index.html` içinde.
*   **Özel Kaydırma Çubuğu:** `LogPanel.tsx` içinde.


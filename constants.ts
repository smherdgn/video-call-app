
export const API_BASE_URL = 'https://yourdomain.com/api'; // Replace with your actual API base URL
export const LOGIN_API_URL = `${API_BASE_URL}/login`;
export const SOCKET_SERVER_URL = 'https://yourdomain.com'; // Replace with your actual socket server URL
export const SOCKET_PATH = '/api/socket';

// IMPORTANT: Replace with your actual TURN server details.
// These would typically come from environment variables in a Next.js app.
const NEXT_PUBLIC_TURN_URL = process.env.NEXT_PUBLIC_TURN_URL || 'turn:your.turn.server.com:3478';
const NEXT_PUBLIC_TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME || 'your_turn_username';
const NEXT_PUBLIC_TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL || 'your_turn_password';

export const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  // Add your configured TURN server here for "relay" policy to work reliably
  // Ensure your TURN server is properly configured and secured (e.g., with TLS for TURNS)
  // Example using placeholders (replace with actual values or remove if no TURN server):
  // {
  //   urls: NEXT_PUBLIC_TURN_URL, // e.g., 'turn:yourdomain.com:3478' or 'turns:yourdomain.com:443'
  //   username: NEXT_PUBLIC_TURN_USERNAME,
  //   credential: NEXT_PUBLIC_TURN_CREDENTIAL,
  // },
];

// If you have a TURN server that doesn't require authentication (not recommended for production)
// you might have an entry like:
// { urls: 'turn:public.turn.server.com:3478' }

// For iceTransportPolicy: 'relay' to be effective, at least one TURN server MUST be configured.
// If no TURN servers are provided or they are unreachable, 'relay' policy might fail connection.


export const LOGO_SVG_STRING = `
<svg width="120" height="40" viewBox="0 0 120 40" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bookmezaNewLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366F1;" /> 
      <stop offset="100%" style="stop-color:#8B5CF6;" />
    </linearGradient>
  </defs>
  <rect width="120" height="40" rx="8" fill="url(#bookmezaNewLogoGradient)"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Inter, sans-serif" font-size="20" fill="white" font-weight="bold">
    VC
  </text>
</svg>
`;
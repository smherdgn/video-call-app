// services/configService.ts

interface AppConfig {
  API_BASE_URL: string;
  LOGIN_API_URL: string;
  SOCKET_SERVER_URL: string;
  SOCKET_PATH: string;
  TURN_URL?: string;
  TURN_USERNAME?: string;
  TURN_CREDENTIAL?: string;
  GEMINI_API_KEY?: string;
}

// Default placeholder values.
// It's crucial that the actual values are provided by the environment.
const DEFAULT_PLACEHOLDER_API_BASE_URL = 'http://localhost:3001/api'; // Replace with a sensible default or ensure env provides
const DEFAULT_PLACEHOLDER_SOCKET_SERVER_URL = 'http://localhost:3001'; // Replace or ensure env provides
const DEFAULT_SOCKET_PATH = '/api/socket';

let SourcedConfig: AppConfig | undefined;

const getConfig = (): AppConfig => {
  if (SourcedConfig) {
    return SourcedConfig;
  }

  // Helper to get value from potential sources: process.env, window.APP_CONFIG
  // The `NEXT_PUBLIC_` prefix is a common convention for client-side env vars.
  const getValue = (key: string, nextPublicKey?: string): string | undefined => {
    const primaryKey = nextPublicKey || key; // e.g., NEXT_PUBLIC_API_BASE_URL
    const secondaryKey = key; // e.g., API_BASE_URL

    if (typeof process !== 'undefined' && process.env) {
      if (process.env[primaryKey]) return process.env[primaryKey];
      if (process.env[secondaryKey]) return process.env[secondaryKey];
    }
    if (typeof window !== 'undefined' && (window as any).APP_CONFIG) {
      if ((window as any).APP_CONFIG[primaryKey]) return (window as any).APP_CONFIG[primaryKey];
      if ((window as any).APP_CONFIG[secondaryKey]) return (window as any).APP_CONFIG[secondaryKey];
    }
    return undefined;
  };

  const apiBaseUrl = getValue('API_BASE_URL', 'NEXT_PUBLIC_API_BASE_URL') || DEFAULT_PLACEHOLDER_API_BASE_URL;
  const socketServerUrl = getValue('SOCKET_SERVER_URL', 'NEXT_PUBLIC_SOCKET_SERVER_URL') || DEFAULT_PLACEHOLDER_SOCKET_SERVER_URL;

  SourcedConfig = Object.freeze({
    API_BASE_URL: apiBaseUrl,
    LOGIN_API_URL: `${apiBaseUrl}/login`, // Derived
    SOCKET_SERVER_URL: socketServerUrl,
    SOCKET_PATH: getValue('SOCKET_PATH', 'NEXT_PUBLIC_SOCKET_PATH') || DEFAULT_SOCKET_PATH,
    TURN_URL: getValue('TURN_URL', 'NEXT_PUBLIC_TURN_URL'),
    TURN_USERNAME: getValue('TURN_USERNAME', 'NEXT_PUBLIC_TURN_USERNAME'),
    TURN_CREDENTIAL: getValue('TURN_CREDENTIAL', 'NEXT_PUBLIC_TURN_CREDENTIAL'),
    GEMINI_API_KEY: getValue('API_KEY'), // As per @google/genai guidelines for API_KEY
  });

  if (apiBaseUrl === DEFAULT_PLACEHOLDER_API_BASE_URL) {
    console.warn(`ConfigService: API_BASE_URL is using a default placeholder value: ${DEFAULT_PLACEHOLDER_API_BASE_URL}. Ensure it's configured via environment variables (e.g., NEXT_PUBLIC_API_BASE_URL) or window.APP_CONFIG.`);
  }
  if (socketServerUrl === DEFAULT_PLACEHOLDER_SOCKET_SERVER_URL) {
     console.warn(`ConfigService: SOCKET_SERVER_URL is using a default placeholder value: ${DEFAULT_PLACEHOLDER_SOCKET_SERVER_URL}. Ensure it's configured via environment variables (e.g., NEXT_PUBLIC_SOCKET_SERVER_URL) or window.APP_CONFIG.`);
  }


  return SourcedConfig;
};

export const Config = getConfig();

// Call this if you need to re-evaluate config after initial load (rare for client-side)
export const refreshConfig = (): AppConfig => {
    SourcedConfig = undefined;
    return getConfig();
};

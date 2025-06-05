
import React from 'react';

interface IconProps {
  className?: string;
}

export const MicIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c-2.485 0-4.5-2.015-4.5-4.5V5.25A4.5 4.5 0 0112 1.5a4.5 4.5 0 014.5 4.5v5.25c0 2.485-2.015 4.5-4.5 4.5z" />
  </svg>
);

export const MicOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    {/* <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72M4.5 12H9m6.75 0h1.5" /> */}
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15c-2.485 0-4.5-2.015-4.5-4.5V5.25A4.5 4.5 0 0112 1.5a4.5 4.5 0 014.5 4.5v5.25c0 .159-.008.315-.023.469M7.5 12.75A4.5 4.5 0 0012 15m0 0A4.5 4.5 0 0016.5 12.75m-9 0c0-.159.008-.315.023-.469" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
  </svg>
);

export const VideoIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

export const VideoOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M12 18.75H4.5A2.25 2.25 0 012.25 16.5V7.5A2.25 2.25 0 014.5 5.25H9m0 0h3.75M9 5.25a2.25 2.25 0 012.25-2.25h.008a2.25 2.25 0 012.25 2.25v.375m-13.5 6L12 12.75M3 3l18 18" />
  </svg>
);

export const LogoutIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);

export const CallEndIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V16.5m-7.5-15h7.5m-7.5 0V5.625M10.5 1.5V5.625m0 0A2.25 2.25 0 1015 5.625M10.5 5.625A2.25 2.25 0 1115 5.625m0 0H18m0 0v2.25m0 0A2.25 2.25 0 1015.75 12m0 0v3.75m0 0A2.25 2.25 0 1018 15.75m-2.25-3.75A2.25 2.25 0 1113.5 12m2.25 0H18" transform="rotate(135 12 12)" /> {/* Rotated phone icon for hang up */}
</svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);

export const WifiIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.75 20.25h-.008v.008h.008v-.008z" />
  </svg>
);

export const WifiOffIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 20.25h-.008v.008h.008v-.008zm0 0c0 .004 0 .008 0 .012M7.502 16.064a5.25 5.25 0 010-7.424M16.498 16.064a5.25 5.25 0 000-7.424M19.623 18.188a9.75 9.75 0 000-13.788M4.377 18.188a9.75 9.75 0 010-13.788M1.255 21.345l1.322-1.321a14.25 14.25 0 010-20.152L1.255 1.255M22.745 21.345l-1.322-1.321a14.25 14.25 0 000-20.152l1.322-1.322M4.012 4.012L19.988 19.988" />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-3.741-5.197m0 5.676a9.094 9.094 0 01-3.741-.479m0 5.676a9.094 9.094 0 01-3.741-.479M12 12.75a3 3 0 110-6 3 3 0 010 6zm-7.272 4.06a9.093 9.093 0 013.741-.479M4.728 16.78a9.094 9.094 0 003.741-.479m0 0a9.095 9.095 0 003.498-2.89M4.728 16.78A9.094 9.094 0 018.472 12m0 0a9.095 9.095 0 013.528-2.89m0 0A9.093 9.093 0 0112 8.472m0 0A9.094 9.094 0 0115.272 12m0 0a9.094 9.094 0 013.472 4.78m0 0a9.094 9.094 0 003.741-.479M21.272 16.78a9.094 9.094 0 01-3.741-.479M12 8.472c-3.498 0-6.63.984-9.272 2.63M12 8.472c3.498 0 6.63.984 9.272 2.63" />
  </svg>
);

// This file now primarily stores truly static, non-environment-specific constants.
// Environment-specific configurations are handled by `services/configService.ts`.

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

/** Static, flat-vector kitchen background. Interactive hotspots are overlaid separately in kitchenScreen.ts. */
export function composeKitchenBackgroundSvg(): string {
  return `
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      <rect x="0" y="0" width="400" height="300" fill="#f2ead9" />
      <rect x="0" y="0" width="400" height="60" fill="#e3d7bd" />
      <rect x="0" y="230" width="400" height="70" fill="#d9c9a5" />
      <rect x="0" y="220" width="400" height="14" fill="#b89f74" />
      <rect x="20" y="70" width="120" height="40" fill="#cbb98f" stroke="#96835a" stroke-width="2" rx="4" />
      <rect x="150" y="70" width="120" height="40" fill="#cbb98f" stroke="#96835a" stroke-width="2" rx="4" />
      <rect x="10" y="60" width="360" height="160" fill="none" stroke="#c9b88e" stroke-width="1" stroke-dasharray="4 6" />
      <rect x="300" y="55" width="80" height="220" fill="#d7dbe0" stroke="#9aa2ac" stroke-width="2" rx="6" />
      <line x1="340" y1="55" x2="340" y2="275" stroke="#9aa2ac" stroke-width="1.5" />
      <circle cx="335" cy="140" r="2.5" fill="#6b7480" />
      <circle cx="335" cy="230" r="2.5" fill="#6b7480" />
    </svg>
  `;
}

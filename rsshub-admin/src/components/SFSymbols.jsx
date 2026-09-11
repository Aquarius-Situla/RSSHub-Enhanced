import React from 'react';

/* ============================================================================
 * RSSHub Enhanced — Apple SF Symbols Vector Iconography
 * Pixel-perfect Apple SF Symbols representations (24x24 standard viewBox)
 * ============================================================================ */

export function SFSymbol({ name, size = 20, className = '', style = {} }) {
  const props = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'currentColor',
    className: `sf-symbol sf-${name} ${className}`,
    style: { display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }
  };

  switch (name) {
    /* SF Symbol: house.fill */
    case 'house.fill':
      return (
        <svg {...props}>
          <path d="M12 2.5a1.2 1.2 0 0 0-.82.33L2.45 10.85a1.2 1.2 0 0 0 .82 2.07H4.5v7.58c0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5V12.92h1.23a1.2 1.2 0 0 0 .82-2.07L12.82 2.83A1.2 1.2 0 0 0 12 2.5z"/>
        </svg>
      );

    /* SF Symbol: network (Apple Network Hub / Proxy Routing Topology) */
    case 'network':
      return (
        <svg {...props}>
          <rect x="8" y="2" width="8" height="6" rx="1.5" />
          <path d="M11 8h2v4h4a2 2 0 0 1 2 2v2h-1v-2a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v2H5v-2a2 2 0 0 1 2-2h4V8z" />
          <rect x="3" y="16" width="6" height="6" rx="1.5" />
          <rect x="15" y="16" width="6" height="6" rx="1.5" />
        </svg>
      );

    /* SF Symbol: globe (Apple Solid Filled Globe with Repaired Quadrants) */
    case 'globe':
      return (
        <svg {...props}>
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-3.47a15.7 15.7 0 0 0-1.8-3.79A8.02 8.02 0 0 1 18.93 8zM12 4.07c.86 1.13 1.58 2.45 2.06 3.93H9.94c.48-1.48 1.2-2.8 2.06-3.93zM8.6 8H5.13a8.02 8.02 0 0 1 5.2-3.79A15.7 15.7 0 0 0 8.6 8zM4.07 14A8.04 8.04 0 0 1 4 12c0-.69.07-1.36.2-2h3.64c-.08.66-.13 1.32-.13 2 0 .68.05 1.34.13 2H4.07zM9.71 14c-.07-.66-.11-1.32-.11-2 0-.68.04-1.34.11-2h4.58c.07.66.11 1.32.11 2 0 .68-.04 1.34-.11 2H9.71zM16.29 14c.08-.66.13-1.32.13-2 0-.68-.05-1.34-.13-2h3.64c.13.64.2 1.31.2 2 0 .69-.07 1.36-.2 2h-3.64zM5.13 16h3.47c.43 1.4.98 2.65 1.8 3.79A8.02 8.02 0 0 1 5.13 16zM12 19.93c-.86-1.13-1.58-2.45-2.06-3.93h4.12c-.48 1.48-1.2 2.8-2.06 3.93zM15.46 16h3.47a8.02 8.02 0 0 1-5.27 3.79 15.7 15.7 0 0 0 1.8-3.79z"
          />
        </svg>
      );

    /* SF Symbol: cylinder.split.1x2.fill / server.rack */
    case 'cylinder.split.1x2.fill':
    case 'server.rack':
      return (
        <svg {...props}>
          <path d="M12 2C6.48 2 2 3.34 2 5v3.5c0 1.66 4.48 3 10 3s10-1.34 10-3V5c0-1.66-4.48-3-10-3zm0 2c4.42 0 8 .9 8 1.5s-3.58 1.5-8 1.5-8-.9-8-1.5S7.58 4 12 4z"/>
          <path d="M2 10.5v3.5c0 1.66 4.48 3 10 3s10-1.34 10-3v-3.5c-1.8 1.13-4.7 1.8-8 1.95V13c0 .55-.45 1-1 1s-1-.45-1-1v-.55C8.7 12.3 5.8 11.63 2 10.5z"/>
          <path d="M2 16v3c0 1.66 4.48 3 10 3s10-1.34 10-3v-3c-1.8 1.13-4.7 1.8-8 1.95V18c0 .55-.45 1-1 1s-1-.45-1-1v-.05C8.7 17.8 5.8 17.13 2 16z"/>
        </svg>
      );

    /* SF Symbol: gearshape.fill */
    case 'gearshape.fill':
      return (
        <svg {...props}>
          <path fillRule="evenodd" clipRule="evenodd" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm7.43-2.91a8.1 8.1 0 0 0 .05-1.18c0-.4-.02-.8-.05-1.18l2.06-1.61c.19-.15.24-.42.12-.64l-1.95-3.38a.502.502 0 0 0-.61-.22l-2.43.98c-.5-.39-1.05-.72-1.64-.97l-.37-2.58a.499.499 0 0 0-.49-.41h-3.9a.5.5 0 0 0-.49.41l-.37 2.58c-.59.25-1.14.58-1.64.97l-2.43-.98a.498.498 0 0 0-.61.22L2.79 8c-.12.22-.07.49.12.64l2.06 1.61c-.03.38-.05.78-.05 1.18 0 .4.02.8.05 1.18L2.91 14.22c-.19.15-.24.42-.12.64l1.95 3.38c.12.21.38.3.61.22l2.43-.98c.5.39 1.05.72 1.64.97l.37 2.58c.05.24.25.41.49.41h3.9c.24 0 .44-.17.49-.41l.37-2.58c.59-.25 1.14-.58 1.64-.97l2.43.98c.23.09.49 0 .61-.22l1.95-3.38c.12-.22.07-.49-.12-.64l-2.06-1.61z"/>
        </svg>
      );

    /* SF Symbol: square.grid.2x2.fill */
    case 'square.grid.2x2.fill':
      return (
        <svg {...props}>
          <rect x="2.5" y="2.5" width="8.5" height="8.5" rx="2.5"/>
          <rect x="13" y="2.5" width="8.5" height="8.5" rx="2.5"/>
          <rect x="2.5" y="13" width="8.5" height="8.5" rx="2.5"/>
          <rect x="13" y="13" width="8.5" height="8.5" rx="2.5"/>
        </svg>
      );

    /* SF Symbol: safari.fill / compass */
    case 'safari.fill':
    case 'compass':
      return (
        <svg {...props}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.89 6.11l-2.22 5.56c-.1.25-.3.45-.56.56l-5.56 2.22c-.37.15-.75-.23-.6-.6l2.22-5.56c.1-.25.3-.45.56-.56l5.56-2.22c.37-.15.75.23.6.6z"/>
        </svg>
      );

    /* SF Symbol: exclamationmark.triangle.fill */
    case 'exclamationmark.triangle.fill':
      return (
        <svg {...props}>
          <path d="M12 2.5a2.2 2.2 0 0 0-1.92 1.13L1.58 18.23A2.2 2.2 0 0 0 3.5 21.5h17a2.2 2.2 0 0 0 1.92-3.27L13.92 3.63A2.2 2.2 0 0 0 12 2.5zm0 5a1 1 0 0 1 1 1v5a1 1 0 1 1-2 0v-5a1 1 0 0 1 1-1zm0 9.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"/>
        </svg>
      );

    /* SF Symbol: arrow.clockwise */
    case 'arrow.clockwise':
      return (
        <svg {...props}>
          <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
        </svg>
      );

    /* SF Symbol: checkmark.circle.fill */
    case 'checkmark.circle.fill':
      return (
        <svg {...props}>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      );

    /* SF Symbol: lock.fill */
    case 'lock.fill':
      return (
        <svg {...props}>
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
        </svg>
      );

    /* SF Symbol: slider.horizontal.3 */
    case 'slider.horizontal.3':
      return (
        <svg {...props}>
          <path d="M4 6h10v2H4V6zm14 0h2v2h-2V6zm-8 6h10v2H10v-2zm-6 0h2v2H4v-2zm12 6h4v2h-4v-2zm-12 0h8v2H4v-2z"/>
        </svg>
      );

    /* SF Symbol: shield.fill */
    case 'shield.fill':
      return (
        <svg {...props}>
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
        </svg>
      );

    /* SF Symbol: key.fill */
    case 'key.fill':
      return (
        <svg {...props}>
          <path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
        </svg>
      );

    /* SF Symbol: tray.full.fill */
    case 'tray.full.fill':
      return (
        <svg {...props}>
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>
        </svg>
      );

    /* SF Symbol: info.circle */
    case 'info.circle':
      return (
        <svg
          {...props}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
        </svg>
      );

    /* SF Symbol: checkmark */
    case 'checkmark':
      return (
        <svg
          {...props}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    /* Default fallback circle */
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="8"/>
        </svg>
      );
  }
}

export default SFSymbol;

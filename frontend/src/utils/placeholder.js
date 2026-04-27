export function svgPlaceholderDataUrl({
  width = 600,
  height = 400,
  label = 'ShopHub',
  sublabel = '',
} = {}) {
  // CSP-friendly placeholder: inline SVG as data URL.
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2563eb"/>
        <stop offset="1" stop-color="#7c3aed"/>
      </linearGradient>
      <filter id="s" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="16" flood-color="#000" flood-opacity="0.18"/>
      </filter>
    </defs>
    <rect x="10" y="10" rx="26" ry="26" width="${width - 20}" height="${height - 20}" fill="url(#g)" filter="url(#s)"/>
    <rect x="22" y="22" rx="20" ry="20" width="${width - 44}" height="${height - 44}" fill="rgba(255,255,255,0.10)"/>
    <g fill="#ffffff" text-anchor="middle" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial" >
      <text x="${width / 2}" y="${height / 2 - 8}" font-size="${Math.max(18, Math.floor(width / 15))}" font-weight="800" letter-spacing="0.2">
        ${escapeXml(label)}
      </text>
      ${
        sublabel
          ? `<text x="${width / 2}" y="${height / 2 + 26}" font-size="14" font-weight="600" opacity="0.9">${escapeXml(
              sublabel
            )}</text>`
          : ''
      }
    </g>
  </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(str) {
  return String(str).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
      default:
        return c;
    }
  });
}


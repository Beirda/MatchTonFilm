/* MatchTonFilm — composants UI partagés */
const { useState, useRef, useEffect, useCallback } = React;

/* ----------------------------------------------------------------
   Icônes (line icons, stroke 1.8)
---------------------------------------------------------------- */
function Icon({ name, size = 24, stroke = 1.8, fill = 'none', color = 'currentColor', style }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill, stroke: color, strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', style };
  const paths = {
    heart: <path d="M12 20s-7.5-4.7-9.7-9C.9 8.5 2 5.5 4.8 5c1.9-.3 3.4.7 4.2 2 .4.6 1.6.6 2 0 .8-1.3 2.3-2.3 4.2-2 2.8.5 3.9 3.5 2.5 6-2.2 4.3-9.7 9-9.7 9z" />,
    x: <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>,
    check: <path d="M5 12.5l4.5 4.5L19 7" />,
    plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
    users: <><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19c.6-3 3-4.6 5.5-4.6S14 16 14.5 19" /><path d="M16 5.2A3.2 3.2 0 0 1 16 11" /><path d="M17 14.6c2 .6 3.3 2.1 3.7 4.4" /></>,
    link: <><path d="M9.5 14.5l5-5" /><path d="M8 12l-2 2a3 3 0 0 0 4.2 4.2l2-2" /><path d="M16 12l2-2a3 3 0 0 0-4.2-4.2l-2 2" /></>,
    chevL: <path d="M15 5l-7 7 7 7" />,
    chevR: <path d="M9 5l7 7-7 7" />,
    chevD: <path d="M5 9l7 7 7-7" />,
    play: <path d="M7 5l12 7-12 7V5z" fill="currentColor" stroke="none" />,
    star: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z" fill="currentColor" stroke="none" />,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><path d="M12 7.6h.01" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.4-3.4" /></>,
    home: <><path d="M4 11l8-7 8 7" /><path d="M6 10v9h12v-9" /></>,
    film: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M8 4v16M16 4v16M3 9h5M3 15h5M16 9h5M16 15h5" /></>,
    trophy: <><path d="M7 4h10v3a5 5 0 0 1-10 0V4z" /><path d="M7 5H4v1a3 3 0 0 0 3 3M17 5h3v1a3 3 0 0 1-3 3" /><path d="M12 12v4M9 20h6M10 16h4" /></>,
    user: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.7-3.4 3.4-5.2 7-5.2S18.3 16.6 19 20" /></>,
    refresh: <><path d="M20 11A8 8 0 0 0 6.3 6.3L4 8.5" /><path d="M4 4v4.5h4.5" /><path d="M4 13a8 8 0 0 0 13.7 4.7L20 15.5" /><path d="M20 20v-4.5h-4.5" /></>,
    share: <><circle cx="6" cy="12" r="2.4" /><circle cx="17" cy="6" r="2.4" /><circle cx="17" cy="18" r="2.4" /><path d="M8.2 11l6.6-3.8M8.2 13l6.6 3.8" /></>,
    copy: <><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    google: <g stroke="none"><path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.4-.18-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 .96-3.4.96-2.6 0-4.8-1.76-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" /><path fill="#FBBC05" d="M6.4 13.96a6 6 0 0 1 0-3.9V7.46H3.1a10 10 0 0 0 0 9.1l3.3-2.6z" /><path fill="#EA4335" d="M12 6.16c1.5 0 2.8.5 3.8 1.5l2.85-2.85A10 10 0 0 0 3.1 7.46l3.3 2.6C7.2 7.92 9.4 6.16 12 6.16z" /></g>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7.5V12l3 2" /></>,
    bolt: <path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" fill="currentColor" stroke="none" />,
    sparkle: <path d="M12 3l1.6 5.2L19 10l-5.4 1.8L12 17l-1.6-5.2L5 10l5.4-1.8L12 3z" fill="currentColor" stroke="none" />,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L16 3H8l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 3 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1c.6.5 1.3.9 2 1.2L8 21h8l.5-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z" /></>,
  };
  return <svg {...p}>{paths[name]}</svg>;
}

/* ----------------------------------------------------------------
   Status bar
---------------------------------------------------------------- */
function StatusBar() {
  return (
    <div className="statusbar">
      <span>21:47</span>
      <span className="sb-right">
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4" width="3" height="8" rx="1"/><rect x="10" y="1.5" width="3" height="10.5" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor"><path d="M8.5 2.5c2.3 0 4.4.9 6 2.4l-1.4 1.5A6.7 6.7 0 0 0 8.5 4.5 6.7 6.7 0 0 0 3.9 6.4L2.5 4.9A8.7 8.7 0 0 1 8.5 2.5z"/><path d="M8.5 6.2c1.3 0 2.5.5 3.4 1.4l-1.5 1.5a2.7 2.7 0 0 0-3.8 0L5.1 7.6A4.7 4.7 0 0 1 8.5 6.2z"/><circle cx="8.5" cy="10.4" r="1.4"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="1" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1"/><rect x="3" y="3" width="16" height="7" rx="1.5" fill="currentColor"/><rect x="23" y="4.5" width="2" height="4" rx="1" fill="currentColor" fillOpacity="0.5"/></svg>
      </span>
    </div>
  );
}

/* ----------------------------------------------------------------
   Poster — stylised, sized by props
---------------------------------------------------------------- */
function Poster({ movie, w, h, radius, titleSize = 17, glyph = true, className = '', style = {} }) {
  return (
    <div className={'poster ' + className}
      style={{ width: w, height: h, borderRadius: radius, '--p1': movie.p1, '--p2': movie.p2, ...style }}>
      {glyph && <span className="poster-glyph">{movie.year}</span>}
      <span className="poster-title" style={{ fontSize: titleSize }}>{movie.title}</span>
    </div>
  );
}

/* ----------------------------------------------------------------
   Avatar
---------------------------------------------------------------- */
function Avatar({ n, c, size = 34 }) {
  return <div className="avatar" style={{ width: size, height: size, background: c, fontSize: size * 0.42 }}>{n}</div>;
}

/* ----------------------------------------------------------------
   Header (back + title + action)
---------------------------------------------------------------- */
function TopBar({ title, onBack, right, sub }) {
  return (
    <div className="row pad" style={{ gap: 12, padding: '8px 18px 12px', flex: 'none' }}>
      {onBack && <button className="iconbtn" onClick={onBack}><Icon name="chevL" size={22} /></button>}
      <div className="grow col" style={{ gap: 1 }}>
        {sub && <span className="eyebrow" style={{ fontSize: 10.5 }}>{sub}</span>}
        {title && <span className="h3" style={{ fontSize: 19 }}>{title}</span>}
      </div>
      {right}
    </div>
  );
}

/* ----------------------------------------------------------------
   Toast host
---------------------------------------------------------------- */
function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className="toast-wrap">
      <div className={'toast ' + (toast.kind || 'info')}>
        {toast.kind === 'match'
          ? <Icon name="heart" size={20} fill="#fff" color="#fff" />
          : <Icon name={toast.icon || 'info'} size={18} />}
        <span>{toast.text}</span>
      </div>
    </div>
  );
}

/* expose */
Object.assign(window, { Icon, StatusBar, Poster, Avatar, TopBar, Toast });

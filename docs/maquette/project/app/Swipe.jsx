/* MatchTonFilm — Swipe (cartes, drag + boutons, détails, animation de sortie) */
function Swipe({ group, deck, onVote, onFinish, onOpenMatches, matchCount }) {
  const { fmtRuntime } = window.MTF;
  const [index, setIndex] = useState(0);
  const [pos, setPos] = useState({ x: 0, y: 0 });      // live drag offset
  const [flyOut, setFlyOut] = useState(null);          // 'like' | 'dislike' | null
  const [details, setDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const dragging = useRef(false);
  const start = useRef({ x: 0, y: 0 });

  useEffect(() => { const t = setTimeout(() => setLoading(false), 950); return () => clearTimeout(t); }, []);

  const movie = deck[index];
  const next1 = deck[index + 1];
  const next2 = deck[index + 2];
  const remaining = deck.length - index;

  const THRESH = 96;
  const intent = pos.x > 40 ? 'like' : pos.x < -40 ? 'dislike' : null;

  const commit = useCallback((dir) => {
    if (flyOut) return;
    setDetails(false);
    onVote(deck[index], dir === 'like');
    setFlyOut(dir);
    setTimeout(() => {
      setFlyOut(null);
      setPos({ x: 0, y: 0 });
      setIndex(i => i + 1);
    }, 320);
  }, [flyOut, index, deck, onVote]);

  // pointer drag
  const down = (e) => { if (flyOut || details) return; dragging.current = true; start.current = { x: e.clientX, y: e.clientY }; };
  const move = (e) => {
    if (!dragging.current) return;
    setPos({ x: e.clientX - start.current.x, y: (e.clientY - start.current.y) * 0.4 });
  };
  const up = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (pos.x > THRESH) commit('like');
    else if (pos.x < -THRESH) commit('dislike');
    else setPos({ x: 0, y: 0 });
  };

  if (index >= deck.length) {
    return <SwipeDone group={group} matchCount={matchCount} onOpenMatches={onOpenMatches} />;
  }

  const topTransform = flyOut
    ? `translate(${flyOut === 'like' ? 560 : -560}px, ${pos.y - 40}px) rotate(${flyOut === 'like' ? 26 : -26}deg)`
    : `translate(${pos.x}px, ${pos.y}px) rotate(${pos.x * 0.045}deg)`;

  return (
    <div className="screen">
      {/* header */}
      <div className="row between pad" style={{ padding: '6px 20px 12px', flex: 'none' }}>
        <button className="iconbtn" onClick={onFinish}><Icon name="chevL" size={22} /></button>
        <div className="col center" style={{ alignItems: 'center', gap: 1 }}>
          <span className="h3" style={{ fontSize: 16 }}>{group.emoji} {group.name}</span>
          <span className="small" style={{ fontSize: 11.5 }}>{remaining} films restants</span>
        </div>
        <button className="iconbtn sw-matchbtn" onClick={onOpenMatches}>
          <Icon name="heart" size={18} fill="var(--red)" color="var(--red)" />
          {matchCount > 0 && <span className="sw-badge">{matchCount}</span>}
        </button>
      </div>

      {/* card stack */}
      <div className="sw-stack">
        {loading ? <SwipeSkeleton /> : (
          <React.Fragment>
            {next2 && <CardShell movie={next2} depth={2} />}
            {next1 && <CardShell movie={next1} depth={1} />}
            <div className="sw-card top"
              style={{ transform: topTransform, transition: dragging.current ? 'none' : 'transform 0.32s cubic-bezier(0.22,1,0.36,1)' }}
              onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up}>
              <CardFace movie={movie} intent={intent} fmtRuntime={fmtRuntime} onInfo={() => setDetails(true)} />
            </div>
          </React.Fragment>
        )}
      </div>

      {/* action bar */}
      <div className="sw-actions">
        <button className="sw-btn dislike" onClick={() => commit('dislike')} disabled={loading}><Icon name="x" size={30} /></button>
        <button className="sw-btn info" onClick={() => setDetails(true)} disabled={loading}><Icon name="info" size={24} /></button>
        <button className="sw-btn like" onClick={() => commit('like')} disabled={loading}><Icon name="heart" size={30} fill="#fff" color="#fff" /></button>
      </div>

      {/* details sheet */}
      {details && <DetailsSheet movie={movie} fmtRuntime={fmtRuntime} onClose={() => setDetails(false)} onLike={() => commit('like')} onDislike={() => commit('dislike')} />}
    </div>
  );
}

/* background cards */
function CardShell({ movie, depth }) {
  return (
    <div className="sw-card" style={{ transform: `scale(${1 - depth * 0.05}) translateY(${depth * 14}px)`, opacity: depth === 2 ? 0.5 : 0.8, zIndex: 5 - depth }}>
      <Poster movie={movie} w="100%" h="100%" radius={26} titleSize={0} glyph={false} />
    </div>
  );
}

/* top card face with full info */
function CardFace({ movie, intent, fmtRuntime, onInfo }) {
  return (
    <div className="sw-face">
      <Poster movie={movie} w="100%" h="100%" radius={26} titleSize={0} glyph={false} />
      <div className="sw-shade" />

      {/* stamps */}
      <div className={'sw-stamp like' + (intent === 'like' ? ' show' : '')}>J'AIME</div>
      <div className={'sw-stamp nope' + (intent === 'dislike' ? ' show' : '')}>NON</div>

      <div className="sw-toprow">
        <span className="sw-rating"><Icon name="star" size={13} color="var(--gold)" /> {movie.rating.toFixed(1)}</span>
        <button className="sw-info" onClick={(e) => { e.stopPropagation(); onInfo(); }}><Icon name="info" size={18} /></button>
      </div>

      <div className="sw-meta">
        <div className="row gap8" style={{ marginBottom: 10 }}>
          {movie.genres.map(g => <span key={g} className="chip chip-sm" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(6px)' }}>{g}</span>)}
        </div>
        <h2 className="display" style={{ fontSize: 31, lineHeight: 1.0, textTransform: 'uppercase' }}>{movie.title}</h2>
        <div className="row gap12" style={{ marginTop: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: 13.5 }}>
          <span>{movie.year}</span>
          <span className="sw-dot" />
          <span className="row gap6"><Icon name="clock" size={14} /> {fmtRuntime(movie.runtime)}</span>
          <span className="sw-dot" />
          <span>{movie.cast[0]}</span>
        </div>
      </div>
    </div>
  );
}

/* details bottom sheet */
function DetailsSheet({ movie, fmtRuntime, onClose, onLike, onDislike }) {
  return (
    <div className="sheet-overlay" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        <div className="sheet-grab" />
        <div className="row gap14" style={{ marginTop: 6 }}>
          <Poster movie={movie} w={78} h={112} radius={12} titleSize={0} glyph={false} />
          <div className="grow col" style={{ gap: 6 }}>
            <h2 className="h2" style={{ fontSize: 23 }}>{movie.title}</h2>
            <div className="row gap10 small">
              <span className="rating"><Icon name="star" size={13} color="var(--gold)" /> {movie.rating.toFixed(1)}</span>
              <span>· {movie.year} · {fmtRuntime(movie.runtime)}</span>
            </div>
            <div className="row gap6" style={{ flexWrap: 'wrap' }}>
              {movie.genres.map(g => <span key={g} className="chip chip-sm on">{g}</span>)}
            </div>
          </div>
        </div>

        <button className="trailer-btn" onClick={onClose}><Icon name="play" size={18} color="#fff" /> Lancer la bande-annonce</button>

        <div style={{ marginTop: 16 }}>
          <span className="label">Synopsis</span>
          <p className="body" style={{ marginTop: 7 }}>{movie.synopsis}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <span className="label">Casting principal</span>
          <div className="row gap10" style={{ marginTop: 10, overflow: 'hidden' }}>
            {movie.cast.map((c, i) => (
              <div key={i} className="col center" style={{ gap: 6, width: 78, flex: 'none' }}>
                <Avatar n={c.split(' ').map(x => x[0]).slice(0, 2).join('')} c={['#7d2b8c', '#2a3a8c', '#1f5a52'][i % 3]} size={48} />
                <span className="small center" style={{ fontSize: 11, lineHeight: 1.2 }}>{c}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="row gap12" style={{ marginTop: 20 }}>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={onDislike}><Icon name="x" size={20} /> Passer</button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onLike}><Icon name="heart" size={19} fill="#fff" color="#fff" /> J'aime</button>
        </div>
      </div>
    </div>
  );
}

function SwipeSkeleton() {
  return <div className="sw-card top"><div className="sk-card"><div className="sk-shimmer" /></div></div>;
}

function SwipeDone({ group, matchCount, onOpenMatches }) {
  return (
    <div className="screen">
      <div className="empty" style={{ flex: 1 }}>
        <div className="empty-ic"><Icon name="check" size={36} color="var(--red)" /></div>
        <h2 className="h2" style={{ marginTop: 18 }}>Tu as tout swipé !</h2>
        <p className="body center" style={{ maxWidth: 290, marginTop: 8 }}>
          En attente des autres membres de <b style={{ color: 'var(--text-0)' }}>{group.name}</b>. Voici déjà vos points communs.
        </p>
        <div className="surface row gap12" style={{ padding: 16, marginTop: 22 }}>
          <div className="act-ic"><Icon name="heart" size={18} color="var(--red)" /></div>
          <div><div style={{ fontWeight: 800, fontSize: 16 }}>{matchCount} matchs du groupe</div><div className="small">Prêts à départager</div></div>
        </div>
        <button className="btn btn-primary" style={{ marginTop: 22, maxWidth: 260 }} onClick={onOpenMatches}>
          <Icon name="trophy" size={20} color="#fff" /> Voir le classement
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { Swipe });

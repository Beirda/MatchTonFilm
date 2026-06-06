/* MatchTonFilm — App router & state */
function App() {
  const { MOVIES, GROUPS } = window.MTF;
  const [screen, setScreen] = useState('welcome');
  const [homeTab, setHomeTab] = useState('home');
  const [groups, setGroups] = useState(GROUPS);
  const [active, setActive] = useState(null);
  const [matched, setMatched] = useState([]);     // movie ids matched in active group
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const deck = MOVIES;

  const pushToast = useCallback((t) => {
    setToast(t);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  // seed matches when opening an existing group
  const PRESETS = {
    coloc: ['parasite', 'interstellar', 'spiderverse', 'dune2', 'whiplash', 'madmax', 'joker'],
    couple: ['drive', 'parasite', 'br2049', 'lalaland', 'whiplash', 'joker', 'interstellar', 'eeaao', 'portrait', 'arrival', 'dune2', 'budapest'],
    boulot: [],
  };

  const openGroup = (g) => { setActive(g); setMatched(PRESETS[g.id] || []); setScreen('swipe'); };

  const onVote = (movie, liked) => {
    if (liked && movie.rating >= 8.0 && !matched.includes(movie.id)) {
      setMatched(m => [...m, movie.id]);
      pushToast({ kind: 'match', text: 'Ça matche ! ' + movie.title.split(' ')[0] + '…' });
    }
  };

  // build ranking from matched ids
  const ranking = React.useMemo(() => {
    const members = active ? active.members : 4;
    const seed = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 997; return h / 997; };
    return matched.map(id => {
      const movie = MOVIES.find(m => m.id === id);
      const base = 0.55 + (movie.rating - 7.8) * 0.5 + seed(id) * 0.22;
      const likes = Math.max(2, Math.min(members, Math.round(members * Math.min(1, base))));
      return { movie, likes, pct: Math.round((likes / members) * 100) };
    }).sort((a, b) => b.pct - a.pct || b.movie.rating - a.movie.rating);
  }, [matched, active]);

  const createGroup = (cfg) => {
    const g = { id: 'new' + Date.now(), name: cfg.name, emoji: '🎬', members: 1, activity: "À l'instant", matches: 0, status: 'Nouveau', accent: '#ff3b47', people: [{ n: 'L', c: '#ff3b47' }] };
    setGroups(gs => [g, ...gs]);
    setActive(g); setMatched([]); setScreen('swipe');
    pushToast({ kind: 'info', icon: 'sparkle', text: 'Groupe créé · session lancée' });
  };

  const joinGroup = () => {
    const g = groups[0];
    openGroup(g);
    pushToast({ kind: 'info', icon: 'users', text: 'Tu as rejoint ' + g.name });
  };

  return (
    <div className="stage">
      <div className="phone">
        <StatusBar />
        <Toast toast={toast} />

        {screen === 'welcome' && <Welcome onSignup={() => setScreen('onboarding')} onLogin={() => setScreen('home')} />}
        {screen === 'onboarding' && <Onboarding onDone={() => setScreen('home')} />}
        {screen === 'home' && (
          <Home groups={groups} tab={homeTab} setTab={setHomeTab}
            onOpen={openGroup} onCreate={() => setScreen('create')} onJoin={() => setScreen('join')} />
        )}
        {screen === 'create' && <CreateGroup onBack={() => setScreen('home')} onLaunch={createGroup} toast={pushToast} />}
        {screen === 'join' && <JoinGroup onBack={() => setScreen('home')} onJoined={joinGroup} toast={pushToast} />}
        {screen === 'swipe' && active && (
          <Swipe group={active} deck={deck} onVote={onVote} matchCount={matched.length}
            onFinish={() => setScreen('home')} onOpenMatches={() => setScreen('matches')} />
        )}
        {screen === 'matches' && active && (
          <Matches group={active} ranking={ranking} totalVoters={Math.max(2, active.members)}
            onBack={() => setScreen('swipe')}
            onReplay={() => setScreen('swipe')}
            onReset={() => { setMatched([]); pushToast({ kind: 'info', icon: 'refresh', text: 'Votes réinitialisés' }); }}
            onNewCycle={() => { setScreen('swipe'); pushToast({ kind: 'info', icon: 'sparkle', text: 'Nouveau cycle de sélection' }); }} />
        )}
      </div>
      <TweaksLayer />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

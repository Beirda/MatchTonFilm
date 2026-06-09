/* MatchTonFilm — Onboarding (genres → films → validation) */

function Onboarding({ onDone }) {
  const { GENRES, MOVIES } = window.MTF;

  // jeu de départ : un sous-ensemble varié, la liste s'agrandit au fil des clics
  const SEED = ['dune2', 'parasite', 'br2049', 'whiplash', 'madmax', 'lalaland', 'getout', 'spiderverse'];

  const [step, setStep] = useState(0);
  const [genres, setGenres] = useState([]);
  const [films, setFilms] = useState([]);   // films aimés (sélectionnés)
  const [list, setList] = useState(SEED);   // ordre des affiches affichées dans la grille
  const [query, setQuery] = useState('');

  const toggle = (arr, set, v, max) => {
    set(arr.includes(v) ? arr.filter((x) => x !== v) : max && arr.length >= max ? arr : [...arr, v]);
  };

  // tap sur une affiche : on l'aime + on insère ses 3 similaires juste après elle.
  // Re-tap : on la retire des films aimés (la liste reste agrandie).
  const pickFilm = (id) => {
    if (films.includes(id)) {
      setFilms((f) => f.filter((x) => x !== id));
      return;
    }
    setFilms((f) => [...f, id]);
    setList((cur) => {
      const movie = MOVIES.find((m) => m.id === id);
      const sims = window.MTF.similar(movie, cur, 3).map((s) => s.id); // 3 similaires absents de la liste
      const i = cur.indexOf(id);
      if (i === -1) return [...cur, id, ...sims];      // venu de la recherche
      const next = [...cur];
      next.splice(i + 1, 0, ...sims);
      return next;
    });
  };

  const q = query.trim().toLowerCase();
  const results = q ? MOVIES.filter((m) => m.title.toLowerCase().includes(q)) : [];

  const Card = (m) => {
    const on = films.includes(m.id);
    return (
      <button key={m.id} className={'ob-poster' + (on ? ' on' : '')} onClick={() => pickFilm(m.id)}>
        <Poster movie={m} w="100%" h={172} radius={14} titleSize={13} />
        {on && <span className="ob-check"><Icon name="check" size={16} color="#fff" /></span>}
      </button>);

  };

  const steps = [
  { eyebrow: 'Étape 1 / 3', title: 'Tes genres préférés', sub: 'Choisis-en au moins 3 pour calibrer tes recommandations.', min: 3, ok: genres.length >= 3 },
  { eyebrow: 'Étape 2 / 3', title: 'Des films que tu adores', sub: 'Touche un film : 3 titres similaires s\'ajoutent juste après. La liste grandit à mesure.', min: 1, ok: films.length >= 1 },
  { eyebrow: 'Étape 3 / 3', title: 'Tout est prêt', sub: 'On a ce qu\'il faut pour te proposer les bons films.', ok: true }];

  const s = steps[step];

  return (
    <div className="screen">
      {/* progress */}
      <div className="row pad between" style={{ padding: '6px 22px 14px', flex: 'none' }}>
        <button className="iconbtn" onClick={() => step ? setStep(step - 1) : onDone()}><Icon name="chevL" size={22} /></button>
        <div className="dots">
          {steps.map((_, i) => <i key={i} className={i <= step ? 'on' : ''} />)}
        </div>
        <div style={{ width: 44 }} />
      </div>

      <div className="scroll pad">
        <span className="eyebrow">{s.eyebrow}</span>
        <h1 className="h1" style={{ marginTop: 8 }}>{s.title}</h1>
        <p className="body" style={{ marginTop: 8, marginBottom: 22 }}>{s.sub}</p>

        {step === 0 &&
        <div className="chiprow" style={{ gap: 10 }}>
            {GENRES.map((g) =>
          <button key={g} className={'chip' + (genres.includes(g) ? ' on' : '')}
          style={{ padding: '13px 18px', fontSize: 15 }}
          onClick={() => toggle(genres, setGenres, g)}>{g}</button>
          )}
          </div>
        }

        {step === 1 &&
        <React.Fragment>
            <div className="ob-grid" data-comment-anchor="4f8cf11fc0-div-46-11">
              {list.map((id) => Card(MOVIES.find((m) => m.id === id)))}
            </div>

            {/* recherche d'un film précis — sous la ligne de flottaison */}
            <div className="ob-search">
              <div className="ob-search-divider"><span>ou cherche un film précis</span></div>
              <div className="searchbar">
                <Icon name="search" size={20} color="var(--text-2)" />
                <input className="search-input" type="text" placeholder="Rechercher un film…"
                value={query} onChange={(e) => setQuery(e.target.value)} />
                {query &&
                <button className="search-clear" onClick={() => setQuery('')}><Icon name="x" size={16} /></button>
                }
              </div>
              {q && (
              results.length ?
              <div className="ob-grid" style={{ marginTop: 14 }}>
                    {results.map((m) => Card(m))}
                  </div> :

              <p className="small" style={{ marginTop: 14 }}>Aucun film trouvé pour «&nbsp;{query}&nbsp;».</p>)
              }
            </div>
          </React.Fragment>
        }

        {step === 2 &&
        <div className="ob-summary fadeup">
            <div className="ob-confetti"><Icon name="sparkle" size={30} color="var(--red)" /></div>
            <div className="surface" style={{ padding: 18, marginTop: 8 }}>
              <div className="row between"><span className="small">Genres sélectionnés</span><span className="rating" style={{ color: 'var(--text-0)' }}>{genres.length}</span></div>
              <div className="chiprow" style={{ marginTop: 10 }}>
                {genres.slice(0, 6).map((g) => <span key={g} className="chip chip-sm on">{g}</span>)}
              </div>
            </div>
            <div className="surface" style={{ padding: 18, marginTop: 12 }}>
              <div className="row between"><span className="small">Films aimés</span><span className="rating" style={{ color: 'var(--text-0)' }}>{films.length}</span></div>
              <div className="row" style={{ marginTop: 12, gap: 8, overflow: 'hidden' }}>
                {films.slice(0, 5).map((id) => {
                const m = MOVIES.find((x) => x.id === id);
                return <Poster key={id} movie={m} w={52} h={74} radius={8} titleSize={0} glyph={false} />;
              })}
              </div>
            </div>
          </div>
        }
      </div>

      <div className="pad" style={{ padding: '12px 22px calc(18px + env(safe-area-inset-bottom))', flex: 'none' }}>
        <button className="btn btn-primary" disabled={!s.ok}
        onClick={() => step < 2 ? setStep(step + 1) : onDone()}>
          {step < 2 ? s.ok ? 'Continuer' : `Encore ${s.min - (step === 0 ? genres.length : films.length)} à choisir` : 'Découvrir mes groupes'}
        </button>
      </div>
    </div>);

}
window.Onboarding = Onboarding;

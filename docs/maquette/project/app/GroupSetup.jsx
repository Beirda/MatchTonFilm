/* MatchTonFilm — Créer & Rejoindre un groupe */
function CreateGroup({ onBack, onLaunch, toast }) {
  const { GENRES } = window.MTF;
  const [name, setName] = useState('');
  const [genres, setGenres] = useState(['Science-fiction', 'Thriller']);
  const [age, setAge] = useState('16+');
  const [lang, setLang] = useState('VF + VOSTFR');
  const [generated, setGenerated] = useState(false);

  const code = 'CINE-' + (name ? name.slice(0, 3).toUpperCase().replace(/\s/g, '') : 'XQ7') + '4';
  const toggle = g => setGenres(genres.includes(g) ? genres.filter(x => x !== g) : [...genres, g]);

  return (
    <div className="screen">
      <TopBar title="Nouveau groupe" sub="Configuration" onBack={onBack} />
      <div className="scroll pad" style={{ paddingBottom: 8 }}>
        <div className="field" style={{ marginTop: 4 }}>
          <span className="label">Nom du groupe</span>
          <input className="input" placeholder="Soirée pizza-ciné 🍕" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <span className="label">Genres autorisés</span>
          <div className="chiprow">
            {GENRES.slice(0, 10).map(g => (
              <button key={g} className={'chip' + (genres.includes(g) ? ' on' : '')} onClick={() => toggle(g)}>{g}</button>
            ))}
          </div>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <span className="label">Classification d'âge</span>
          <div className="seg">
            {['Tous', '12+', '16+', '18+'].map(a => (
              <button key={a} className={age === a ? 'on' : ''} onClick={() => setAge(a)}>{a}</button>
            ))}
          </div>
        </div>

        <div className="field" style={{ marginTop: 18 }}>
          <span className="label">Langue</span>
          <div className="seg">
            {['VF', 'VOSTFR', 'VF + VOSTFR'].map(a => (
              <button key={a} className={lang === a ? 'on' : ''} onClick={() => setLang(a)}>{a}</button>
            ))}
          </div>
        </div>

        {/* invite */}
        <div className="surface" style={{ padding: 16, marginTop: 22, borderColor: generated ? 'var(--red-line)' : 'var(--stroke)' }}>
          {!generated ? (
            <button className="btn btn-dark" onClick={() => { setGenerated(true); toast({ kind: 'info', icon: 'link', text: 'Lien d\'invitation généré' }); }}>
              <Icon name="link" size={20} /> Générer un lien d'invitation
            </button>
          ) : (
            <div className="col gap12 fadeup">
              <div className="row between">
                <span className="label">Code du groupe</span>
                <span className="gc-status live">Actif</span>
              </div>
              <div className="invite-code">
                <span className="mono">{code}</span>
                <button className="iconbtn" onClick={() => toast({ kind: 'info', icon: 'copy', text: 'Code copié' })} style={{ width: 38, height: 38 }}><Icon name="copy" size={18} /></button>
              </div>
              <button className="btn btn-ghost" onClick={() => toast({ kind: 'info', icon: 'share', text: 'Partage du lien…' })}>
                <Icon name="share" size={19} /> Partager le lien
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="pad" style={{ padding: '12px 22px calc(18px + env(safe-area-inset-bottom))', flex: 'none' }}>
        <button className="btn btn-primary" disabled={!name} onClick={() => onLaunch({ name: name || 'Mon groupe', genres, age, lang })}>
          Lancer la session de swipe
        </button>
      </div>
    </div>
  );
}

function JoinGroup({ onBack, onJoined, toast }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const refs = useRef([]);
  const full = code.every(c => c);

  const setChar = (i, v) => {
    v = v.toUpperCase().slice(-1);
    const next = [...code]; next[i] = v; setCode(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  };
  const onKey = (i, e) => { if (e.key === 'Backspace' && !code[i] && i) refs.current[i - 1]?.focus(); };

  return (
    <div className="screen">
      <TopBar title="Rejoindre un groupe" sub="Invitation" onBack={onBack} />
      <div className="scroll pad" style={{ paddingTop: 10 }}>
        <div className="join-ic"><Icon name="link" size={30} color="var(--red)" /></div>
        <h2 className="h2 center" style={{ marginTop: 16 }}>Saisis le code d'invitation</h2>
        <p className="body center" style={{ marginTop: 8, maxWidth: 280, marginInline: 'auto' }}>Demande le code à ton ami ou ouvre directement le lien qu'il t'a partagé.</p>

        <div className="code-grid" style={{ marginTop: 26 }}>
          {code.map((c, i) => (
            <input key={i} ref={el => refs.current[i] = el} className={'code-cell' + (c ? ' filled' : '')}
              value={c} maxLength={1} inputMode="text"
              onChange={e => setChar(i, e.target.value)} onKeyDown={e => onKey(i, e)} />
          ))}
        </div>

        <div className="or-divider"><span>ou</span></div>
        <button className="btn btn-ghost" onClick={() => toast({ kind: 'info', icon: 'link', text: 'Ouverture du lien collé…' })}>
          <Icon name="copy" size={19} /> Coller un lien d'invitation
        </button>
      </div>

      <div className="pad" style={{ padding: '12px 22px calc(18px + env(safe-area-inset-bottom))', flex: 'none' }}>
        <button className="btn btn-primary" disabled={!full} onClick={onJoined}>Rejoindre le groupe</button>
      </div>
    </div>
  );
}

Object.assign(window, { CreateGroup, JoinGroup });

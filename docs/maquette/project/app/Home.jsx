/* MatchTonFilm — Accueil (liste des groupes) */
function Home({ groups, onOpen, onCreate, onJoin, tab, setTab }) {
  return (
    <div className="screen">
      <div className="row between pad" style={{ padding: '8px 22px 6px', flex: 'none' }}>
        <div className="row gap10">
          <div className="wl-logo-mark" style={{ width: 38, height: 38 }}><Icon name="heart" size={18} fill="#fff" color="#fff" /></div>
          <div className="col" style={{ gap: 0 }}>
            <span className="small" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Bonsoir,</span>
            <span className="h3" style={{ fontSize: 18 }}>Léa</span>
          </div>
        </div>
        <button className="iconbtn"><Icon name="user" size={20} /></button>
      </div>

      {tab === 'home' && <HomeGroups groups={groups} onOpen={onOpen} onCreate={onCreate} onJoin={onJoin} />}
      {tab === 'activity' && <ActivityTab groups={groups} />}
      {tab === 'profile' && <ProfileTab />}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}

function HomeGroups({ groups, onOpen, onCreate, onJoin }) {
  const { MOVIES } = window.MTF;
  if (groups.length === 0) {
    return (
      <div className="scroll pad" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="empty">
          <div className="empty-ic"><Icon name="users" size={34} color="var(--red)" /></div>
          <h2 className="h2" style={{ marginTop: 18 }}>Aucun groupe… pour l'instant</h2>
          <p className="body center" style={{ maxWidth: 280, marginTop: 8 }}>Crée ton premier groupe et invite tes amis pour lancer une session.</p>
          <button className="btn btn-primary" style={{ marginTop: 22, maxWidth: 240 }} onClick={onCreate}>
            <Icon name="plus" size={20} color="#fff" /> Créer un groupe
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="scroll pad" style={{ paddingBottom: 8 }}>
      <div className="row between" style={{ margin: '10px 0 14px' }}>
        <span className="eyebrow" style={{ color: 'var(--text-2)' }}>Mes groupes · {groups.length}</span>
        <button className="linkbtn btn-sm" style={{ padding: '6px 10px', color: 'var(--red)' }} onClick={onJoin}>Rejoindre</button>
      </div>

      <div className="col gap14">
        {groups.map((g, i) => {
          const posters = MOVIES.slice(i * 2, i * 2 + 3);
          return (
            <button key={g.id} className="groupcard fadeup" style={{ animationDelay: i * 0.05 + 's' }} onClick={() => onOpen(g)}>
              <div className="gc-posters">
                {posters.map((m, k) => <Poster key={k} movie={m} w={44} h={64} radius={7} titleSize={0} glyph={false} style={{ marginLeft: k ? -22 : 0, zIndex: 3 - k, boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }} />)}
              </div>
              <div className="grow col" style={{ gap: 7 }}>
                <div className="row between">
                  <span className="h3" style={{ fontSize: 17 }}>{g.emoji} {g.name}</span>
                  <Icon name="chevR" size={18} color="var(--text-2)" />
                </div>
                <div className="row gap10">
                  <div className="avstack">
                    {g.people.map((p, k) => <Avatar key={k} n={p.n} c={p.c} size={24} />)}
                  </div>
                  <span className="small">{g.members} membres · {g.activity}</span>
                </div>
                <div className="row gap8" style={{ marginTop: 2 }}>
                  <span className={'gc-status ' + (g.matches > 0 ? 'live' : 'idle')}>
                    {g.matches > 0 ? `${g.matches} matchs` : 'En attente'}
                  </span>
                  <span className="gc-status idle">{g.status}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <button className="btn btn-dark" style={{ marginTop: 16 }} onClick={onCreate}>
        <Icon name="plus" size={20} /> Créer un nouveau groupe
      </button>
    </div>
  );
}

function ActivityTab({ groups }) {
  const items = [
    { t: 'Drive a matché dans Ciné Couple', s: 'Il y a 1 h', ic: 'heart' },
    { t: 'Tom a rejoint Soirée Coloc', s: 'Il y a 2 h', ic: 'users' },
    { t: 'Nouvelle session lancée', s: 'Hier', ic: 'bolt' },
    { t: 'Parasite élu film gagnant', s: 'Il y a 2 j', ic: 'trophy' },
  ];
  return (
    <div className="scroll pad">
      <h2 className="h2" style={{ margin: '12px 0 16px' }}>Activité</h2>
      <div className="col gap10">
        {items.map((it, i) => (
          <div key={i} className="surface row gap12 fadeup" style={{ padding: 15, animationDelay: i * 0.05 + 's' }}>
            <div className="act-ic"><Icon name={it.ic} size={18} color="var(--red)" /></div>
            <div className="grow"><div style={{ fontWeight: 700, fontSize: 14 }}>{it.t}</div><div className="small" style={{ marginTop: 2 }}>{it.s}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfileTab() {
  return (
    <div className="scroll pad">
      <div className="col" style={{ alignItems: 'center', marginTop: 18 }}>
        <Avatar n="L" c="var(--red)" size={84} />
        <h2 className="h2" style={{ marginTop: 14 }}>Léa Moreau</h2>
        <span className="small">lea.moreau@email.com</span>
      </div>
      <div className="row gap10" style={{ marginTop: 22 }}>
        {[['Films vus', '128'], ['Matchs', '34'], ['Groupes', '3']].map(([l, v]) => (
          <div key={l} className="surface grow center" style={{ padding: '16px 8px' }}>
            <div className="h2" style={{ fontSize: 26 }}>{v}</div>
            <div className="small" style={{ marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
      <div className="col gap2" style={{ marginTop: 20 }}>
        {['Genres préférés', 'Notifications', 'Compte & confidentialité', 'Aide'].map(r => (
          <div key={r} className="row between prow"><span style={{ fontWeight: 600 }}>{r}</span><Icon name="chevR" size={18} color="var(--text-2)" /></div>
        ))}
      </div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [['home', 'Groupes', 'home'], ['activity', 'Activité', 'bolt'], ['profile', 'Profil', 'user']];
  return (
    <div className="bottomnav">
      {items.map(([k, label, ic]) => (
        <button key={k} className={'navitem' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>
          <Icon name={ic} size={23} />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { Home });

/* MatchTonFilm — Matchs (classement, gagnant, reset / nouveau cycle) */
function Matches({ group, ranking, totalVoters, onBack, onReset, onNewCycle, onReplay }) {
  const { fmtRuntime } = window.MTF;
  const winner = ranking[0];
  const rest = ranking.slice(1);

  if (!winner) {
    return (
      <div className="screen">
        <TopBar title="Matchs" sub={group.name} onBack={onBack} />
        <div className="empty" style={{ flex: 1 }}>
          <div className="empty-ic"><Icon name="film" size={32} color="var(--red)" /></div>
          <h2 className="h2" style={{ marginTop: 16 }}>Pas encore de match</h2>
          <p className="body center" style={{ maxWidth: 280, marginTop: 8 }}>Lancez une session de swipe pour faire émerger vos films communs.</p>
          <button className="btn btn-primary" style={{ marginTop: 22, maxWidth: 240 }} onClick={onReplay}><Icon name="film" size={20} color="#fff" /> Swiper des films</button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="row between pad" style={{ padding: '6px 20px 8px', flex: 'none' }}>
        <button className="iconbtn" onClick={onBack}><Icon name="chevL" size={22} /></button>
        <div className="col center" style={{ alignItems: 'center', gap: 1 }}>
          <span className="eyebrow" style={{ fontSize: 10 }}>Résultats</span>
          <span className="h3" style={{ fontSize: 16 }}>{group.emoji} {group.name}</span>
        </div>
        <button className="iconbtn" onClick={onReplay}><Icon name="refresh" size={20} /></button>
      </div>

      <div className="scroll pad" style={{ paddingBottom: 8 }}>
        {/* Winner */}
        <div className="winner fadeup">
          <div className="winner-glow" />
          <Poster movie={winner.movie} w="100%" h={250} radius={20} titleSize={0} glyph={false} className="winner-poster" />
          <div className="winner-badge"><Icon name="trophy" size={15} color="#1a1206" /> FILM GAGNANT</div>
          <div className="winner-info">
            <div className="row gap8" style={{ marginBottom: 8 }}>
              {winner.movie.genres.map(g => <span key={g} className="chip chip-sm" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}>{g}</span>)}
            </div>
            <h1 className="display" style={{ fontSize: 32, textTransform: 'uppercase' }}>{winner.movie.title}</h1>
            <div className="row gap14" style={{ marginTop: 12 }}>
              <div className="winner-stat"><b>{winner.pct}%</b><span>de likes</span></div>
              <div className="winner-divider" />
              <div className="winner-stat"><b>{winner.likes}/{totalVoters}</b><span>votes</span></div>
              <div className="winner-divider" />
              <div className="winner-stat"><b className="row gap6"><Icon name="star" size={15} color="var(--gold)" />{winner.movie.rating.toFixed(1)}</b><span>TMDB</span></div>
            </div>
          </div>
        </div>

        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={onReplay}>
          <Icon name="play" size={18} color="#fff" /> Lancer la soirée
        </button>

        {/* Ranking */}
        <div className="row between" style={{ margin: '26px 0 14px' }}>
          <span className="eyebrow" style={{ color: 'var(--text-2)' }}>Classement du groupe</span>
          <span className="small">{totalVoters} votants</span>
        </div>

        <div className="col gap10">
          {rest.map((r, i) => (
            <div key={r.movie.id} className="rank-row fadeup" style={{ animationDelay: i * 0.04 + 's' }}>
              <span className="rank-num">{i + 2}</span>
              <Poster movie={r.movie} w={42} h={62} radius={8} titleSize={0} glyph={false} />
              <div className="grow col" style={{ gap: 7 }}>
                <div className="row between">
                  <span style={{ fontWeight: 700, fontSize: 14.5 }}>{r.movie.title}</span>
                  <span className="rank-pct">{r.pct}%</span>
                </div>
                <div className="bar"><i style={{ width: r.pct + '%' }} /></div>
                <span className="small" style={{ fontSize: 11.5 }}>{r.likes}/{totalVoters} votes · {fmtRuntime(r.movie.runtime)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="row gap12" style={{ marginTop: 22 }}>
          <button className="btn btn-dark" style={{ flex: 1 }} onClick={onReset}><Icon name="refresh" size={19} /> Réinitialiser</button>
          <button className="btn btn-ghost" style={{ flex: 1 }} onClick={onNewCycle}><Icon name="sparkle" size={18} color="var(--red)" /> Nouveau cycle</button>
        </div>
      </div>
    </div>
  );
}

window.Matches = Matches;

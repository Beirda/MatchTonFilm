/* MatchTonFilm — Welcome */
function Welcome({ onSignup, onLogin }) {
  const { MOVIES } = window.MTF;
  // marquee posters for ambience
  const colA = [MOVIES[0], MOVIES[3], MOVIES[6], MOVIES[9], MOVIES[12]];
  const colB = [MOVIES[1], MOVIES[4], MOVIES[7], MOVIES[10], MOVIES[13]];
  const colC = [MOVIES[2], MOVIES[5], MOVIES[8], MOVIES[11], MOVIES[15]];
  const Col = ({ list, dir, dur }) => (
    <div className="wl-col" style={{ animationDuration: dur + 's', animationDirection: dir }}>
      {[...list, ...list].map((m, i) => (
        <Poster key={i} movie={m} w="100%" h={150} radius={12} titleSize={11} glyph={false} />
      ))}
    </div>
  );
  return (
    <div className="screen">
      <div className="wl-posters">
        <Col list={colA} dir="normal" dur={42} />
        <Col list={colB} dir="reverse" dur={52} />
        <Col list={colC} dir="normal" dur={36} />
      </div>
      <div className="wl-veil" />
      <div className="wl-content">
        <div className="wl-logo fadeup">
          <div className="wl-logo-mark"><Icon name="heart" size={20} fill="#fff" color="#fff" /></div>
          <span>MATCH<span style={{ color: 'var(--red)' }}>TON</span>FILM</span>
        </div>
        <h1 className="display fadeup" style={{ fontSize: 46, marginTop: 18, animationDelay: '0.05s' }}>
          Arrêtez de<br />débattre.<br /><span style={{ color: 'var(--red)' }}>Swipez.</span>
        </h1>
        <p className="body fadeup" style={{ marginTop: 14, maxWidth: 300, animationDelay: '0.1s' }}>
          Le film parfait pour ce soir, choisi par tout le groupe en moins de cinq minutes.
        </p>
        <div className="col gap10 fadeup" style={{ marginTop: 26, animationDelay: '0.16s' }}>
          <button className="btn btn-primary" onClick={onSignup}>Créer un compte</button>
          <button className="btn btn-ghost" onClick={onLogin}>
            <Icon name="google" size={20} /> Continuer avec Google
          </button>
          <button className="linkbtn" onClick={onLogin}>Déjà membre ? <b>Se connecter</b></button>
        </div>
      </div>
    </div>
  );
}
window.Welcome = Welcome;

/* MatchTonFilm — Tweaks layer (design-system knobs) */
const MTF_TWEAKS = /*EDITMODE-BEGIN*/{
  "accent": ["#ff3b47", "#ff5d67", "#c4121f"],
  "glow": 1,
  "radius": 26,
  "display": "Oswald"
}/*EDITMODE-END*/;

function mtfHexRgb(h) {
  const n = h.replace('#', '');
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) };
}

function TweaksLayer() {
  const [t, setTweak] = useTweaks(MTF_TWEAKS);

  useEffect(() => {
    const s = document.documentElement.style;
    const [red, bright, deep] = t.accent;
    const { r, g, b } = mtfHexRgb(red);
    s.setProperty('--red', red);
    s.setProperty('--red-bright', bright);
    s.setProperty('--red-deep', deep);
    s.setProperty('--red-soft', `rgba(${r},${g},${b},0.14)`);
    s.setProperty('--red-line', `rgba(${r},${g},${b},0.32)`);
    s.setProperty('--glow-red', `0 0 0 1px rgba(${r},${g},${b},${0.32 * t.glow}), 0 8px 30px rgba(${r},${g},${b},${0.30 * t.glow})`);
    s.setProperty('--glow-red-lg', `0 10px 50px rgba(${r},${g},${b},${0.40 * t.glow})`);
    s.setProperty('--r-card', t.radius + 'px');
    s.setProperty('--font-display', `'${t.display}', 'Oswald', sans-serif`);
  }, [t]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Accent cinéma" />
      <TweakColor label="Rouge" value={t.accent}
        options={[
          ['#ff3b47', '#ff5d67', '#c4121f'],
          ['#e50914', '#ff2a36', '#9b0810'],
          ['#ff5a3c', '#ff7a60', '#cc3a20'],
          ['#ff2d78', '#ff5a96', '#c50f54'],
        ]}
        onChange={(v) => setTweak('accent', v)} />

      <TweakSection label="Ambiance" />
      <TweakSlider label="Intensité des lueurs" value={t.glow} min={0} max={1.6} step={0.1}
        onChange={(v) => setTweak('glow', v)} />
      <TweakSlider label="Rayon des cartes" value={t.radius} min={14} max={32} step={1} unit="px"
        onChange={(v) => setTweak('radius', v)} />

      <TweakSection label="Typographie" />
      <TweakRadio label="Police display" value={t.display}
        options={['Oswald', 'Bebas Neue', 'Anton']}
        onChange={(v) => setTweak('display', v)} />
    </TweaksPanel>
  );
}

window.TweaksLayer = TweaksLayer;

// Heroicon helper — pulls outline SVGs from the unpkg CDN at runtime.
// Matches `<x-heroicon-o-*>` from the Laravel codebase 1:1.
const HeroIcon = ({ name, className = "w-6 h-6", strokeWidth = 1.5 }) => {
  const [svg, setSvg] = React.useState(null);
  React.useEffect(() => {
    let cancelled = false;
    fetch(`https://unpkg.com/heroicons@2.1.5/24/outline/${name}.svg`)
      .then(r => r.text())
      .then(t => { if (!cancelled) setSvg(t); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [name]);
  // crude but effective: inject the svg text and let CSS size it
  return (
    <span
      className={`jk-icon ${className}`}
      style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}
      dangerouslySetInnerHTML={{ __html: svg || "" }}
    />
  );
};

// Style the injected SVG to fit
const heroIconStyle = document.createElement("style");
heroIconStyle.textContent = `
.jk-icon svg { width: 100%; height: 100%; stroke: currentColor; stroke-width: 1.5; fill: none; }
.w-5 { width: 1.25rem; height: 1.25rem; }
.w-6 { width: 1.5rem; height: 1.5rem; }
.w-7 { width: 1.75rem; height: 1.75rem; }
.w-8 { width: 2rem;    height: 2rem; }
.w-12 { width: 3rem;   height: 3rem; }
`;
document.head.appendChild(heroIconStyle);

window.HeroIcon = HeroIcon;

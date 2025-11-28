import React, { useEffect, useState } from "react";
import { getSpells } from "../api";
import { useNavigate } from "react-router-dom";
import "../index.css";

const TYPE_OPTIONS = [
  "All",
  "Charm","Conjuration","Spell","Transfiguration","HealingSpell","DarkCharm","Jinx","Curse",
  "MagicalTransportation","Hex","CounterSpell","DarkArts","CounterJinx","CounterCharm",
  "Untransfiguration","BindingMagicalContractVanishment"
];

// map "light" (string) -> css color. fallback to gray
function mapLightToColor(light) {
  if (!light) return "#9CA3AF";
  const l = light.toLowerCase();
  if (l.includes("blue")) return "#2563EB";
  if (l.includes("red") || l.includes("scarlet")) return "#DC2626";
  if (l.includes("green")) return "#059669";
  if (l.includes("orange") || l.includes("fiery")) return "#F97316";
  if (l.includes("purple")) return "#7C3AED";
  if (l.includes("gold")) return "#D4AF37";
  if (l.includes("white") || l.includes("transparent")) return "#374151";
  if (l.includes("pink")) return "#ec4899";
  if (l.includes("grey") || l.includes("gray")) return "#6B7280";
  return "#6B7280";
}

export default function SpellsList() {
  const [type, setType] = useState("Charm");
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const t = type === "All" ? undefined : type;
    getSpells(t)
      .then((data) => {
        if (!mounted) return;
        setSpells(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "Error on searching spells");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; }
  }, [type]);

  // filtered by search query
  const visible = spells.filter(s => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (s.name || "").toLowerCase().includes(q) ||
           (s.effect || "").toLowerCase().includes(q) ||
           (s.incantation || "").toLowerCase().includes(q);
  });

  return (
    <div className="page-container">
      <div className="page-header" style={{ alignItems: "flex-start", gap: 12 }}>
  <h1 className="title">Spells</h1>

  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <select
      value={type}
      onChange={e => setType(e.target.value)}
      className="select"
    >
      {TYPE_OPTIONS.map(t => (
        <option key={t} value={t}>{t}</option>
      ))}
    </select>

    <input
      className="search"
      placeholder="Search name, incantation or effect"
      value={query}
      onChange={e => setQuery(e.target.value)}
    />
  </div>
</div>

      {loading && <div className="loader-wrap"><div className="spinner" />Loading spells...</div>}
      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="houses-grid">
            {visible.map(s => {
              const id = s.id;
              const color = mapLightToColor(s.light);
              return (
                <article
                  key={id}
                  className="spell-card"
                  role="button"
                  onClick={() => navigate(`/spells/${encodeURIComponent(id)}`)}
                  style={{ cursor: "pointer" }}
                >
                  <header className="house-card-header">
                    <h3 className="house-name">{s.name}</h3>
                    <span className="badge" style={{ background: color, color: "#fff" }}>{s.type}</span>
                  </header>
                  <div className="house-body">
                    <p className="muted"><strong>Incantation:</strong> {s.incantation ?? "—"}</p>
                    <p className="muted"><strong>Effect:</strong> {s.effect ?? "—"}</p>
                    <p className="values"><strong>Light:</strong> {s.light ?? "—"} • <strong>Verbal:</strong> {String(s.canBeVerbal)}</p>
                    <p className="muted"><strong>Creator:</strong> {s.creator}</p>
                  </div>
                </article>
              );
            })}
          </div>

          {visible.length === 0 && <div className="hint">No spell found</div>}
        </>
      )}
    </div>
  );
}
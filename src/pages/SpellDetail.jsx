import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getSpellDetail } from "../api";
import "../index.css";

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

export default function SpellDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [spell, setSpell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!id) {
      setError("ID inválido");
      setLoading(false);
      return;
    }
    setLoading(true);
    getSpellDetail(id)
      .then(data => { if (mounted) setSpell(data ?? null); })
      .catch(err => { if (mounted) setError(err.message || "Error on loading spell"); })
      .finally(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [id]);

  if (loading) return <div className="loader-wrap"><div className="spinner" />Loading spell...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!spell) return <div className="empty">Spell not found. <Link to="/spells">Back</Link></div>;

  const color = mapLightToColor(spell.light);
  const verbal = spell.canBeVerbal === true ? "Yes" : (spell.canBeVerbal === false ? "No" : "Unknown");

  return (
    <div className="page-container">
      <div className="detail-card">
        <div className="detail-header" style={{ alignItems: "flex-start", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <h1 className="detail-title">{spell.name}</h1>
            <span className="spell-badge" style={{ background: color }}>
              {spell.type ?? "—"}
            </span>
          </div>

          <div className="detail-meta">
            {spell.incantation && <div><strong>Incantation:</strong> {spell.incantation}</div>}
            <div><strong>Light:</strong> {spell.light ?? "—"}</div>
            <div><strong>Verbal:</strong> {verbal}</div>
            {spell.creator && <div><strong>Creator:</strong> {spell.creator}</div>}
          </div>
        </div>

        <div className="detail-body" style={{ marginTop: 12 }}>
          <h3 style={{ margin: "0 0 8px 0" }}>Effect</h3>
          <p className="effect-text">{spell.effect ?? "—"}</p>

          <div className="detail-actions" style={{ marginTop: 18 }}>
            <button className="btn" onClick={() => navigate(-1)}>← Back</button>
            
          </div>

          {showRaw && (
            <div style={{ marginTop: 18 }}>
              <p style={{ margin: 0 }}><strong>Raw JSON</strong></p>
              <pre className="json-raw">{JSON.stringify(spell, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
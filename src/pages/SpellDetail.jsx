import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getSpellDetail } from "../api"; 
import "../index.css";
import { trackEvent } from "../analytics"; 
import { getPlatform } from "../utils/getPlatform";

const LS_KEY_SPELLS = "favorite_spells";
function getFavoriteSpellIds() {
  try {
    const raw = localStorage.getItem(LS_KEY_SPELLS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function setFavoriteSpellIds(ids) {
  try {
    localStorage.setItem(LS_KEY_SPELLS, JSON.stringify(ids));
  } catch {}
}
function isSpellFavorited(id) {
  return getFavoriteSpellIds().includes(id);
}
function addFavoriteSpell(id) {
  const ids = getFavoriteSpellIds();
  if (!ids.includes(id)) {
    ids.push(id);
    setFavoriteSpellIds(ids);
  }
}
function removeFavoriteSpell(id) {
  const ids = getFavoriteSpellIds().filter((x) => x !== id);
  setFavoriteSpellIds(ids);
}

export default function SpellDetail() {
  const { id } = useParams();
  const [spell, setSpell] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasTrackedDetailView = useRef(false);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getSpellDetail(id);
        if (!mounted) return;
        setSpell(data);

        const resolvedId = data?.id ?? id;
        setIsFavorited(isSpellFavorited(resolvedId));

        if (!hasTrackedDetailView.current) {         
          try {
            trackEvent("Spell Detail Viewed", {
              spell_id: data?.id ?? id,
              spell_name: data?.name ?? "Unnamed",
              platform: getPlatform(),
            });
          } catch (e) {
            console.warn("tracking error (Spell Detail Viewed):", e);
          }
          hasTrackedDetailView.current = true;
        }
      } catch (err) {
        if (mounted) setError(err.message || "Error loading spell");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) load();

    return () => {
      mounted = false;
    };
  }, [id]);
  const toggleFavorite = () => {
    const resolvedId = spell?.id ?? id;
    const resolvedName = spell?.name ?? "Unnamed";
    if (!resolvedId) return;

    if (isFavorited) {
      removeFavoriteSpell(resolvedId);
      setIsFavorited(false);
      try {
        trackEvent("Spell Unfavorited", { spell_id: resolvedId, spell_name: resolvedName, platform: getPlatform() });
      } catch (e) {
        console.warn("tracking error (Spell Unfavorited):", e);
      }
    } else {
      addFavoriteSpell(resolvedId);
      setIsFavorited(true);
      try {
        trackEvent("Spell Favorited", { spell_id: resolvedId, spell_name: resolvedName, platform: getPlatform() });
      } catch (e) {
        console.warn("tracking error (Spell Favorited):", e);
      }
    }
  };

  if (loading)
    return (
      <div className="loader-wrap">
        <div className="spinner" />Loading...
      </div>
    );

  if (error) return <div className="error">Error: {error}</div>;
  if (!spell)
    return (
      <div className="empty">
        Spell not found. <Link to="/spells">Back</Link>
      </div>
    );

  const name = spell.name ?? "Unnamed";
  const effect = spell.effect ?? "—";
  const incantation = spell.incantation ?? "—";
  const type = spell.type ?? "—";
  const creator = spell.creator ?? "—";

  return (
    <div className="page-container">
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">{name}</h1>
            <div className="muted"><strong>Type:</strong> {type}</div>
          </div>

          <div className="detail-meta">
            <div><strong>Creator:</strong> {creator}</div>
          </div>
        </div>

        <div className="detail-body">
          <p><strong>Incantation:</strong> {incantation}</p>
          <p><strong>Effect:</strong> {effect}</p>

          <div className="detail-actions" style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <Link
              to="/spells"
              className="btn"
              onClick={() => {
                try {
                  trackEvent("Spell Detail Back Clicked", { spell_id: id, spell_name: name, platform: getPlatform() });
                } catch (e) {
                  console.warn("tracking error (Spell Detail Back Clicked):", e);
                }
              }}
            >
              Back
            </Link>

            <button
              className="btn"
              onClick={toggleFavorite}
              aria-pressed={isFavorited}
              title={isFavorited ? "Unfavorite" : "Favorite"}
              style={{
                backgroundColor: isFavorited ? "#ffd54f" : undefined,
                border: "1px solid #ccc",
              }}
            >
              {isFavorited ? "Unfavorite" : "Favorite"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
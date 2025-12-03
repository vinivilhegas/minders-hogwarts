import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHouses, getSpells } from "../api";
import "../index.css";
import { trackEvent } from "../analytics";

function getFavoriteHouseIds() {
  try {
    const raw = localStorage.getItem("favorite_houses");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function getFavoriteSpellIds() {
  try {
    const raw = localStorage.getItem("favorite_spells");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function setFavoriteHouseIds(ids) {
  try { localStorage.setItem("favorite_houses", JSON.stringify(ids)); } catch {}
}
function setFavoriteSpellIds(ids) {
  try { localStorage.setItem("favorite_spells", JSON.stringify(ids)); } catch {}
}

function removeFavorite(type, id) {
  if (type === "house") {
    const ids = getFavoriteHouseIds().filter(x => x !== id);
    setFavoriteHouseIds(ids);
  } else if (type === "spell") {
    const ids = getFavoriteSpellIds().filter(x => x !== id);
    setFavoriteSpellIds(ids);
  }
}

export default function FavoritesList() {
  const [items, setItems] = useState([]); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try { trackEvent("Favorites List Viewed", { platform: "web" }); } catch (e) { console.warn(e); }

    let mounted = true;
    setLoading(true);

    Promise.all([ getHouses(), getSpells() ])
      .then(([housesData, spellsData]) => {
        if (!mounted) return;
        const houses = Array.isArray(housesData) ? housesData : [];
        const spells = Array.isArray(spellsData) ? spellsData : [];

        const favHouseIds = getFavoriteHouseIds();
        const favSpellIds = getFavoriteSpellIds();

        const favHouses = houses
          .filter(h => favHouseIds.includes(h.id ?? (h.url ? h.url.split("/").pop() : undefined)))
          .map(h => ({
            type: "house",
            id: h.id ?? (h.url ? h.url.split("/").pop() : undefined),
            name: h.name ?? "Unnamed",
            meta: h,
          }));

        const favSpells = spells
          .filter(s => favSpellIds.includes(s.id))
          .map(s => ({
            type: "spell",
            id: s.id,
            name: s.name ?? "Unnamed",
            meta: s,
          }));

        setItems([...favHouses, ...favSpells]);
      })
      .catch((err) => {
        console.warn("error loading favorites data:", err);
        setItems([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => { mounted = false; };
  }, []);
  const handleUnfavorite = (type, id, name) => {
    removeFavorite(type, id);
    setItems(prev => prev.filter(item => !(item.type === type && item.id === id)));

    try { trackEvent("Item Unfavorited", { item_type: type, item_id: id, item_name: name, platform: "web", source: "favorites_list" }); }
    catch (e) { console.warn(e); }
  };

  if (loading) return <div className="loader-wrap"><div className="spinner" />Loading...</div>;
  if (!items.length) return <div className="empty">No favorites yet.</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="title">Your Favorites</h1>
        <p className="subtitle">Houses and Spells you marked as favorite</p>
      </div>

      <div className="houses-grid">
        {items.map(item => {
          const { type, id, name } = item;
          return (
            <article
              key={`${type}-${id}`}
              className="house-card"
              role="button"
              onClick={() => {
                if (type === "house") navigate(`/houses/${encodeURIComponent(id)}`);
                else if (type === "spell") navigate(`/spells/${encodeURIComponent(id)}`);
              }}
              style={{ cursor: "pointer" }}
            >
              <header className="house-card-header">
                <h3 className="house-name">{name}</h3>
                <span className="badge">{type}</span>
              </header>

              <div className="house-body">
                {}
                {type === "house" ? (
                  <>
                    <p className="muted"><strong>Founder:</strong> {item.meta?.founder ?? "—"}</p>
                  </>
                ) : (
                  <>
                    <p className="muted"><strong>Creator:</strong> {item.meta?.creator ?? "—"}</p>
                  </>
                )}
              </div>

              <div style={{ padding: 8 }}>
                <button
                  className="btn small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnfavorite(type, id, name);
                  }}
                >
                  Unfavorite
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
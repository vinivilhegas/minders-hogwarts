import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { getHouseDetail } from "../api";
import "../index.css";
import { trackEvent } from "../analytics"; // helper de tracking

async function resolveHouseImage(name) {
  if (!name) {
    const fallback = await import("../assets/logo.png");
    return fallback.default;
  }

  const normalized = name.toLowerCase().replace(/\s+/g, "");

  try {
    const img = await import(`../assets/houses/${normalized}.png`);
    return img.default;
  } catch {
    const fallback = await import("../assets/logo.png");
    return fallback.default;
  }
}

/**
 * Helper simples de favorites usando localStorage
 */
function getFavoriteIds() {
  try {
    const raw = localStorage.getItem("favorite_houses");
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function setFavoriteIds(ids) {
  try {
    localStorage.setItem("favorite_houses", JSON.stringify(ids));
  } catch {}
}
function isFavoritedId(id) {
  const ids = getFavoriteIds();
  return ids.includes(id);
}
function addFavoriteId(id) {
  const ids = getFavoriteIds();
  if (!ids.includes(id)) {
    ids.push(id);
    setFavoriteIds(ids);
  }
}
function removeFavoriteId(id) {
  const ids = getFavoriteIds().filter((x) => x !== id);
  setFavoriteIds(ids);
}

export default function HouseDetail() {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasTrackedDetailView = useRef(false); // evita duplicação em StrictMode
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getHouseDetail(id);
        if (!mounted) return;

        setHouse(data);

        // atualiza estado do favorito com base no id real (futura consistência)
        const resolvedId = data.id ?? id;
        setIsFavorited(isFavoritedId(resolvedId));

        // 🟦 TRACK — agora com house_name e após os dados carregarem
        if (!hasTrackedDetailView.current) {
          console.log("🔵 Tracking House Detail Viewed:", {
            house_id: data.id ?? id,
            house_name: data.name,
            platform: "web",
          });

          try {
            trackEvent("House Detail Viewed", {
              house_id: data.id ?? id,
              house_name: data.name,
              platform: "web",
            });
          } catch (e) {
            console.warn("tracking error (House Detail Viewed):", e);
          }

          hasTrackedDetailView.current = true;
        }

        const imgPath = await resolveHouseImage(data?.name);
        if (mounted) setImageUrl(imgPath);
      } catch (err) {
        if (mounted) setError(err.message || "Error on loading details");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    if (id) load();

    return () => (mounted = false);
  }, [id]);
  // toggle favorito (pode ser chamado no botão)
  const toggleFavorite = () => {
    const resolvedId = house?.id ?? id;
    const resolvedName = house?.name ?? "Unnamed";

    if (!resolvedId) return;

    if (isFavorited) {
      removeFavoriteId(resolvedId);
      setIsFavorited(false);
      console.log("🟡 Tracking House Unfavorited:", { house_id: resolvedId, house_name: resolvedName });
      try {
        trackEvent("House Unfavorited", {
          house_id: resolvedId,
          house_name: resolvedName,
          platform: "web",
        });
      } catch (e) {
        console.warn("tracking error (House Unfavorited):", e);
      }
    } else {
      addFavoriteId(resolvedId);
      setIsFavorited(true);
      console.log("🟢 Tracking House Favorited:", { house_id: resolvedId, house_name: resolvedName });
      try {
        trackEvent("House Favorited", {
          house_id: resolvedId,
          house_name: resolvedName,
          platform: "web",
        });
      } catch (e) {
        console.warn("tracking error (House Favorited):", e);
      }
    }
  };

  if (loading)
    return (
      <div className="loader-wrap">
        <div className="spinner" />
        Loading...
      </div>
    );

  if (error) return <div className="error">Error: {error}</div>;
  if (!house)
    return (
      <div className="empty">
        House not found. <Link to="/home">Back</Link>
      </div>
    );

  const name = house.name ?? "Unnamed";
  const colours = house.houseColours ?? "—";
  const founder = house.founder ?? "—";
  const animal = house.animal ?? "—";
  const element = house.element ?? "—";
  const ghost = house.ghost ?? "—";
  const commonRoom = house.commonRoom ?? "—";
  const heads = Array.isArray(house.heads)
    ? house.heads.map((h) => `${h.firstName} ${h.lastName}`)
    : [];
  const traits = Array.isArray(house.traits)
    ? house.traits.map((t) => t.name)
    : [];
    return (
    <div className="page-container">
      <div className="detail-card">
        <div className="detail-header">
          <div>
            <h1 className="detail-title">{name}</h1>
            <div className="muted">
              <strong>Colors:</strong> {colours}
            </div>
          </div>

          <div className="detail-meta">
            <div>
              <strong>Founder:</strong> {founder}
            </div>
            <div>
              <strong>Animal:</strong> {animal}
            </div>
            <div>
              <strong>Element:</strong> {element}
            </div>
          </div>
        </div>

        <div className="detail-body">
          <p>
            <strong>Ghost:</strong> {ghost}
          </p>
          <p>
            <strong>Common room:</strong> {commonRoom}
          </p>

          <div className="heads-traits-image">
            <div className="ht-section">
              <p>
                <strong>Heads:</strong>
              </p>
              <ul>
                {heads.length
                  ? heads.map((h, idx) => <li key={idx}>{h}</li>)
                  : <li>—</li>}
              </ul>
            </div>

            <div className="ht-section">
              <p>
                <strong>Traits:</strong>
              </p>
              <ul>
                {traits.length
                  ? traits.map((t, idx) => <li key={idx}>{t}</li>)
                  : <li>—</li>}
              </ul>
            </div>

            <div className="ht-image">
              {imageUrl && <img src={imageUrl} alt={`${name} emblem`} className="house-image" />}
            </div>
          </div>

          <div className="detail-actions" style={{ marginTop: 18, display: "flex", gap: 8 }}>
            <Link
              to="/home"
              className="btn"
              onClick={() => {
                console.log("🟡 Tracking Back Click:", {
                  house_id: id,
                  house_name: name,
                });

                try {
                  trackEvent("House Detail Back Clicked", {
                    house_id: id,
                    house_name: name,
                    platform: "web",
                  });
                } catch (e) {
                  console.warn("tracking error (House Detail Back Clicked):", e);
                }
              }}
            >
              Back
            </Link>

            {/* Favorite button dual-state */}
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
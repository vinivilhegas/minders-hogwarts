import React, { useEffect, useState, useRef } from "react";
import { getHouses } from "../api";
import { useNavigate } from "react-router-dom";
import "../index.css";
import { trackEvent } from "../analytics"; // ADIÇÃO: helper de tracking

export default function HousesList() {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const hasTrackedListView = useRef(false); // evita duplicação em StrictMode

  useEffect(() => {
    // TRACK: dispara apenas uma vez por montagem lógica
    if (!hasTrackedListView.current) {
      try {
        trackEvent("Houses List Viewed", { platform: "web" });
      } catch (e) {
        console.warn("tracking error (Houses List Viewed):", e);
      }
      hasTrackedListView.current = true;
    }

    let mounted = true;
    setLoading(true);
    getHouses()
      .then((data) => {
        if (mounted) setHouses(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Error on searching houses");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="title">Here is where the magic happens...</h1>
        <p className="subtitle">Get to know all the houses</p>
      </div>

      {loading && (
        <div className="loader-wrap">
          <div className="spinner" aria-hidden="true"></div>
          <div>Loading houses...</div>
        </div>
      )}

      {error && <div className="error">Error: {error}</div>}

      {!loading && !error && (
        <>
          <div className="houses-grid">
            {houses.map((h) => {
              const id = h.id ?? (h.url ? h.url.split("/").pop() : undefined);
              const name = h.name ?? "Unnamed";
              const colours = h.houseColours ?? "—";
              const founder = h.founder ?? "—";
              const animal = h.animal ?? "—";
              const element = h.element ?? "—";
              const ghost = h.ghost ?? "—";
              const commonRoom = h.commonRoom ?? "—";
              const heads = Array.isArray(h.heads)
                ? h.heads.map((x) => `${x.firstName} ${x.lastName}`).join(", ")
                : "—";
              const traits = Array.isArray(h.traits)
                ? h.traits.map((t) => t.name).slice(0, 5).join(", ")
                : "—";
              return (
                <article
                  key={id ?? name}
                  className="house-card"
                  role="button"
                  onClick={() => {
                    // TRACK: clique no card (antes de navegar)
                    try {
                      trackEvent("House Card Clicked", {
                        house_id: id,
                        house_name: name,
                        platform: "web",
                      });
                    } catch (e) {
                      console.warn("tracking error (House Card Clicked):", e);
                    }
                    navigate(`/houses/${encodeURIComponent(id)}`);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <header className="house-card-header">
                    <h3 className="house-name">{name}</h3>
                    <span className="badge">{colours}</span>
                  </header>

                  <div className="house-body">
                    <p className="muted"><strong>Founder:</strong> {founder}</p>
                    <p className="muted"><strong>Animal:</strong> {animal} • <strong>Element:</strong> {element}</p>
                    <p className="muted"><strong>Ghost:</strong> {ghost}</p>
                    <p className="muted"><strong>Common room:</strong> {commonRoom}</p>
                    <p className="values"><strong>Heads:</strong> {heads}</p>
                    <p className="values">
                      <strong>Traits:</strong> {traits}
                      {Array.isArray(h.traits) && h.traits.length > 5 ? "…" : ""}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
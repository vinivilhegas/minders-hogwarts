import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getHouseDetail } from "../api";
import "../index.css";

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
export default function HouseDetail() {
  const { id } = useParams();
  const [house, setHouse] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const data = await getHouseDetail(id);
        if (!mounted) return;
        setHouse(data);

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

  if (loading) return <div className="loader-wrap"><div className="spinner" />Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!house) return <div className="empty">House not found. <Link to="/home">Back</Link></div>;

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
            <div className="muted"><strong>Colors:</strong> {colours}</div>
          </div>

          <div className="detail-meta">
            <div><strong>Founder:</strong> {founder}</div>
            <div><strong>Animal:</strong> {animal}</div>
            <div><strong>Element:</strong> {element}</div>
          </div>
        </div>

        <div className="detail-body">
          <p><strong>Ghost:</strong> {ghost}</p>
          <p><strong>Common room:</strong> {commonRoom}</p>

          {/* HEADS | TRAITS | IMAGE */}
          <div className="heads-traits-image">
            <div className="ht-section">
              <p><strong>Heads:</strong></p>
              <ul>
                {heads.length ? heads.map((h, idx) => <li key={idx}>{h}</li>) : <li>—</li>}
              </ul>
            </div>

            <div className="ht-section">
              <p><strong>Traits:</strong></p>
              <ul>
                {traits.length ? traits.map((t, idx) => <li key={idx}>{t}</li>) : <li>—</li>}
              </ul>
            </div>

            <div className="ht-image">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={`${name} emblem`}
                  className="house-image"
                />
              )}
            </div>
          </div>

          <div className="detail-actions" style={{ marginTop: 18 }}>
            <Link to="/home" className="btn">Back</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
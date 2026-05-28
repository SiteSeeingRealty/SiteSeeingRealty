import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProperties } from '../context/PropertyContext';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

const mapIcon = new L.DivIcon({
  className: 'custom-map-marker',
  html: `<div class="marker-pin"></div>`,
  iconSize: [30, 42],
  iconAnchor: [15, 42]
});

const VIDEO_EXT = /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i;
const isVideo = (url) => VIDEO_EXT.test(url || '');

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { properties } = useProperties();

  const property = properties.find(p => p.id === id);
  const gallery = Array.isArray(property?.gallery) ? property.gallery : [];

  const [lightboxIndex, setLightboxIndex] = useState(null);
  const isOpen = lightboxIndex !== null;

  const close = useCallback(() => setLightboxIndex(null), []);
  const next = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i + 1) % gallery.length));
  }, [gallery.length]);
  const prev = useCallback(() => {
    setLightboxIndex((i) => (i === null ? i : (i - 1 + gallery.length) % gallery.length));
  }, [gallery.length]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, close, next, prev]);

  if (!property) {
    return (
      <div className="pt-main" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Property Not Found</h2>
        <button className="button" onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="property-details-page">
      <div className="pd-hero">
        <img src={property.image} alt={property.title} className="pd-hero-bg" style={{ viewTransitionName: 'hero-image' }} />
        <div className="pd-hero-overlay"></div>
        <div className="holder">
          <button className="button back-btn" onClick={() => navigate(-1)}>← Back to Listings</button>
          <h1>{property.title}</h1>
          <div className="pd-meta">
            <span>{property.type}</span> | <span>{property.size}</span> | <span>{property.price}</span>
          </div>
        </div>
      </div>

      <div className="holder pd-content">
        <div className="pd-col pd-main">
          <h2>About this property</h2>
          <p>{property.description}</p>

          {property.documents && property.documents.length > 0 && (
            <div className="pd-docs">
              <h3>Verified Paperwork</h3>
              <ul>
                {property.documents.map((doc, i) => (
                  <li key={i}><a href="#" className="link-flash">📄 {doc}</a></li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="pd-col pd-sidebar">
          <h3>Location</h3>
          <div className="pd-map">
            <MapContainer center={[property.lat, property.lng]} zoom={14} scrollWheelZoom={false} style={{ width: '100%', height: '100%' }}>
              <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution="&copy; OpenStreetMap contributors &copy; CARTO" subdomains="abcd" maxZoom={20} />
              <Marker position={[property.lat, property.lng]} icon={mapIcon} />
            </MapContainer>
          </div>
          <button className="button pd-contact">Inquire Now</button>
          <a href={`https://www.google.com/maps/search/?api=1&query=${property.lat},${property.lng}`} target="_blank" rel="noreferrer" className="button pd-contact" style={{marginTop: '15px', display: 'flex', justifyContent: 'center', backgroundColor: 'transparent', border: '1px solid var(--c2)', color: 'var(--c2)'}}>Open in Google Maps</a>
        </div>
      </div>

      {gallery.length > 0 && (
        <div className="holder pd-gallery">
          <h2>Gallery</h2>
          <div className="pd-gallery-grid">
            {gallery.map((url, i) => (
              <button key={i} className="pd-gallery-item" onClick={() => setLightboxIndex(i)} aria-label={`Open media ${i + 1}`}>
                {isVideo(url) ? (
                  <>
                    <video src={url} muted playsInline preload="metadata" />
                    <span className="pd-play-badge" aria-hidden="true">▶</span>
                  </>
                ) : (
                  <img src={url} alt={`${property.title} gallery ${i + 1}`} loading="lazy" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div className="pd-lightbox" onClick={close}>
          <button className="pd-lb-close" onClick={close} aria-label="Close">×</button>

          {gallery.length > 1 && (
            <button className="pd-lb-arrow pd-lb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
          )}

          <div className="pd-lb-stage" onClick={(e) => e.stopPropagation()}>
            {isVideo(gallery[lightboxIndex]) ? (
              <video src={gallery[lightboxIndex]} controls autoPlay className="pd-lb-media" />
            ) : (
              <img src={gallery[lightboxIndex]} alt={`${property.title} ${lightboxIndex + 1}`} className="pd-lb-media" />
            )}
            <div className="pd-lb-counter">{lightboxIndex + 1} / {gallery.length}</div>
          </div>

          {gallery.length > 1 && (
            <button className="pd-lb-arrow pd-lb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
          )}
        </div>
      )}
    </div>
  );
}

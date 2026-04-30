import { useState, useEffect, useRef } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

const DISTRICT_GEOJSON_URL =
  "/india_districts.geojson";

const COLORS = [
  "#FF6B6B","#FF8E53","#FFC300","#2ECC71","#1ABC9C",
  "#3498DB","#9B59B6","#E91E63","#00BCD4","#8BC34A",
  "#FF5722","#F06292","#AED581","#4DB6AC","#7986CB",
  "#FFB74D","#A1887F","#81C784","#F48FB1","#80CBC4",
  "#CE93D8","#FFCC02","#80DEEA","#EF9A9A","#FFF176",
  "#A5D6A7","#BCAAA4","#B0BEC5","#90CAF9","#FFAB91",
];

const weatherEmoji = (condition) => {
  const map = {
    Clear:"☀️", Clouds:"☁️", Rain:"🌧️", Drizzle:"🌦️",
    Thunderstorm:"⛈️", Snow:"❄️", Mist:"🌫️", Haze:"🌫️",
    Fog:"🌫️", Smoke:"🌫️", Dust:"🌪️",
  };
  return map[condition] || "🌤️";
};

function FitIndia() {
  const map = useMap();
  useEffect(() => {
    map.fitBounds([[6.5, 68.0], [37.5, 97.5]], { padding: [10, 10] });
    map.setMaxBounds([[2.0, 58.0], [42.0, 102.0]]);
    map.setMinZoom(4);
  }, [map]);
  return null;
}

export default function MapSection({ onStateSelect, onAskAI }) {
  const [geoData, setGeoData]             = useState(null);
  const [geoError, setGeoError]           = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [hoveredName, setHoveredName]     = useState("");
  const [apiData, setApiData]             = useState(null);
  const [apiLoading, setApiLoading]       = useState(false);
  const [apiError, setApiError]           = useState(null);
  const [crops, setCrops]                 = useState(null);
  const [cropsLoading, setCropsLoading]   = useState(false);
  const colorMapRef                       = useRef({});

  // ── Fetch crop recommendations when weather+soil loads ──────
  useEffect(() => {
    if (!apiData || !selectedDistrict) return;
    setCrops(null);
    setCropsLoading(true);

    const prompt = `Based on current conditions in ${selectedDistrict.district} district, ${selectedDistrict.state}, India, list top 3-4 best crops to grow right now. Be brief — crop name with one short reason each.`;

    fetch("https://agrifriend-backend.onrender.com/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        state:    `${selectedDistrict.district}, ${selectedDistrict.state}`,
        weather:  apiData.weather,
        soil:     apiData.soil,
      }),
    })
      .then((r) => r.json())
      .then((data) => { setCrops(data.reply); setCropsLoading(false); })
      .catch(() => { setCrops("Unable to fetch recommendations."); setCropsLoading(false); });
  }, [apiData]);

  // ── Fetch GeoJSON ───────────────────────────────────────────
  useEffect(() => {
    fetch(DISTRICT_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load map");
        return r.json();
      })
      .then((data) => {
        // Assign color per state (same state = same color)
        const stateColors = {};
        let colorIndex = 0;
        data.features.forEach((f) => {
          const state = f.properties.state || "Unknown";
          if (!stateColors[state]) {
            stateColors[state] = COLORS[colorIndex % COLORS.length];
            colorIndex++;
          }
          const district = f.properties.district || "Unknown";
          colorMapRef.current[district] = stateColors[state];
        });
        setGeoData(data);
      })
      .catch(() => setGeoError(true));
  }, []);

  // ── Fetch weather + soil when district clicked ──────────────
  useEffect(() => {
    if (!selectedDistrict) return;
    setApiData(null);
    setApiError(null);
    setApiLoading(true);

    fetch(
      `https://agrifriend-backend.onrender.com/api/region-data?lat=${selectedDistrict.lat}&lng=${selectedDistrict.lng}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => { setApiData(data); setApiLoading(false); })
      .catch(() => {
        setApiError("Could not connect to backend.");
        setApiLoading(false);
      });
  }, [selectedDistrict]);

  // ── Get centroid of a feature ───────────────────────────────
  const getCentroid = (feature) => {
    try {
      const coords = feature.geometry.type === "Polygon"
        ? feature.geometry.coordinates[0]
        : feature.geometry.coordinates[0][0];
      const lats = coords.map((c) => c[1]);
      const lngs = coords.map((c) => c[0]);
      return {
        lat: (Math.min(...lats) + Math.max(...lats)) / 2,
        lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
      };
    } catch {
      return { lat: 20.5937, lng: 78.9629 };
    }
  };

  const districtStyle = (feature) => {
    const district  = feature.properties.district || "Unknown";
    const color     = colorMapRef.current[district] || "#4ade80";
    const isSelected = selectedDistrict?.district === district;
    return {
      fillColor:   color,
      fillOpacity: isSelected ? 1 : 0.7,
      color:       "#111827",
      weight:      isSelected ? 2.5 : 0.5,
      opacity:     1,
    };
  };

  const onEachFeature = (feature, layer) => {
    const district = feature.properties.district || "Unknown";
    const state    = feature.properties.state    || "Unknown";

    layer.on({
      mouseover(e) {
        setHoveredName(`${district}, ${state}`);
        e.target.setStyle({ fillOpacity: 1, weight: 2, color: "#fff" });
        e.target.bringToFront();
      },
      mouseout(e) {
        setHoveredName("");
        e.target.setStyle(districtStyle(feature));
      },
      click() {
        const color   = colorMapRef.current[district] || "#4ade80";
        const centroid = getCentroid(feature);
        const districtData = { district, state, color, ...centroid };
        setSelectedDistrict(districtData);
        setDialogOpen(true);
        if (onStateSelect) onStateSelect(
          `${district}, ${state}`,
          apiData?.weather,
          apiData?.soil
        );
      },
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCrops(null);
    setTimeout(() => setSelectedDistrict(null), 300);
  };

  const weather = apiData?.weather;
  const soil    = apiData?.soil;

  return (
    <section className="map-section" id="map-section">

      {/* Header */}
      <div className="map-section__header">
        <div className="map-section__tag"><span>🗺️ INTERACTIVE MAP</span></div>
        <h2 className="map-section__title">
          Explore Any District in <span className="accent">India</span>
        </h2>
        <p className="map-section__subtitle">
          Click on any district to view live weather, soil health &amp; crop recommendations
        </p>
      </div>

      {/* Map */}
      <div className="map-section__body">
        <div className="map-section__map-wrap">

          {hoveredName && (
            <div className="map-section__tooltip">📍 {hoveredName}</div>
          )}
          {!hoveredName && (
            <div className="map-section__hint">
              {geoError
                ? "⚠️ Map failed to load."
                : geoData
                ? "👆 Click any district to explore"
                : "⏳ Loading district map..."}
            </div>
          )}

          <MapContainer
            center={[22, 82]} zoom={5}
            style={{ width: "100%", height: "100%", background: "#111827" }}
            zoomControl scrollWheelZoom attributionControl={false}
          >
            <FitIndia />
            {geoData && (
              <GeoJSON
                key={selectedDistrict?.district || "map"}
                data={geoData}
                style={districtStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && selectedDistrict && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>

            <div className="dialog__accent-bar" style={{ background: selectedDistrict.color }} />

            <div className="dialog__header">
              <div className="dialog__title-wrap">
                <span className="dialog__dot" style={{ background: selectedDistrict.color }} />
                <div>
                  <h3 className="dialog__state-name">{selectedDistrict.district}</h3>
                  <p className="dialog__state-sub">{selectedDistrict.state}</p>
                </div>
              </div>
              <button className="dialog__close" onClick={closeDialog}>✕</button>
            </div>
            <p className="dialog__coords">
              📍 {selectedDistrict.lat.toFixed(4)}°N · {selectedDistrict.lng.toFixed(4)}°E
            </p>

            <div className="dialog__divider" />

            {apiLoading && (
              <div className="dialog__loading">
                <div className="dialog__spinner" />
                <p>Fetching live data...</p>
              </div>
            )}

            {apiError && !apiLoading && (
              <div className="dialog__error">⚠️ {apiError}</div>
            )}

            {!apiLoading && !apiError && (
              <div className="dialog__cards">

                <div className="dialog__card">
                  <div className="dialog__card-icon">
                    {weather ? weatherEmoji(weather.condition) : "🌤️"}
                  </div>
                  <div className="dialog__card-body">
                    <p className="dialog__card-label">Weather</p>
                    {weather ? (
                      <>
                        <p className="dialog__card-value">
                          {weather.temperature}°C · {weather.description}
                        </p>
                        <p className="dialog__card-meta">
                          💧 {weather.humidity}% humidity &nbsp;·&nbsp;
                          💨 {weather.wind_speed} km/h wind
                        </p>
                      </>
                    ) : (
                      <p className="dialog__card-value loading">No weather data</p>
                    )}
                  </div>
                  <span className="dialog__badge live">LIVE</span>
                </div>

                <div className="dialog__card">
                  <div className="dialog__card-icon">🌱</div>
                  <div className="dialog__card-body">
                    <p className="dialog__card-label">Soil Health</p>
                    {soil ? (
                      <>
                        <p className="dialog__card-value">
                          {soil.moisture_status} · {soil.soil_temp_surface}°C surface
                        </p>
                        <p className="dialog__card-meta">
                          🌊 Moisture: {soil.moisture_surface} m³/m³ &nbsp;·&nbsp;
                          🌡️ 6cm: {soil.soil_temp_6cm}°C
                        </p>
                      </>
                    ) : (
                      <p className="dialog__card-value loading">No soil data</p>
                    )}
                  </div>
                  <span className="dialog__badge live">LIVE</span>
                </div>

                <div className="dialog__card">
                  <div className="dialog__card-icon">🌾</div>
                  <div className="dialog__card-body">
                    <p className="dialog__card-label">Best Crops</p>
                    {cropsLoading ? (
                      <p className="dialog__card-value loading">🤖 AI analyzing district...</p>
                    ) : crops ? (
                      <p className="dialog__card-value crops-text">{crops}</p>
                    ) : (
                      <p className="dialog__card-value loading">Waiting for data...</p>
                    )}
                  </div>
                  <span className="dialog__badge ai">AI</span>
                </div>

              </div>
            )}

            <div className="dialog__divider" />

            <button
              className="dialog__ai-btn"
              style={{ borderColor: selectedDistrict.color, color: selectedDistrict.color }}
              onClick={() => { closeDialog(); if (onAskAI) onAskAI(); }}
            >
              🤖 Ask AgriFriend AI about {selectedDistrict.district}
            </button>

          </div>
        </div>
      )}
    </section>
  );
}
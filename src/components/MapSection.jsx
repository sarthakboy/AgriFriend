import { useState, useEffect, useRef } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapSection.css";

// ── Working GeoJSON URL (fetched at runtime, no local file needed) ──
const INDIA_GEOJSON_URL =
  "https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson";

const STATE_COLORS = [
  "#FF6B6B","#FF8E53","#FFC300","#2ECC71","#1ABC9C",
  "#3498DB","#9B59B6","#E91E63","#00BCD4","#8BC34A",
  "#FF5722","#F06292","#AED581","#4DB6AC","#7986CB",
  "#FFB74D","#A1887F","#81C784","#F48FB1","#80CBC4",
  "#CE93D8","#FFCC02","#80DEEA","#EF9A9A","#FFF176",
  "#A5D6A7","#BCAAA4","#B0BEC5","#90CAF9","#FFAB91",
];

const STATE_COORDS = {
  "Andhra Pradesh":    { lat: 15.9129, lng: 79.7400 },
  "Arunachal Pradesh": { lat: 28.2180, lng: 94.7278 },
  "Assam":             { lat: 26.2006, lng: 92.9376 },
  "Bihar":             { lat: 25.0961, lng: 85.3131 },
  "Chhattisgarh":      { lat: 21.2787, lng: 81.8661 },
  "Goa":               { lat: 15.2993, lng: 74.1240 },
  "Gujarat":           { lat: 22.2587, lng: 71.1924 },
  "Haryana":           { lat: 29.0588, lng: 76.0856 },
  "Himachal Pradesh":  { lat: 31.1048, lng: 77.1734 },
  "Jharkhand":         { lat: 23.6102, lng: 85.2799 },
  "Karnataka":         { lat: 15.3173, lng: 75.7139 },
  "Kerala":            { lat: 10.8505, lng: 76.2711 },
  "Madhya Pradesh":    { lat: 22.9734, lng: 78.6569 },
  "Maharashtra":       { lat: 19.7515, lng: 75.7139 },
  "Manipur":           { lat: 24.6637, lng: 93.9063 },
  "Meghalaya":         { lat: 25.4670, lng: 91.3662 },
  "Mizoram":           { lat: 23.1645, lng: 92.9376 },
  "Nagaland":          { lat: 26.1584, lng: 94.5624 },
  "Odisha":            { lat: 20.9517, lng: 85.0985 },
  "Punjab":            { lat: 31.1471, lng: 75.3412 },
  "Rajasthan":         { lat: 27.0238, lng: 74.2179 },
  "Sikkim":            { lat: 27.5330, lng: 88.5122 },
  "Tamil Nadu":        { lat: 11.1271, lng: 78.6569 },
  "Telangana":         { lat: 18.1124, lng: 79.0193 },
  "Tripura":           { lat: 23.9408, lng: 91.9882 },
  "Uttar Pradesh":     { lat: 26.8467, lng: 80.9462 },
  "Uttarakhand":       { lat: 30.0668, lng: 79.0193 },
  "West Bengal":       { lat: 22.9868, lng: 87.8550 },
  "Delhi":             { lat: 28.6139, lng: 77.2090 },
  "Jammu & Kashmir":   { lat: 33.7782, lng: 76.5762 },
  "Jammu and Kashmir": { lat: 33.7782, lng: 76.5762 },
  "Ladakh":            { lat: 34.1526, lng: 77.5770 },
};

const weatherEmoji = (condition) => {
  const map = {
    Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️",
    Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Haze: "🌫️",
    Fog: "🌫️", Smoke: "🌫️", Dust: "🌪️",
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
  const [selectedState, setSelectedState] = useState(null);
  const [dialogOpen, setDialogOpen]       = useState(false);
  const [hoveredName, setHoveredName]     = useState("");
  const [apiData, setApiData]             = useState(null);
  const [apiLoading, setApiLoading]       = useState(false);
  const [apiError, setApiError]           = useState(null);
  const [crops, setCrops]                 = useState(null);
  const [cropsLoading, setCropsLoading]   = useState(false);
  const colorMapRef                       = useRef({});

  // ── Fetch crop recommendations when weather+soil data is ready ──
  useEffect(() => {
    if (!apiData || !selectedState) return;
    setCrops(null);
    setCropsLoading(true);

    const prompt = `Based on the current conditions in ${selectedState.name}, India, list the top 3-4 best crops to grow right now. Be very brief — just crop names with one short reason each. Format as a simple list.`;

    fetch("https://agrifriend-backend.onrender.com/api/agent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        state:    selectedState.name,
        weather:  apiData.weather,
        soil:     apiData.soil,
      }),
    })
      .then((r) => r.json())
      .then((data) => { setCrops(data.reply); setCropsLoading(false); })
      .catch(() => { setCrops("Unable to fetch recommendations."); setCropsLoading(false); });
  }, [apiData]);
  useEffect(() => {
    fetch(INDIA_GEOJSON_URL)
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load map");
        return r.json();
      })
      .then((data) => {
        // Assign unique color to each state
        data.features.forEach((f, i) => {
          const name =
            f.properties.NAME_1 || f.properties.st_nm ||
            f.properties.ST_NM  || f.properties.name  ||
            f.properties.NAME   || `state_${i}`;
          colorMapRef.current[name] = STATE_COLORS[i % STATE_COLORS.length];
        });
        setGeoData(data);
      })
      .catch(() => setGeoError(true));
  }, []);

  // ── Fetch Weather + Soil when state clicked ─────────────────
  useEffect(() => {
    if (!selectedState) return;
    setApiData(null);
    setApiError(null);
    setApiLoading(true);

    fetch(
      `https://agrifriend-backend.onrender.com/api/region-data?lat=${selectedState.lat}&lng=${selectedState.lng}`
    )
      .then((r) => {
        if (!r.ok) throw new Error("API error");
        return r.json();
      })
      .then((data) => { setApiData(data); setApiLoading(false); })
      .catch(() => {
        setApiError("Could not connect to backend. Is FastAPI running?");
        setApiLoading(false);
      });
  }, [selectedState]);

  const getStateName = (feature) =>
    feature.properties.NAME_1 || feature.properties.st_nm ||
    feature.properties.ST_NM  || feature.properties.name  ||
    feature.properties.NAME   || "Unknown";

  const stateStyle = (feature) => {
    const name       = getStateName(feature);
    const color      = colorMapRef.current[name] || "#4ade80";
    const isSelected = selectedState?.name === name;
    return {
      fillColor:   color,
      fillOpacity: isSelected ? 1 : 0.78,
      color:       "#111827",
      weight:      isSelected ? 3 : 1.2,
      opacity:     1,
    };
  };

  const onEachFeature = (feature, layer) => {
    const name = getStateName(feature);
    layer.on({
      mouseover(e) {
        setHoveredName(name);
        e.target.setStyle({ fillOpacity: 1, weight: 2.5, color: "#fff" });
        e.target.bringToFront();
      },
      mouseout(e) {
        setHoveredName("");
        e.target.setStyle(stateStyle(feature));
      },
      click() {
        const color  = colorMapRef.current[name] || "#4ade80";
        const coords = STATE_COORDS[name] || { lat: 20.5937, lng: 78.9629 };
        setSelectedState({ name, color, ...coords });
        setDialogOpen(true);
        if (onStateSelect) onStateSelect(name, apiData?.weather, apiData?.soil);
      },
    });
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setCrops(null);
    setTimeout(() => setSelectedState(null), 300);
  };

  const weather = apiData?.weather;
  const soil    = apiData?.soil;

  return (
    <section className="map-section" id="map-section">

      {/* Header */}
      <div className="map-section__header">
        <div className="map-section__tag"><span>🗺️ INTERACTIVE MAP</span></div>
        <h2 className="map-section__title">
          Explore Any State in <span className="accent">India</span>
        </h2>
        <p className="map-section__subtitle">
          Click on any state to view live weather, soil health &amp; crop recommendations
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
                ? "⚠️ Map failed to load. Check internet connection."
                : geoData
                ? "👆 Click any state to explore"
                : "⏳ Loading India map..."}
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
                key={selectedState?.name || "map"}
                data={geoData}
                style={stateStyle}
                onEachFeature={onEachFeature}
              />
            )}
          </MapContainer>
        </div>
      </div>

      {/* Dialog */}
      {dialogOpen && selectedState && (
        <div className="dialog-overlay" onClick={closeDialog}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>

            <div className="dialog__accent-bar" style={{ background: selectedState.color }} />

            <div className="dialog__header">
              <div className="dialog__title-wrap">
                <span className="dialog__dot" style={{ background: selectedState.color }} />
                <h3 className="dialog__state-name">{selectedState.name}</h3>
              </div>
              <button className="dialog__close" onClick={closeDialog}>✕</button>
            </div>
            <p className="dialog__coords">
              📍 {selectedState.lat.toFixed(4)}°N · {selectedState.lng.toFixed(4)}°E
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
                      <p className="dialog__card-value loading">Add API key to .env</p>
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
                          🌡️ 6cm depth: {soil.soil_temp_6cm}°C
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
                      <p className="dialog__card-value loading">🤖 AI analyzing region...</p>
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
              style={{ borderColor: selectedState.color, color: selectedState.color }}
              onClick={() => {
                closeDialog();
                if (onAskAI) onAskAI();
              }}
            >
              🤖 Ask AgriFriend AI about {selectedState.name}
            </button>

          </div>
        </div>
      )}
    </section>
  );
}
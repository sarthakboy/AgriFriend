# 🌾 AgriFriend — Smart Farming for Future Generations

> An AI-powered farming assistant that provides live weather, soil health, and crop recommendations for every state in India.

---

## 📸 Overview

AgriFriend is a full-stack web application that helps Indian farmers make data-driven decisions. Click any state on the interactive India map to instantly view live weather conditions, soil health data, and AI-powered crop recommendations — all in one place.

---

## ✨ Features

- 🗺️ **Interactive India Map** — Colorful clickable map of all Indian states built with React Leaflet
- 🌤️ **Live Weather Data** — Real-time temperature, humidity, wind speed via OpenWeatherMap API
- 🌱 **Live Soil Health** — Surface temperature, moisture levels via Open-Meteo API (free, no key needed)
- 🤖 **AI Farming Agent** — Ask farming questions powered by Groq (Llama 3.3) with region-specific context
- 🌾 **Auto Crop Recommendations** — AI automatically suggests best crops based on live weather + soil data
- 💬 **Floating Chat** — Always-accessible AI chat bubble on every page
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 | UI framework |
| React Leaflet | Interactive India map |
| React Router | Page navigation |
| Vite | Build tool |
| CSS3 | Custom styling (no UI library) |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | Python web framework |
| Uvicorn | ASGI server |
| httpx | Async HTTP client |
| Groq API | AI agent (Llama 3.3 70B) |
| OpenWeatherMap API | Live weather data |
| Open-Meteo API | Live soil data (free) |

---

## 📁 Project Structure

```
AgriFriend/
│
├── src/                          # React frontend
│   ├── components/
│   │   ├── HeroPage.jsx          # Landing page
│   │   ├── HeroPage.css
│   │   ├── MapSection.jsx        # Interactive India map + dialog
│   │   ├── MapSection.css
│   │   ├── AIAgent.jsx           # Floating AI chat
│   │   ├── AIAgent.css
│   │   ├── ContactPage.jsx       # Contact page
│   │   ├── ContactPage.css
│   │   └── india.geojson         # India states boundary data
│   ├── App.jsx                   # Root component with routing
│   └── main.jsx                  # React entry point
│
├── agrifriend-backend/           # FastAPI backend
│   ├── main.py                   # All API endpoints
│   ├── requirements.txt          # Python dependencies
│   └── venv/                     # Virtual environment (not committed)
│
├── index.html                    # HTML entry point
├── vite.config.js                # Vite configuration
├── package.json                  # Node dependencies
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.10+
- Git

### API Keys Required

| API | Where to get | Free tier |
|-----|-------------|-----------|
| OpenWeatherMap | https://openweathermap.org/api | ✅ Yes |
| Groq | https://console.groq.com | ✅ Yes |
| Open-Meteo | https://open-meteo.com | ✅ No key needed |

---

## ⚙️ Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/agrifriend.git
cd agrifriend
```

### 2. Setup Frontend

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 3. Setup Backend

```bash
# Navigate to backend folder
cd agrifriend-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Add API Keys

Open `agrifriend-backend/main.py` and paste your keys:

```python
WEATHER_API_KEY = "your_openweathermap_api_key"
GROQ_API_KEY    = "your_groq_api_key"
```

### 5. Start Backend

```bash
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/weather?lat=&lng=` | Live weather data |
| GET | `/api/soil?lat=&lng=` | Live soil health data |
| GET | `/api/region-data?lat=&lng=` | Weather + soil combined |
| POST | `/api/agent` | AI farming assistant |

### Example API call

```bash
# Get region data for Delhi
curl http://localhost:8000/api/region-data?lat=28.6&lng=77.2

# Ask AI agent
curl -X POST http://localhost:8000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"What crops grow in Punjab?"}],"state":"Punjab"}'
```

---

## 🖥️ Running the Full App

You need **two terminals running simultaneously**:

**Terminal 1 — Backend:**
```bash
cd agrifriend-backend
venv\Scripts\activate      # Windows
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```bash
cd AgriFriend
npm run dev
```

Open `http://localhost:5173` in your browser. ✅

---

## 🌍 How It Works

```
User clicks state on map
        ↓
React sends lat/lng to FastAPI
        ↓
FastAPI calls OpenWeatherMap API  →  returns weather
FastAPI calls Open-Meteo API      →  returns soil data
        ↓
Dialog shows live weather + soil
        ↓
FastAPI calls Groq AI with context →  returns crop recommendations
        ↓
User can chat with AI about the region
```

---

## ⚠️ Important Notes

- **Never commit API keys** to GitHub — keep them only in `main.py` locally
- The `venv/` folder is excluded from git automatically via `.gitignore`
- Both frontend and backend must be running at the same time
- The India GeoJSON map data is fetched from a public CDN at runtime

---

## 🔮 Future Improvements

- [ ] Add user authentication
- [ ] Historical weather trends
- [ ] Pest and disease alerts
- [ ] Multiple language support (Hindi, Marathi, etc.)
- [ ] Mobile app (React Native)
- [ ] Deploy to cloud (Vercel + Railway)

---

## 👨‍💻 Author

Built with ❤️ for Indian farmers.

---

## 📄 License

MIT License — feel free to use and modify.

# 🌾 AgriFriend — AI-Powered Farming Assistant

> A full-stack farming intelligence platform delivering district-level weather, soil health, and AI-powered crop recommendations across 700+ Indian districts.

---

## 📸 Overview

AgriFriend helps Indian farmers make data-driven decisions by combining live weather data, real-time soil health metrics, and an AI farming agent into a single interactive dashboard. Click any district on the India map to instantly get region-specific insights powered by live APIs and Llama 3.3 70B.

---

## ✨ Features

- 🗺️ **District Level India Map** — 700+ clickable districts built with React Leaflet and GeoJSON
- 🌤️ **Live Weather Data** — Real-time temperature, humidity, wind speed via OpenWeatherMap API
- 🌱 **Live Soil Health** — Surface temperature, moisture levels via Open-Meteo API (free, no key needed)
- 🤖 **AI Farming Agent** — Llama 3.3 70B via Groq API with region-specific context
- 🌾 **Auto Crop Recommendations** — AI analyzes live weather + soil data per district
- 💬 **Floating AI Chat** — Always-accessible chat with full regional context
- 🧠 **RAG Pipeline** — ChromaDB vector database + LangChain for knowledge retrieval
- 📝 **Prompt Engineering** — Multi-layer prompt with role definition, live data injection, vector DB context, conversation history
- 📱 **Fully Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | UI framework and build tool |
| React Leaflet | Interactive district-level India map |
| React Router | Client-side page navigation |
| CSS3 | Custom styling (no UI library) |

### Backend
| Technology | Purpose |
|-----------|---------|
| FastAPI | Async Python web framework |
| Uvicorn | ASGI server |
| httpx | Async HTTP client for external APIs |
| python-dotenv | Secure API key management |

### AI & RAG Pipeline
| Technology | Purpose |
|-----------|---------|
| Groq API (Llama 3.3 70B) | AI farming agent |
| LangChain | RAG pipeline orchestration |
| ChromaDB | Vector database for knowledge storage |
| HuggingFace (all-MiniLM-L6-v2) | Embedding model for vector search |
| Prompt Engineering | Multi-layer context injection |

### Data APIs
| API | Purpose |
|-----|---------|
| OpenWeatherMap | Live weather data |
| Open-Meteo | Live soil health data (free) |

### Deployment
| Platform | Purpose |
|----------|---------|
| Vercel | Frontend hosting with auto-deploy |
| Render | Backend hosting |
| GitHub | Version control |

---

## 🏗️ Architecture

```
User clicks district on map
        ↓
React sends lat/lng + user question to FastAPI
        ↓
3 tasks run simultaneously (async):
┌─────────────────────────────────┐
│ Task 1: Fetch live weather      │
│ Task 2: Fetch live soil data    │
│ Task 3: Search ChromaDB         │
└─────────────────────────────────┘
        ↓
LangChain builds prompt:
- ChromaDB retrieved docs    (knowledge base)
- Live weather context       (RAG-lite)
- Live soil context          (RAG-lite)
- Conversation history
- User question
        ↓
Groq API (Llama 3.3 70B) generates answer
        ↓
Response returned to frontend
```

---

## 🧠 RAG Pipeline — How It Works

AgriFriend uses a **hybrid RAG architecture** combining two retrieval methods:

### RAG-lite (Live APIs)
Fetches real-time data from external APIs and injects it directly into the LLM prompt. This grounds responses in current real-world conditions rather than static training data.

```python
# Live data injected into every prompt
"Current weather in Ludhiana, Punjab:
- Temperature: 32°C, Humidity: 45%
- Condition: Clear Sky"

"Current soil data:
- Moisture Status: Wet, Surface Temp: 28°C"
```

### Full RAG (ChromaDB + LangChain)
Stores domain-specific knowledge as vector embeddings. On each query, LangChain searches ChromaDB for semantically similar documents and injects them into the prompt.

```python
# ChromaDB search flow
User question → HuggingFace embedding model → vector
                        ↓
ChromaDB similarity search → top 3 relevant chunks
                        ↓
Chunks injected into LLM prompt
```

### Prompt Engineering Layers
```
Layer 1 — Role Definition
"You are AgriFriend AI, expert farming assistant..."

Layer 2 — ChromaDB Context (Full RAG)
"Relevant knowledge: [retrieved documents]"

Layer 3 — Live Data (RAG-lite)
"Current weather: 32°C, Clear Sky..."
"Current soil: Wet, 28°C surface..."

Layer 4 — Conversation History
[Previous messages for context continuity]

Layer 5 — User Question
"What crops should I grow?"
```

---

## 📁 Project Structure

```
AgriFriend/
│
├── src/                              # React frontend
│   ├── config.js                     # API URL config (local/production)
│   ├── App.jsx                       # Root component with routing
│   ├── main.jsx                      # React entry point
│   └── components/
│       ├── HeroPage.jsx              # Landing page with animations
│       ├── HeroPage.css
│       ├── MapSection.jsx            # District map + dialog + AI crops
│       ├── MapSection.css
│       ├── AIAgent.jsx               # Floating AI chat interface
│       ├── AIAgent.css
│       ├── ContactPage.jsx           # Contact page
│       └── ContactPage.css
│
├── public/
│   └── india_districts.geojson      # 700+ India district boundaries
│
├── agrifriend-backend/              # FastAPI backend
│   ├── main.py                      # All API endpoints + AI agent
│   ├── knowledge_base.py            # Populates ChromaDB (run once)
│   ├── requirements.txt             # Python dependencies
│   ├── render.yaml                  # Render deployment config
│   ├── chroma_db/                   # ChromaDB vector database
│   └── .env                         # API keys (never commit)
│
├── index.html                       # HTML entry point
├── vite.config.js                   # Vite configuration
├── package.json                     # Node dependencies
└── README.md                        # This file
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
git clone https://github.com/sarthakboy/AgriFriend.git
cd AgriFriend
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
cd agrifriend-backend

# Create virtual environment
python -m venv venv

# Activate — Windows
venv\Scripts\activate
# Activate — Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Add API Keys

Create `.env` file inside `agrifriend-backend/`:
```
WEATHER_API_KEY=your_openweathermap_key
GROQ_API_KEY=your_groq_key
```

### 5. Setup ChromaDB Knowledge Base

Run once to populate the vector database:
```bash
python knowledge_base.py
```

This creates `chroma_db/` folder with embedded knowledge documents.

### 6. Start Backend

```bash
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

---

## 🖥️ Running the Full App

Run both terminals simultaneously:

**Terminal 1 — Backend:**
```bash
cd agrifriend-backend
venv\Scripts\activate
uvicorn main:app --reload
```

**Terminal 2 — Frontend:**
```bash
npm run dev
```

Open `http://localhost:5173` ✅

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/api/weather?lat=&lng=` | Live weather data |
| GET | `/api/soil?lat=&lng=` | Live soil health data |
| GET | `/api/region-data?lat=&lng=` | Weather + soil combined |
| POST | `/api/agent` | AI agent with RAG pipeline |

### Example Requests

```bash
# Get region data for Delhi
curl http://localhost:8000/api/region-data?lat=28.6&lng=77.2

# Ask AI agent with context
curl -X POST http://localhost:8000/api/agent \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "What crops grow in Ludhiana?"}],
    "state": "Ludhiana, Punjab",
    "weather": {"temperature": 32, "humidity": 45},
    "soil": {"moisture_status": "Wet", "soil_temp_surface": 28}
  }'
```

---

## ⚠️ Important Notes

- Never commit `.env` file or API keys to GitHub
- `venv/` folder is excluded via `.gitignore`
- Run `knowledge_base.py` once after cloning to set up ChromaDB
- Both frontend and backend must run simultaneously
- `src/config.js` controls API URL — set `VITE_API_URL` in Vercel environment variables for production

---

## 🔮 Future Improvements

- [ ] Hosted vector DB (Pinecone/Supabase) for production RAG
- [ ] District-level historical weather trends
- [ ] Pest and disease alerts
- [ ] Multiple language support (Hindi, Marathi, etc.)
- [ ] Mobile app (React Native)
- [ ] User authentication and personalized recommendations
- [ ] Mandi (market) price integration

---

## 👨‍💻 Author

**Sarthak Pandey**
- Email: pandeysarthak06@gmail.com
- GitHub: https://github.com/sarthakboy
- LeetCode: https://leetcode.com/u/Sarataku/

Built with ❤️ for Indian farmers.

---

## 📄 License

MIT License — feel free to use and modify.

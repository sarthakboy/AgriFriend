from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import httpx
from dotenv import load_dotenv  # ← add this

load_dotenv()  # ← add this
# ── Paste your keys here ───────────────────────────────────────
import os

WEATHER_API_KEY = os.environ.get("WEATHER_API_KEY", "")
GROQ_API_KEY    = os.environ.get("GROQ_API_KEY", "")
app = FastAPI(title="AgriFriend API")

# ── CORS ───────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ──────────────────────────────────────────────────────────────
# WEATHER ENDPOINT
# ──────────────────────────────────────────────────────────────
@app.get("/api/weather")
async def get_weather(lat: float, lng: float):
    if not WEATHER_API_KEY or WEATHER_API_KEY == "your_openweathermap_key_here":
        raise HTTPException(status_code=500, detail="WEATHER_API_KEY not set")
    url = (
        f"https://api.openweathermap.org/data/2.5/weather"
        f"?lat={lat}&lon={lng}&appid={WEATHER_API_KEY}&units=metric"
    )
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, timeout=10)
            res.raise_for_status()
            d = res.json()
            return {
                "temperature": round(d["main"]["temp"]),
                "feels_like":  round(d["main"]["feels_like"]),
                "humidity":    d["main"]["humidity"],
                "wind_speed":  round(d["wind"]["speed"] * 3.6, 1),
                "condition":   d["weather"][0]["main"],
                "description": d["weather"][0]["description"].title(),
                "icon":        d["weather"][0]["icon"],
                "city":        d.get("name", ""),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────
# SOIL ENDPOINT
# ──────────────────────────────────────────────────────────────
@app.get("/api/soil")
async def get_soil(lat: float, lng: float):
    url = (
        f"https://api.open-meteo.com/v1/forecast"
        f"?latitude={lat}&longitude={lng}"
        f"&hourly=soil_temperature_0cm,soil_temperature_6cm,"
        f"soil_moisture_0_to_1cm,soil_moisture_1_to_3cm"
        f"&forecast_days=1&timezone=Asia%2FKolkata"
    )
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(url, timeout=10)
            res.raise_for_status()
            h = res.json().get("hourly", {})

            def latest(key):
                vals = [v for v in h.get(key, []) if v is not None]
                return round(vals[-1], 2) if vals else None

            def moisture_status(val):
                if val is None: return "Unknown"
                if val < 0.1:   return "Dry 🔴"
                if val < 0.25:  return "Low 🟡"
                if val < 0.4:   return "Optimal 🟢"
                return          "Wet 🔵"

            m = latest("soil_moisture_0_to_1cm")
            return {
                "soil_temp_surface": latest("soil_temperature_0cm"),
                "soil_temp_6cm":     latest("soil_temperature_6cm"),
                "moisture_surface":  m,
                "moisture_deep":     latest("soil_moisture_1_to_3cm"),
                "moisture_status":   moisture_status(m),
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ──────────────────────────────────────────────────────────────
# COMBINED ENDPOINT
# ──────────────────────────────────────────────────────────────
@app.get("/api/region-data")
async def get_region_data(lat: float, lng: float):
    async with httpx.AsyncClient() as client:

        weather_data = None
        if WEATHER_API_KEY and WEATHER_API_KEY != "your_openweathermap_key_here":
            try:
                w_url = (
                    f"https://api.openweathermap.org/data/2.5/weather"
                    f"?lat={lat}&lon={lng}&appid={WEATHER_API_KEY}&units=metric"
                )
                w = (await client.get(w_url, timeout=10)).json()
                weather_data = {
                    "temperature": round(w["main"]["temp"]),
                    "feels_like":  round(w["main"]["feels_like"]),
                    "humidity":    w["main"]["humidity"],
                    "wind_speed":  round(w["wind"]["speed"] * 3.6, 1),
                    "condition":   w["weather"][0]["main"],
                    "description": w["weather"][0]["description"].title(),
                    "icon":        w["weather"][0]["icon"],
                    "city":        w.get("name", ""),
                }
            except Exception:
                weather_data = None

        soil_data = None
        try:
            s_url = (
                f"https://api.open-meteo.com/v1/forecast"
                f"?latitude={lat}&longitude={lng}"
                f"&hourly=soil_temperature_0cm,soil_temperature_6cm,"
                f"soil_moisture_0_to_1cm,soil_moisture_1_to_3cm"
                f"&forecast_days=1&timezone=Asia%2FKolkata"
            )
            h = (await client.get(s_url, timeout=10)).json().get("hourly", {})

            def latest(key):
                vals = [v for v in h.get(key, []) if v is not None]
                return round(vals[-1], 2) if vals else None

            def moisture_status(val):
                if val is None: return "Unknown"
                if val < 0.1:   return "Dry 🔴"
                if val < 0.25:  return "Low 🟡"
                if val < 0.4:   return "Optimal 🟢"
                return          "Wet 🔵"

            m = latest("soil_moisture_0_to_1cm")
            soil_data = {
                "soil_temp_surface": latest("soil_temperature_0cm"),
                "soil_temp_6cm":     latest("soil_temperature_6cm"),
                "moisture_surface":  m,
                "moisture_deep":     latest("soil_moisture_1_to_3cm"),
                "moisture_status":   moisture_status(m),
            }
        except Exception:
            soil_data = None

        return {"weather": weather_data, "soil": soil_data}


# ──────────────────────────────────────────────────────────────
# AI AGENT ENDPOINT — Groq (Llama 3.3)
# POST /api/agent
# ──────────────────────────────────────────────────────────────

class Message(BaseModel):
    role: str
    content: str

class AgentRequest(BaseModel):
    messages: List[Message]
    state:   Optional[str]  = None
    weather: Optional[dict] = None
    soil:    Optional[dict] = None

@app.post("/api/agent")
async def agent(req: AgentRequest):
    if not GROQ_API_KEY or GROQ_API_KEY == "your_groq_key_here":
        raise HTTPException(status_code=500, detail="GROQ_API_KEY not set")

    # ── Build system prompt ────────────────────────────────────
    context = [
        "You are AgriFriend AI, an expert farming assistant for Indian farmers.",
        "Give practical, specific, concise advice. Be friendly and helpful.",
    ]

    if req.state:
        context.append(f"\nThe farmer is asking about: {req.state}, India.")

    if req.weather:
        w = req.weather
        context.append(
            f"\nCurrent weather in {req.state or 'this region'}:"
            f"\n- Temperature: {w.get('temperature')}°C (feels like {w.get('feels_like')}°C)"
            f"\n- Condition: {w.get('description')}"
            f"\n- Humidity: {w.get('humidity')}%"
            f"\n- Wind: {w.get('wind_speed')} km/h"
        )

    if req.soil:
        s = req.soil
        context.append(
            f"\nCurrent soil data:"
            f"\n- Surface Temp: {s.get('soil_temp_surface')}°C"
            f"\n- Moisture Status: {s.get('moisture_status')}"
            f"\n- Moisture Level: {s.get('moisture_surface')} m³/m³"
            f"\n- 6cm Depth Temp: {s.get('soil_temp_6cm')}°C"
        )

    context.append(
        "\nUse this live data for accurate advice. "
        "Suggest crops, fertilizers, irrigation tips, pest warnings as needed."
    )

    system_prompt = "\n".join(context)

    # ── Build messages for Groq ────────────────────────────────
    messages = [{"role": "system", "content": system_prompt}]
    for m in req.messages:
        messages.append({"role": m.role, "content": m.content})

    # ── Call Groq API ──────────────────────────────────────────
    async with httpx.AsyncClient() as client:
        try:
            res = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type":  "application/json",
                },
                json={
                    "model":       "llama-3.3-70b-versatile",
                    "messages":    messages,
                    "max_tokens":  500,
                    "temperature": 0.7,
                },
                timeout=30,
            )
            res.raise_for_status()
            reply = res.json()["choices"][0]["message"]["content"]
            print(f"\n✅ Groq response: {reply[:100]}...\n")  # print in terminal
            return {"reply": reply}

        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code,
                detail=f"Groq error: {e.response.text}"
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


# ── Health Check ───────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "AgriFriend API is running 🌾"}
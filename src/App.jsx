import { useState, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HeroPage from './components/HeroPage'
import MapSection from './components/MapSection'
import AIAgent from './components/AIAgent'
import ContactPage from './components/ContactPage'

function HomePage() {
  const [selectedState, setSelectedState] = useState(null)
  const [weatherData, setWeatherData]     = useState(null)
  const [soilData, setSoilData]           = useState(null)
  const openAgentRef                      = useRef(null)

  return (
    <>
      <HeroPage />
      <MapSection
        onStateSelect={(state, weather, soil) => {
          setSelectedState(state)
          setWeatherData(weather)
          setSoilData(soil)
        }}
        onAskAI={() => {
          if (openAgentRef.current) openAgentRef.current()
        }}
      />
      <AIAgent
        selectedState={selectedState}
        weatherData={weatherData}
        soilData={soilData}
        registerOpen={(fn) => { openAgentRef.current = fn }}
      />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Model from './components/Model'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function SearchBar({ onSearch }) {
  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search amenities..."
        onChange={(e) => onSearch(e.target.value)}
        className="search-input"
      />
    </div>
  )
}

function InfoPanel({ info, onClose }) {
  if (!info) return null;
  
  return (
    <div className="info-panel">
      <button className="close-button" onClick={onClose}>×</button>
      <h3>{info.name}</h3>
      <p>{info.description}</p>
    </div>
  )
}

function App() {
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [selectedInfo, setSelectedInfo] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLabelClick = (info) => {
    setSelectedInfo(info)
  }

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase())
    // You can implement additional search logic here
  }

  return (
    <div className="app-container">
      <LoadingScreen progress={loadingProgress} />
      <SearchBar onSearch={handleSearch} />
      <InfoPanel info={selectedInfo} onClose={() => setSelectedInfo(null)} />
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }}
        style={{ width: '100vw', height: '100vh' }}
      >
        <Suspense fallback={null}>
          <Environment preset="city" />
          <Model 
            onProgress={setLoadingProgress}
            onLabelClick={handleLabelClick}
          />
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={5}
            maxDistance={20}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App

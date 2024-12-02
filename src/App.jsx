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
        autoFocus
      />
    </div>
  )
}

function InfoPanel({ info, onClose }) {
  if (!info) return null;
  
  return (
    <div className="info-panel">
      <button className="close-button" onClick={onClose}>×</button>
      {info.image && (
        <div className="info-image-container">
          <img src={info.image} alt={info.name} className="info-image" />
        </div>
      )}
      <div className="info-content">
        <h3>{info.name}</h3>
        <p>{info.description}</p>
      </div>
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
  }

  const isLoaded = loadingProgress === 100

  return (
    <div className="app-container">
      <LoadingScreen progress={loadingProgress} />
      {isLoaded && <SearchBar onSearch={handleSearch} />}
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
            searchQuery={searchQuery}
          />
          <OrbitControls 
            enableDamping
            dampingFactor={0.05}
            minDistance={0.1}
            maxDistance={1000}
            enablePan={true}
            panSpeed={1}
            enableZoom={true}
            zoomSpeed={1}
            enableRotate={true}
            rotateSpeed={1}
            maxPolarAngle={Math.PI}
            minPolarAngle={0}
            maxAzimuthAngle={Infinity}
            minAzimuthAngle={-Infinity}
          />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App

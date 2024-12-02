import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { EffectComposer, Bloom, SSAO } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import Model from './components/Model'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function SearchBar({ onSearch, onEnter }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onEnter()
    }
  }

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder="Search amenities..."
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={handleKeyDown}
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
  const [highlightedAmenity, setHighlightedAmenity] = useState(null)

  const handleLabelClick = (info) => {
    setSelectedInfo(info)
  }

  const handleSearch = (query) => {
    setSearchQuery(query.toLowerCase())
    if (!query) {
      setSelectedInfo(null)
    }
  }

  const handleSearchEnter = () => {
    if (highlightedAmenity) {
      setSelectedInfo(highlightedAmenity)
    }
  }

  useEffect(() => {
    if (highlightedAmenity && searchQuery) {
      setSelectedInfo(highlightedAmenity)
    }
  }, [highlightedAmenity, searchQuery])

  const isLoaded = loadingProgress === 100

  useEffect(() => {
    const handleError = (error) => {
      console.error('Error caught by error boundary:', error)
      // You can show an error message to the user here
    }

    window.addEventListener('error', handleError)

    return () => {
      window.removeEventListener('error', handleError)
    }
  }, [])

  return (
    <div className="app-container">
      <LoadingScreen progress={loadingProgress} />
      {isLoaded && (
        <SearchBar 
          onSearch={handleSearch} 
          onEnter={handleSearchEnter}
        />
      )}
      <InfoPanel info={selectedInfo} onClose={() => setSelectedInfo(null)} />
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }}
        style={{ 
          width: '100vw', 
          height: '100vh',
          background: '#242424'
        }}
        shadows
      >
        <Suspense fallback={null}>
          <Environment preset="sunset" intensity={0.7} />
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[35, 20, 5]} 
            intensity={1.5}
            castShadow
            shadow-mapSize={[4096, 4096]}
            shadow-bias={-0.00005}
            shadow-normalBias={0.02}
            shadow-camera-left={-35}
            shadow-camera-right={35}
            shadow-camera-top={35}
            shadow-camera-bottom={-35}
            shadow-camera-near={1}
            shadow-camera-far={70}
          />
          <directionalLight 
            position={[-20, 10, -10]} 
            intensity={0.4} 
            color="#ccd9ff"
          />
          <Model 
            onProgress={setLoadingProgress}
            onLabelClick={handleLabelClick}
            searchQuery={searchQuery}
            onHighlightedAmenityChange={setHighlightedAmenity}
          />
          <EffectComposer>
            <Bloom 
              intensity={0.1}
              luminanceThreshold={0.9}
              luminanceSmoothing={0.3}
            />
            <SSAO
              blendFunction={BlendFunction.MULTIPLY}
              samples={31}
              radius={0.5}
              intensity={25}
              maxDepthStrategy={0}
              minRadiusScale={0.2}
              maxRadiusScale={0.8}
              distanceFalloff={0.5}
            />
          </EffectComposer>
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

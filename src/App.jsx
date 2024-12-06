import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Model from './components/Model'
import LoadingScreen from './components/LoadingScreen'
import './App.css'

function SearchBar({ value, onSearch, onEnter }) {
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
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        onKeyDown={handleKeyDown}
        className="search-input"
        autoFocus
      />
    </div>
  )
}

function InfoPanel({ info, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Duration should match the CSS transition duration (0.3s)
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  if (!info) return null;

  return (
    <div className={`info-panel ${isClosing ? 'fade-out' : 'fade-in'}`}>
      <button
        className="close-button"
        onClick={handleClose}
        aria-label="Close info panel"
      >
        ×
      </button>
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
  );
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

  const handleCloseInfoPanel = () => {
    setSelectedInfo(null)
    setSearchQuery('')
  }

  return (
    <div className="app-container">
      <LoadingScreen progress={loadingProgress} />
      {isLoaded && (
        <SearchBar 
          value={searchQuery}
          onSearch={handleSearch} 
          onEnter={handleSearchEnter}
        />
      )}
      <InfoPanel info={selectedInfo} onClose={handleCloseInfoPanel} />
      <Canvas
        camera={{ position: [0, 2, 10], fov: 75 }}
        style={{ 
          width: '100vw', 
          height: '100vh',
          background: '#242424'
        }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={1} />
          <Model 
            onProgress={setLoadingProgress}
            onLabelClick={handleLabelClick}
            searchQuery={searchQuery}
            onHighlightedAmenityChange={setHighlightedAmenity}
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

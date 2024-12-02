import { useEffect, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

const MODEL_URL = 'https://utfs.io/f/zALdaFej0tyef6wegO2UwhctIHY7xMjLSGQZdrezTXyROqKp'
const CACHE_KEY = 'modelCache_v1'

const AMENITIES = [
  { 
    id: 1, 
    name: 'Main Entrance', 
    position: [2, 1, 0],
    cameraPosition: [4, 2, 2],
    description: 'Main entrance of the station', 
    keywords: ['entrance', 'gate', 'door', 'main'] 
  },
  { 
    id: 2, 
    name: 'Ticket Counter', 
    position: [-2, 1, 0],
    cameraPosition: [-4, 2, 2],
    description: 'Ticket booking and information', 
    keywords: ['ticket', 'booking', 'counter', 'information', 'help', 'desk'] 
  },
  { 
    id: 3, 
    name: 'Platform 1', 
    position: [0, 0, 2],
    cameraPosition: [0, 3, 5],
    description: 'Platform for local trains', 
    keywords: ['platform', 'train', 'local', '1', 'one'] 
  },
]

function Label({ position, name, description, onClick, isHighlighted, onFocus }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = () => {
    onClick({ name, description })
    onFocus(position)
  }
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          style={{
            padding: '8px',
            background: isHighlighted 
              ? '#2196F3' 
              : isHovered 
                ? 'rgba(33, 150, 243, 0.8)' 
                : '#1a1a1a',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            transform: 'translate3d(-50%, -50%, 0)',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            boxShadow: isHighlighted ? '0 0 15px rgba(33, 150, 243, 0.5)' : 'none',
            border: isHighlighted ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
            animation: isHighlighted ? 'pulse 2s infinite' : 'none',
            opacity: 1 // Always fully visible
          }}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}

function useModelDownload(url) {
  const [progress, setProgress] = useState(0)
  const [model, setModel] = useState(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    
    // Check cache first
    caches.open(CACHE_KEY).then(async (cache) => {
      try {
        const cachedResponse = await cache.match(url)
        if (cachedResponse) {
          console.log('Loading model from cache...')
          const blob = await cachedResponse.blob()
          const arrayBuffer = await blob.arrayBuffer()
          
          loader.parse(arrayBuffer, '', 
            (gltf) => {
              setModel(gltf)
              setProgress(100)
              console.log('Model loaded from cache!')
            },
            (error) => {
              console.error('Error parsing cached model:', error)
              loadFromNetwork()
            }
          )
        } else {
          loadFromNetwork()
        }
      } catch (error) {
        console.error('Cache error:', error)
        loadFromNetwork()
      }
    })

    function loadFromNetwork() {
      console.log('Downloading model from network...')
      loader.load(
        url,
        async (gltf) => {
          setModel(gltf)
          setProgress(100)
          console.log('Model loaded from network!')
          
          // Cache the model for future use
          try {
            const response = await fetch(url)
            const cache = await caches.open(CACHE_KEY)
            await cache.put(url, response)
            console.log('Model cached successfully!')
          } catch (error) {
            console.error('Caching error:', error)
          }
        },
        (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100)
            setProgress(percent)
          }
        },
        (error) => {
          console.error('Model loading error:', error)
          setProgress(0)
        }
      )
    }

    return () => {
      setProgress(0)
      setModel(null)
    }
  }, [url])

  return { progress, model }
}

export default function Model({ onProgress, onLabelClick, searchQuery = '' }) {
  const { camera, controls } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  const originalCameraPosition = useRef(null)
  const isAnimating = useRef(false)
  const [focusedAmenity, setFocusedAmenity] = useState(null)
  
  const { progress, model: gltf } = useModelDownload(MODEL_URL)

  useEffect(() => {
    onProgress(progress)
  }, [progress, onProgress])

  useEffect(() => {
    if (gltf) {
      // Center the model
      const box = new THREE.Box3().setFromObject(gltf.scene)
      const center = box.getCenter(new THREE.Vector3())
      gltf.scene.position.sub(center)

      // Adjust material properties
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material = child.material.clone()
          child.material.roughness = 0.5
          child.material.metalness = 0.5
        }
      })

      setModelLoaded(true)
      originalCameraPosition.current = camera.position.clone()

      // Set camera limits
      if (controls) {
        controls.maxPolarAngle = Math.PI / 2 // Prevent viewing from below
        controls.minPolarAngle = Math.PI / 4 // Limit top-down view
      }
    }
  }, [gltf, camera, controls])

  // Update model darkness based on search
  useEffect(() => {
    if (gltf) {
      const isSearching = searchQuery.length > 0
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.material.opacity = isSearching ? 0.3 : 1
          child.material.transparent = true
          child.material.needsUpdate = true
        }
      })
    }
  }, [gltf, searchQuery])

  // Function to focus camera on amcard
  const focusOnAmcard = (position) => {
    if (isAnimating.current) return

    isAnimating.current = true
    const amenity = AMENITIES.find(a => 
      a.position[0] === position[0] && 
      a.position[1] === position[1] && 
      a.position[2] === position[2]
    )

    if (!amenity) return

    setFocusedAmenity(amenity)

    // Calculate camera offset from amcard
    const offset = new THREE.Vector3(0, 0.5, 1)
    const newCameraPos = new THREE.Vector3(...position).add(offset)

    // Animate camera position
    gsap.to(camera.position, {
      x: newCameraPos.x,
      y: newCameraPos.y,
      z: newCameraPos.z,
      duration: 1.5,
      ease: "power2.inOut",
      onComplete: () => {
        isAnimating.current = false
      }
    })

    // Point camera at amcard
    const newTarget = new THREE.Vector3(...position)
    gsap.to(controls.target, {
      x: newTarget.x,
      y: newTarget.y,
      z: newTarget.z,
      duration: 1.5,
      ease: "power2.inOut",
      onUpdate: () => controls.update()
    })

    // Add reset button if it doesn't exist
    if (!document.querySelector('.reset-view-button')) {
      const resetButton = document.createElement('button')
      resetButton.textContent = 'Reset View'
      resetButton.className = 'reset-view-button'
      resetButton.onclick = () => {
        if (isAnimating.current) return
        isAnimating.current = true

        setFocusedAmenity(null)

        gsap.to(camera.position, {
          x: originalCameraPosition.current.x,
          y: originalCameraPosition.current.y,
          z: originalCameraPosition.current.z,
          duration: 1.5,
          ease: "power2.inOut",
          onComplete: () => {
            isAnimating.current = false
            resetButton.remove()
          }
        })

        gsap.to(controls.target, {
          x: 0,
          y: 0,
          z: 0,
          duration: 1.5,
          ease: "power2.inOut",
          onUpdate: () => controls.update()
        })
      }
      document.body.appendChild(resetButton)
    }
  }

  // Handle search effect
  useEffect(() => {
    if (searchQuery.length > 0) {
      const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0)
      const matches = AMENITIES.filter(amenity => 
        searchTerms.some(term => 
          amenity.name.toLowerCase().includes(term) ||
          amenity.description.toLowerCase().includes(term) ||
          amenity.keywords.some(keyword => keyword.toLowerCase().includes(term))
        )
      )

      // Focus on first match if we have matches and aren't already focused
      if (matches.length > 0 && !focusedAmenity) {
        focusOnAmcard(matches[0].position)
      }
    }
  }, [searchQuery])

  // Filter amenities based on search query
  const filteredAmenities = AMENITIES.map(amenity => {
    const searchTerms = searchQuery.toLowerCase().split(' ').filter(term => term.length > 0)
    const isMatch = searchTerms.length === 0 || searchTerms.some(term => 
      amenity.name.toLowerCase().includes(term) ||
      amenity.description.toLowerCase().includes(term) ||
      amenity.keywords.some(keyword => keyword.toLowerCase().includes(term))
    )
    
    return { ...amenity, isHighlighted: isMatch && searchQuery.length > 0 }
  })

  return (
    <>
      {gltf && <primitive object={gltf.scene} scale={1} />}
      {modelLoaded && filteredAmenities.map((amenity) => (
        <Label
          key={amenity.id}
          position={amenity.position}
          name={amenity.name}
          description={amenity.description}
          onClick={onLabelClick}
          isHighlighted={amenity.isHighlighted}
          onFocus={focusOnAmcard}
        />
      ))}
    </>
  )
} 
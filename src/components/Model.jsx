import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = 'https://utfs.io/f/zALdaFej0tyef6wegO2UwhctIHY7xMjLSGQZdrezTXyROqKp'
const CACHE_KEY = 'modelCache_v1'

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
      // Cleanup if component unmounts during loading
      setProgress(0)
      setModel(null)
    }
  }, [url])

  return { progress, model }
}

function Label({ position, name, description, onClick }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          style={{
            padding: '8px',
            background: isHovered ? '#2196F3' : '#1a1a1a',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            transform: 'translate3d(-50%, -50%, 0)',
            fontSize: '14px',
            userSelect: 'none',
            transition: 'background-color 0.3s'
          }}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={() => onClick({ name, description })}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}

const AMENITIES = [
  { id: 1, name: 'Main Entrance', position: [2, 1, 0], description: 'Main entrance of the station' },
  { id: 2, name: 'Ticket Counter', position: [-2, 1, 0], description: 'Ticket booking and information' },
  { id: 3, name: 'Platform 1', position: [0, 0, 2], description: 'Platform for local trains' },
]

export default function Model({ onProgress, onLabelClick }) {
  const { camera } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  
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
          child.material.roughness = 0.5
          child.material.metalness = 0.5
        }
      })

      setModelLoaded(true)
    }
  }, [gltf])

  return (
    <>
      {gltf && <primitive object={gltf.scene} scale={1} />}
      {modelLoaded && AMENITIES.map((amenity) => (
        <Label
          key={amenity.id}
          position={amenity.position}
          name={amenity.name}
          description={amenity.description}
          onClick={onLabelClick}
        />
      ))}
    </>
  )
} 
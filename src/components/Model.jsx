import { useEffect, useState } from 'react'
import { useLoader, useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

const MODEL_URL = 'https://utfs.io/f/zALdaFej0tyef6wegO2UwhctIHY7xMjLSGQZdrezTXyROqKp'

// Example amenities data - replace with your actual data
const AMENITIES = [
  { id: 1, name: 'Main Entrance', position: [2, 1, 0], description: 'Main entrance of the station' },
  { id: 2, name: 'Ticket Counter', position: [-2, 1, 0], description: 'Ticket booking and information' },
  { id: 3, name: 'Platform 1', position: [0, 0, 2], description: 'Platform for local trains' },
  // Add more amenities as needed
]

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

export default function Model({ onProgress, onLabelClick }) {
  const { camera } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)

  const gltf = useLoader(
    GLTFLoader,
    MODEL_URL,
    (xhr) => {
      if (xhr.total > 0) {
        const progress = (xhr.loaded / xhr.total) * 100
        onProgress(Math.round(progress))
      } else {
        onProgress(0) // Set to 0 if total is not available yet
      }
    }
  )

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
      onProgress(100) // Ensure we set to 100 when fully loaded
    }
  }, [gltf, onProgress])

  return (
    <>
      <primitive object={gltf.scene} scale={1} />
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
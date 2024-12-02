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
      "id": 1,
      "position": [
        12.016415459246158,
        2.545179283145544,
        8.040242463854476
      ],
      "name": "Guest Room",
      "description": "Staying rooms for long layovers",
      "image": "https://cdn.pixabay.com/photo/2016/11/30/08/48/bedroom-1872196_1280.jpg"
    },
    {
      "id": 2,
      "position": [
        26.057093979852517,
        2.903489407401707,
        7.43914190356371
      ],
      "name": "Waiting Area",
      "description": "Sitting lounge for waiting for trains",
      "image": "https://cdn.pixabay.com/photo/2014/11/27/20/14/waiting-room-548136_960_720.jpg"
    },
    {
      "id": 3,
      "position": [
        35.530266678879194,
        2.66204965501281,
        5.586113143093582
      ],
      "name": "Helpdesk and police station",
      "description": "Helpdesk area to seek help in case of emergency.",
      "image": "https://cdn.pixabay.com/photo/2016/02/26/01/13/telephone-1223310_1280.jpg"
    },
    {
      "id": 4,
      "position": [
        32.7898925979792,
        -5.0797801005786525,
        -2.1249571787497055
      ],
      "name": "Flyover",
      "description": "Flyover connecting platform 1 and platform 2.",
      "image": "https://cdn.pixabay.com/photo/2020/09/24/17/44/bridge-5599336_1280.jpg"
    },
    {
      "id": 5,
      "position": [
        27.902290155942367,
        -4.710425474953573,
        -1.1645742440065368
      ],
      "name": "Ticket Counter",
      "description": "Collect ticket for trains.",
      "image": "https://media.istockphoto.com/id/624374948/photo/boarding-the-plane-departure-lounge.jpg?s=1024x1024&w=is&k=20&c=S741SDjVd2pebhcaNliX590jmkpWbAdS7P_YAE7CSZE="
    },
    {
      "id": 6,
      "position": [
        9.357971435217456,
        -6.109332195695361,
        0.6194542677134705
      ],
      "name": "Digital Kiosk 1",
      "description": "Kiosks for navigation and calling helpdesks.",
      "image": "https://media.istockphoto.com/id/1471533844/photo/copenhagen-denmark.jpg?s=612x612&w=0&k=20&c=s5VcO6pyrraTQuKPkfRfyVSLRwrHr84uzoSR2wJvuVI="
    },
    {
      "id": 7,
      "position": [
        -19.347162965118233,
        -1.4721520611946464,
        1.2886667075625238
      ],
      "name": "Miscelleneous Stores",
      "description": "Book Stores, General Stores, Toy Stores etc.",
      "image": "https://cdn.pixabay.com/photo/2016/03/02/20/13/grocery-1232944_960_720.jpg"
    },
    {
      "id": 8,
      "position": [
        -5.6070942333090965,
        -0.9286954981430944,
        4.635295612679769
      ],
      "name": "Food court",
      "description": "Food court with multiple food business outlets.",
      "image": "https://cdn.pixabay.com/photo/2021/11/01/15/52/spring-roll-6760871_1280.jpg"
    },
    {
      "id": 9,
      "position": [
        -32.34578096983119,
        -0.6615612553673581,
        7.7113781505357695
      ],
      "name": "Luggage lockers",
      "description": "Keep your luggage safe at lockers here.",
      "image": "https://cdn.pixabay.com/photo/2015/11/10/22/29/odd-1037935_960_720.jpg"
    },
    {
      "id": 10,
      "position": [
        -22.300059797786226,
        -0.4004004744364605,
        2.3471971288012274
      ],
      "name": "Washroom",
      "description": "Washroom",
      "image": "https://cdn.pixabay.com/photo/2021/12/18/06/02/bathroom-6878035_1280.jpg"
    }
  ]

function Label({ position, name, description, image, onClick, isHighlighted, onFocus }) {
  const [isHovered, setIsHovered] = useState(false)
  
  const handleClick = () => {
    onClick({ name, description, image })
    onFocus(position)
  }
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          style={{
            padding: '12px',
            background: isHighlighted 
              ? '#2196F3' 
              : isHovered 
                ? 'rgba(33, 150, 243, 0.8)' 
                : '#1a1a1a',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
            transform: 'translate3d(-50%, -50%, 0)',
            fontSize: '16px',
            userSelect: 'none',
            transition: 'all 0.3s ease',
            boxShadow: isHighlighted ? '0 0 15px rgba(33, 150, 243, 0.5)' : 'none',
            border: isHighlighted ? '1px solid rgba(255, 255, 255, 0.3)' : 'none',
            animation: isHighlighted ? 'pulse 2s infinite' : 'none',
            opacity: 1
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
          image={amenity.image}
          onClick={onLabelClick}
          isHighlighted={amenity.isHighlighted}
          onFocus={focusOnAmcard}
        />
      ))}
    </>
  )
} 
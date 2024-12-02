import { useEffect, useState, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { 
  Hotel, 
  Sofa, 
  HelpCircle, 
  Footprints, 
  Ticket, 
  Tablet, 
  ShoppingBag, 
  UtensilsCrossed, 
  Lock,
  Bath
} from 'lucide-react'

const MODEL_URL = 'https://utfs.io/f/zALdaFej0tyef6wegO2UwhctIHY7xMjLSGQZdrezTXyROqKp'
const CACHE_KEY = 'modelCache_v1'

const getIconComponent = (tags) => {
  // Map tags to icons - can be expanded based on more tags
  if (tags.includes('accommodation')) return Hotel
  if (tags.includes('seating')) return Sofa
  if (tags.includes('help')) return HelpCircle
  if (tags.includes('bridge')) return Footprints
  if (tags.includes('ticket')) return Ticket
  if (tags.includes('digital')) return Tablet
  if (tags.includes('shopping')) return ShoppingBag
  if (tags.includes('food')) return UtensilsCrossed
  if (tags.includes('storage')) return Lock
  if (tags.includes('restroom')) return Bath
  return HelpCircle // default icon
}

const AMENITIES = [
  { 
    id: 1, 
    name: 'Guest Room',
    position: [12.016415459246158, 2.545179283145544, 8.040242463854476],
    description: 'Staying rooms for long layovers',
    image: 'https://cdn.pixabay.com/photo/2016/11/30/08/48/bedroom-1872196_1280.jpg',
    tags: ['accommodation', 'rest', 'sleep']
  },
  {
    id: 2,
    name: "Waiting Area",
    position: [26.057093979852517, 2.903489407401707, 7.43914190356371],
    description: "Sitting lounge for waiting for trains",
    image: "https://cdn.pixabay.com/photo/2014/11/27/20/14/waiting-room-548136_960_720.jpg",
    tags: ['seating', 'rest']
  },
  {
    id: 3,
    name: "Helpdesk and police station",
    position: [35.530266678879194, 2.66204965501281, 5.586113143093582],
    description: "Helpdesk area to seek help in case of emergency.",
    image: "https://cdn.pixabay.com/photo/2016/02/26/01/13/telephone-1223310_1280.jpg",
    tags: ['help', 'rest']
  },
  {
    id: 4,
    name: "Flyover",
    position: [32.7898925979792, -5.0797801005786525, -2.1249571787497055],
    description: "Flyover connecting platform 1 and platform 2.",
    image: "https://cdn.pixabay.com/photo/2020/09/24/17/44/bridge-5599336_1280.jpg",
    tags: ['bridge', 'rest']
  },
  {
    id: 5,
    name: "Ticket Counter",
    position: [27.902290155942367, -4.710425474953573, -1.1645742440065368],
    description: "Collect ticket for trains.",
    image: "https://media.istockphoto.com/id/624374948/photo/boarding-the-plane-departure-lounge.jpg?s=1024x1024&w=is&k=20&c=S741SDjVd2pebhcaNliX590jmkpWbAdS7P_YAE7CSZE=",
    tags: ['ticket', 'rest']
  },
  {
    id: 6,
    name: "Digital Kiosk 1",
    position: [9.357971435217456, -6.109332195695361, 0.6194542677134705],
    description: "Kiosks for navigation and calling helpdesks.",
    image: "https://media.istockphoto.com/id/1471533844/photo/copenhagen-denmark.jpg?s=612x612&w=0&k=20&c=s5VcO6pyrraTQuKPkfRfyVSLRwrHr84uzoSR2wJvuVI=",
    tags: ['digital', 'rest']
  },
  {
    id: 7,
    name: "Miscelleneous Stores",
    position: [-19.347162965118233, -1.4721520611946464, 1.2886667075625238],
    description: "Book Stores, General Stores, Toy Stores etc.",
    image: "https://cdn.pixabay.com/photo/2016/03/02/20/13/grocery-1232944_960_720.jpg",
    tags: ['shopping', 'rest']
  },
  {
    id: 8,
    name: "Food court",
    position: [-5.6070942333090965, -0.9286954981430944, 4.635295612679769],
    description: "Food court with multiple food business outlets.",
    image: "https://cdn.pixabay.com/photo/2021/11/01/15/52/spring-roll-6760871_1280.jpg",
    tags: ['food', 'rest']
  },
  {
    id: 9,
    name: "Luggage lockers",
    position: [-32.34578096983119, -0.6615612553673581, 7.7113781505357695],
    description: "Keep your luggage safe at lockers here.",
    image: "https://cdn.pixabay.com/photo/2015/11/10/22/29/odd-1037935_960_720.jpg",
    tags: ['storage', 'rest']
  },
  {
    id: 10,
    name: "Washroom",
    position: [-22.300059797786226, -0.4004004744364605, 2.3471971288012274],
    description: "Washroom",
    image: "https://cdn.pixabay.com/photo/2021/12/18/06/02/bathroom-6878035_1280.jpg",
    tags: ['restroom', 'rest']
  }
]

function Label({ position, name, description, image, tags, onClick, isHighlighted, onFocus }) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = getIconComponent(tags)
  
  const handleClick = () => {
    onClick({ name, description, image })
    onFocus(position)
  }
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          className={`amcard ${isHighlighted ? 'highlighted' : ''}`}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={handleClick}
        >
          <div className="amcard-icon-container">
            <IconComponent size={48} strokeWidth={1.5} />
          </div>
          <div className="amcard-text">
            {name}
          </div>
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
      try {
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
            child.material.needsUpdate = true
          }
        })

        setModelLoaded(true)
        originalCameraPosition.current = camera.position.clone()

        // Set camera limits
        if (controls) {
          controls.maxPolarAngle = Math.PI / 2 // Prevent viewing from below
          controls.minPolarAngle = Math.PI / 4 // Limit top-down view
          controls.update()
        }

        // Log successful loading
        console.log('Model loaded successfully')
      } catch (error) {
        console.error('Error setting up model:', error)
      }
    }
  }, [gltf, camera, controls])

  // Function to focus camera on amcard
  const focusOnAmcard = (position) => {
    if (isAnimating.current) return

    isAnimating.current = true
    const amenity = AMENITIES.find(a => 
      a.position[0] === position[0] && 
      a.position[1] === position[1] && 
      a.position[2] === position[2]
    )

    if (!amenity) {
      console.warn('Amenity not found for position:', position)
      isAnimating.current = false
      return
    }

    setFocusedAmenity(amenity)

    try {
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
    } catch (error) {
      console.error('Error animating camera:', error)
      isAnimating.current = false
    }

    // Add reset button if it doesn't exist
    if (!document.querySelector('.reset-view-button')) {
      const resetButton = document.createElement('button')
      resetButton.textContent = 'Reset View'
      resetButton.className = 'reset-view-button'
      resetButton.onclick = () => {
        if (isAnimating.current) return
        isAnimating.current = true

        setFocusedAmenity(null)

        try {
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
        } catch (error) {
          console.error('Error resetting camera:', error)
          isAnimating.current = false
        }
      }
      document.body.appendChild(resetButton)
    }
  }

  // Filter amenities based on search query
  const filteredAmenities = AMENITIES.filter(amenity => {
    if (!searchQuery) return true

    const searchTerms = searchQuery.toLowerCase().split(' ')
    return searchTerms.every(term =>
      amenity.name.toLowerCase().includes(term) ||
      amenity.description.toLowerCase().includes(term) ||
      amenity.tags.some(tag => tag.toLowerCase().includes(term))
    )
  })

  // Update model opacity based on search
  useEffect(() => {
    if (gltf) {
      try {
        const isSearching = searchQuery.length > 0
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material.opacity = isSearching ? 0.3 : 1
            child.material.transparent = true
            child.material.needsUpdate = true
          }
        })
      } catch (error) {
        console.error('Error updating model opacity:', error)
      }
    }
  }, [gltf, searchQuery])

  // Focus on the first matching amenity when searching
  useEffect(() => {
    if (searchQuery && filteredAmenities.length > 0) {
      focusOnAmcard(filteredAmenities[0].position)
    } else {
      setFocusedAmenity(null)
    }
  }, [searchQuery, filteredAmenities])

  return (
    <>
      {gltf && (
        <group visible={modelLoaded}>
          <primitive object={gltf.scene} scale={1} />
          {modelLoaded && filteredAmenities.map((amenity) => (
            <Label
              key={amenity.id}
              position={amenity.position}
              name={amenity.name}
              description={amenity.description}
              image={amenity.image}
              tags={amenity.tags}
              onClick={onLabelClick}
              isHighlighted={focusedAmenity?.id === amenity.id}
              onFocus={focusOnAmcard}
            />
          ))}
        </group>
      )}
    </>
  )
} 
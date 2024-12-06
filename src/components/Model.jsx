import { useEffect, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
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
import { useModelDownload } from '../hooks/useModelDownload'

const MODEL_URL = 'https://utfs.io/f/zALdaFej0tyef6wegO2UwhctIHY7xMjLSGQZdrezTXyROqKp'

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

function Label({ position, name, description, image, tags, onClick, isHighlighted }) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = getIconComponent(tags)
  
  return (
    <group position={position}>
      <Html distanceFactor={10}>
        <div
          className={`amcard ${isHighlighted ? 'highlighted' : ''}`}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => setIsHovered(false)}
          onClick={() => onClick({ name, description, image })}
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

export default function Model({ onProgress, onLabelClick, searchQuery = '' }) {
  const { camera, controls } = useThree()
  const [modelLoaded, setModelLoaded] = useState(false)
  const [focusedAmenity, setFocusedAmenity] = useState(null)
  const [filteredAmenities, setFilteredAmenities] = useState(AMENITIES)

  const { progress, model: gltf } = useModelDownload(MODEL_URL)

  // Update filtered amenities when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredAmenities(AMENITIES)
      setFocusedAmenity(null)
      return
    }
    const searchTerms = searchQuery.toLowerCase().split(' ')
    const filtered = AMENITIES.filter(amenity =>
      searchTerms.every(term =>
        amenity.name.toLowerCase().includes(term) ||
        amenity.description.toLowerCase().includes(term) ||
        amenity.tags.some(tag => tag.toLowerCase().includes(term))
      )
    )
    setFilteredAmenities(filtered)
    
    // Update highlighted amenity for search
    if (filtered.length > 0) {
      setFocusedAmenity(filtered[0])
    } else {
      setFocusedAmenity(null)
    }
  }, [searchQuery])

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

        // Natural material enhancement
        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            child.material = child.material.clone()
            
            const originalColor = child.material.color?.clone()
            const originalMap = child.material.map
            
            if (child.material.name.includes('glass') || child.material.name.includes('window')) {
              child.material.transparent = true
              child.material.opacity = 0.6
            }
            
            if (originalMap) {
              child.material.map = originalMap
              child.material.map.encoding = THREE.sRGBEncoding
              child.material.map.minFilter = THREE.LinearFilter
              child.material.map.magFilter = THREE.LinearFilter
              child.material.map.needsUpdate = true
            }
            
            if (originalColor) {
              child.material.color = originalColor
            }
            
            child.material.needsUpdate = true
          }
        })

        setModelLoaded(true)

        // Set camera limits
        if (controls) {
          controls.maxPolarAngle = Math.PI / 2
          controls.minPolarAngle = Math.PI / 4
          controls.update()
        }

      } catch (error) {
        console.error('Error setting up model:', error)
      }
    }
  }, [gltf, camera, controls])

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
            />
          ))}
        </group>
      )}
    </>
  )
} 
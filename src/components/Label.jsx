import { Html } from '@react-three/drei'
import { useState } from 'react'

export default function Label({ position, name, description, image, tags, onClick, isHighlighted }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Html position={position}>
      <div
        className={`label-container ${isHighlighted ? 'highlighted' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick({ name, description, image, tags, position })}
      >
        <div className="label-icon">
          {name[0]}
        </div>
      </div>
    </Html>
  )
} 
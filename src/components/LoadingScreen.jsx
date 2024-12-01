export default function LoadingScreen({ progress }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        display: progress >= 100 ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div className="loading-content" style={{ position: 'relative' }}>
        {/* Circular Progress */}
        <div
          style={{
            position: 'relative',
            width: '200px',
            height: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'scale(0.8)'
          }}
        >
          {/* Background Circle */}
          <svg
            style={{
              position: 'absolute',
              transform: 'rotate(-90deg)',
              filter: 'blur(1px)'
            }}
            width="200"
            height="200"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#ffffff10"
              strokeWidth="2"
            />
          </svg>

          {/* Progress Circle */}
          <svg
            style={{
              position: 'absolute',
              transform: 'rotate(-90deg)',
              filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.3))'
            }}
            width="200"
            height="200"
          >
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeDasharray={`${2 * Math.PI * 90 * progress / 100} ${2 * Math.PI * 90}`}
              style={{
                transition: 'stroke-dasharray 0.3s ease'
              }}
            />
          </svg>

          {/* Inner content */}
          <div
            style={{
              position: 'absolute',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, #ffffff05 0%, #00000000 70%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pulse 4s ease-in-out infinite'
            }}
          >
            <div
              style={{
                width: '10px',
                height: '10px',
                background: '#fff',
                borderRadius: '50%',
                filter: 'blur(4px)',
                animation: 'glow 4s ease-in-out infinite'
              }}
            />
          </div>
        </div>

        {/* Loading Text */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            textAlign: 'center',
            bottom: '-60px',
            fontSize: '14px',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#ffffff60',
            animation: 'fadeInOut 2s ease-in-out infinite'
          }}
        >
          Loading
        </div>
      </div>

      <style>
        {`
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 1; }
          }

          @keyframes glow {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 1; }
          }

          @keyframes fadeInOut {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }

          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  )
} 
export default function LoadingScreen({ progress }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.9)',
        display: progress >= 100 ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}
    >
      <h2 style={{ marginBottom: '20px' }}>Loading 3D Model...</h2>
      <div
        style={{
          width: '200px',
          height: '20px',
          background: '#1a1a1a',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${progress}%`,
            height: '100%',
            background: '#4CAF50',
            transition: 'width 0.3s ease-in-out'
          }}
        />
      </div>
      <p style={{ marginTop: '10px' }}>{Math.round(progress)}%</p>
    </div>
  )
} 
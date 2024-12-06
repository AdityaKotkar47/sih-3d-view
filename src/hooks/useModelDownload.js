import { useState, useEffect, useRef } from 'react'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

const CACHE_KEY = 'modelCache_v1'

// Utility function to create a smooth progress animation
const createProgressAnimator = (setProgress) => {
  return (startValue, endValue, duration) => {
    return new Promise((resolve) => {
      const steps = 20
      const stepValue = (endValue - startValue) / steps
      const stepDuration = duration / steps
      let currentStep = 0

      const interval = setInterval(() => {
        if (currentStep <= steps) {
          const newProgress = startValue + stepValue * currentStep
          setProgress(Math.min(Math.round(newProgress), endValue))
          currentStep++
        } else {
          clearInterval(interval)
          resolve()
        }
      }, stepDuration)
    })
  }
}

// Function to load model from cache
const loadFromCache = async (url, loader, animateProgress) => {
  try {
    const cache = await caches.open(CACHE_KEY)
    const cachedResponse = await cache.match(url)
    
    if (!cachedResponse) {
      return { success: false }
    }

    console.log('Loading model from cache...')
    const blob = await cachedResponse.blob()
    const arrayBuffer = await blob.arrayBuffer()

    return new Promise((resolve) => {
      loader.parse(
        arrayBuffer,
        '',
        async (gltf) => {
          // Show quick progress for cache load
          await animateProgress(0, 100, 800)
          resolve({ success: true, model: gltf })
        },
        (error) => {
          console.error('Error parsing cached model:', error)
          resolve({ success: false, error })
        }
      )
    })
  } catch (error) {
    console.error('Cache error:', error)
    return { success: false, error }
  }
}

// Function to load model from network
const loadFromNetwork = async (url, loader, animateProgress, onProgress) => {
  console.log('Downloading model from network...')
  let lastProgress = 0

  try {
    // Create a promise that resolves with the loaded model
    const modelPromise = new Promise((resolve, reject) => {
      loader.load(
        url,
        (gltf) => resolve(gltf),
        (event) => {
          if (event.lengthComputable) {
            lastProgress = Math.round((event.loaded / event.total) * 90) // Save network progress
            onProgress(lastProgress)
          }
        },
        reject
      )
    })

    const model = await modelPromise
    
    // Animate final progress
    await animateProgress(lastProgress, 95, 300)
    await animateProgress(95, 100, 200)

    // Cache the model for future use
    try {
      const response = await fetch(url)
      const cache = await caches.open(CACHE_KEY)
      await cache.put(url, response)
      console.log('Model cached successfully!')
    } catch (error) {
      console.error('Caching error:', error)
    }

    return { success: true, model }
  } catch (error) {
    console.error('Network error:', error)
    return { success: false, error }
  }
}

export function useModelDownload(url) {
  const [progress, setProgress] = useState(0)
  const [model, setModel] = useState(null)
  const loadedModel = useRef(null)
  const isLoading = useRef(true)

  useEffect(() => {
    const loader = new GLTFLoader()
    const animateProgress = createProgressAnimator(setProgress)
    isLoading.current = true

    async function loadModel() {
      // Try loading from cache first
      const cacheResult = await loadFromCache(url, loader, animateProgress)
      
      if (cacheResult.success) {
        if (isLoading.current) {
          loadedModel.current = cacheResult.model
          setModel(cacheResult.model)
        }
        return
      }

      // If cache fails or doesn't exist, load from network
      const networkResult = await loadFromNetwork(
        url,
        loader,
        animateProgress,
        (progress) => isLoading.current && setProgress(progress)
      )

      if (networkResult.success && isLoading.current) {
        loadedModel.current = networkResult.model
        setModel(networkResult.model)
      }
    }

    loadModel()

    return () => {
      isLoading.current = false
      setProgress(0)
      setModel(null)
      loadedModel.current = null
    }
  }, [url])

  return { progress, model }
}

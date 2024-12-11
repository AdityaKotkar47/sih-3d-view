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

export function useModelDownload(url) {
  const [progress, setProgress] = useState(0)
  const [model, setModel] = useState(null)
  const loadedModel = useRef(null)
  const isLoading = useRef(true)
  const downloadedModelRef = useRef(null)

  useEffect(() => {
    const loader = new GLTFLoader()
    const animateProgress = createProgressAnimator(setProgress)
    isLoading.current = true

    async function loadModel() {
      // First, try loading from cache
      try {
        const cache = await caches.open(CACHE_KEY)
        const cachedResponse = await cache.match(url)
        
        if (cachedResponse) {
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
                if (isLoading.current) {
                  loadedModel.current = gltf
                  setModel(gltf)
                }
                resolve(gltf)
              },
              (error) => {
                console.error('Error parsing cached model:', error)
                resolve(null)
              }
            )
          })
        }
      } catch (error) {
        console.error('Cache check error:', error)
      }

      // If not in cache, download from network
      console.log('Downloading model from network...')
      let lastProgress = 0

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          async (gltf) => {
            // Immediately set the model and start progress animation
            if (isLoading.current) {
              loadedModel.current = gltf
              setModel(gltf)
              downloadedModelRef.current = gltf
              
              // Animate progress
              await animateProgress(0, 95, 300)
              await animateProgress(95, 100, 200)
            }

            // Background caching
            try {
              const response = await fetch(url)
              const cache = await caches.open(CACHE_KEY)
              await cache.put(url, response)
              console.log('Model cached in background successfully!')
            } catch (error) {
              console.error('Background caching error:', error)
            }

            resolve(gltf)
          },
          (event) => {
            if (event.lengthComputable) {
              lastProgress = Math.round((event.loaded / event.total) * 90)
              isLoading.current && setProgress(lastProgress)
            }
          },
          (error) => {
            console.error('Network error:', error)
            reject(error)
          }
        )
      })
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
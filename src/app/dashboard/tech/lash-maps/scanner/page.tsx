'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, ArrowLeft, CheckCircle, Star, RotateCw, Sparkles, Target, Zap, Eye, Sliders } from 'lucide-react'
import { createClient } from '@/utils/supabase'

// MediaPipe Face Mesh will be loaded dynamically
declare global {
  interface Window {
    FaceMesh: any
    Camera: any
    lastFaceLog?: number
    lastNoFaceLog?: number
    lastFeatures?: DetectedFeatures
  }
}

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string | null
  specifications?: any
}

interface Recommendation {
  map: LashMap
  reason: string
  matchScore: number
  facialMatch: string
  preferenceMatch: string
}

interface DetectedFeatures {
  eyeShape: string
  eyeSpacing: string
  faceShape: string
  eyeSize: string
  confidence: {
    eyeShape: number
    eyeSpacing: number
    faceShape: number
    eyeSize: number
  }
}

interface ClientPreferences {
  looks: string[]
  intensity: number
  specialNotes: string
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function LashMapsScannerPage() {
  const [isClient, setIsClient] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<any>(null)
  const faceMeshRef = useRef<any>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [detectedFeatures, setDetectedFeatures] = useState<DetectedFeatures | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [allLashMaps, setAllLashMaps] = useState<LashMap[]>([])
  
  const [preferences, setPreferences] = useState<ClientPreferences>({
    looks: [],
    intensity: 5,
    specialNotes: ''
  })
  
  const supabase = createClient()
  
  // Only run on client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  const lookOptions = [
    { id: 'natural', label: 'Natural & Subtle', icon: '🌿' },
    { id: 'dramatic', label: 'Dramatic & Bold', icon: '✨' },
    { id: 'cat-eye', label: 'Cat Eye Effect', icon: '🐱' },
    { id: 'doll-eye', label: 'Doll Eye / Wide Open', icon: '👁️' },
    { id: 'length', label: 'Extra Length', icon: '📏' },
    { id: 'volume', label: 'Maximum Volume', icon: '💫' },
    { id: 'wispy', label: 'Wispy & Textured', icon: '🌸' },
    { id: 'low-maintenance', label: 'Low Maintenance', icon: '⏱️' }
  ]

  useEffect(() => {
    loadLashMaps()
    loadMediaPipe()
    
    return () => {
      // Stop video stream when component unmounts
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  // Start camera after loading is complete and video element is in DOM
  useEffect(() => {
    if (!isLoading && hasPermission === null && videoRef.current && faceMeshRef.current) {
      console.log('🎬 Video element now in DOM, starting camera...')
      startCamera()
    }
  }, [isLoading, hasPermission])

  const loadLashMaps = async () => {
    try {
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .limit(50)

      if (error) throw error
      setAllLashMaps(data || [])
    } catch (error) {
      console.error('Error loading lash maps:', error)
    }
  }

  const loadMediaPipe = async () => {
    try {
      console.log('🚀 Step 1: Loading MediaPipe Face Mesh scripts...')
      
      // Load MediaPipe scripts
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
      console.log('✅ Camera utils loaded')
      console.log('Window.Camera available?', typeof window.Camera)
      
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
      console.log('✅ Face mesh script loaded')
      console.log('Window.FaceMesh available?', typeof window.FaceMesh)
      console.log('Window.FaceMesh value:', window.FaceMesh)
      
      // Wait a bit for scripts to fully initialize
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('After wait - Window.FaceMesh:', typeof window.FaceMesh, window.FaceMesh)
      
      if (!window.FaceMesh || typeof window.FaceMesh !== 'function') {
        throw new Error(`FaceMesh not loaded correctly. Type: ${typeof window.FaceMesh}, Value: ${window.FaceMesh}`)
      }
      
      console.log('🚀 Step 2: Initializing Face Mesh model...')
      
      // Initialize Face Mesh
      const faceMesh = new window.FaceMesh({
        locateFile: (file: string) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        }
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      })

      faceMesh.onResults(onFaceMeshResults)
      faceMeshRef.current = faceMesh

      console.log('✅ Face Mesh initialized')
      console.log('FaceMesh ref exists?', !!faceMeshRef.current)
      
      console.log('✅ MediaPipe loading complete!')
      console.log('⏳ Setting isLoading to false, which will render video element...')
      setIsLoading(false)
      console.log('📺 Video element should now render, camera will start in separate effect...')
      
    } catch (error) {
      console.error('❌ CRITICAL ERROR in loadMediaPipe:', error)
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      setIsLoading(false)
      setHasPermission(false)
      alert(`Failed to initialize AI: ${error instanceof Error ? error.message : 'Unknown error'}. Check console for details.`)
    }
  }

  const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = src
      script.crossOrigin = 'anonymous'
      script.onload = () => resolve()
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  const startCamera = async () => {
    try {
      console.log('🚀 Step 3: Starting camera...')
      console.log('Checking refs... Video:', !!videoRef.current, 'FaceMesh:', !!faceMeshRef.current)
      
      if (!videoRef.current || !faceMeshRef.current) {
        console.error('❌ REFS NOT READY! Video:', !!videoRef.current, 'FaceMesh:', !!faceMeshRef.current)
        throw new Error('Video or FaceMesh ref not ready')
      }

      console.log('🎥 Requesting camera permission from browser...')
      console.log('📱 This should trigger a browser popup asking for camera access')
      
      // Request camera access directly using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      console.log('✅ Camera permission GRANTED by user!')
      console.log('📹 Stream obtained, active tracks:', stream.getVideoTracks().length)
      stream.getVideoTracks().forEach(track => {
        console.log('  - Track:', track.label, 'enabled:', track.enabled, 'readyState:', track.readyState)
      })
      
      // Set the stream to the video element
      console.log('📺 Attaching stream to video element...')
      videoRef.current.srcObject = stream
      
      // Wait for video to be ready
      console.log('⏳ Waiting for video metadata to load...')
      await new Promise<void>((resolve) => {
          if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            console.log('✅ Video metadata loaded!')
            console.log('   Video size:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
            resolve()
          }
        }
      })

      // Now set up frame processing with MediaPipe
      console.log('🔄 Setting up continuous frame processing loop...')
      let frameCount = 0
      const processFrame = async () => {
        if (videoRef.current && faceMeshRef.current && videoRef.current.readyState === 4) {
          frameCount++
          if (frameCount === 1) {
            console.log('📤 Sending first frame to MediaPipe...')
          }
          if (frameCount % 60 === 0) {
            console.log(`📊 Processed ${frameCount} frames`)
          }
          await faceMeshRef.current.send({ image: videoRef.current })
        }
        requestAnimationFrame(processFrame)
      }
      
      processFrame()
      
      console.log('✅ Setting hasPermission to TRUE')
      setHasPermission(true)
      console.log('🎉 CAMERA AND FACE DETECTION READY!')
      
    } catch (error) {
      console.error('❌ ==================== CAMERA ERROR ====================')
      console.error('Error object:', error)
      console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown')
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
      console.error('======================================================')
      
      setHasPermission(false)
      
      let errorMessage = 'Unable to access camera.'
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and refresh the page.'
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found on this device.'
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is in use by another application.'
        } else {
          errorMessage = error.message
        }
      }
      
      alert(`Camera Error: ${errorMessage}\n\nCheck browser console (F12) for detailed error information.`)
    }
  }

  const onFaceMeshResults = (results: any) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas internal size to match its displayed size (not raw video size)
    // This ensures the overlay aligns properly with the CSS-scaled video
    const displayWidth = canvas.clientWidth
    const displayHeight = canvas.clientHeight
    
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth
      canvas.height = displayHeight
    }

    // Save context state
    ctx.save()
    
    // Mirror the canvas to match the mirrored video
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0]
      
      // Log detection (only once per second to avoid spam)
      const now = Date.now()
      if (!window.lastFaceLog || now - window.lastFaceLog > 1000) {
        console.log('👤 Face detected! Landmarks:', landmarks.length, 'points')
        console.log('First landmark:', landmarks[0])
        console.log('Last landmark index:', landmarks.length - 1)
        window.lastFaceLog = now
      }
      
      // Only draw if we have enough landmarks (MediaPipe Face Mesh should have 468)
      if (!landmarks || !Array.isArray(landmarks) || landmarks.length < 468) {
        console.warn('⚠️ Invalid or incomplete landmarks:', {
          exists: !!landmarks,
          isArray: Array.isArray(landmarks),
          length: landmarks?.length || 0,
          expected: 468
        })
        setFaceDetected(false)
        setDetectedFeatures(null)
        ctx.restore()
        return
      }
      
      try {
        // Draw visual grid overlay
        drawFacialGrid(ctx, landmarks, canvas.width, canvas.height)
        
        // Detect features
        const features = analyzeFeatures(landmarks, canvas.width, canvas.height)
        
        // Log features (only when they change)
        if (!window.lastFeatures || JSON.stringify(window.lastFeatures) !== JSON.stringify(features)) {
          console.log('🎯 Features detected:', features)
          window.lastFeatures = features
        }
        
        setDetectedFeatures(features)
        setFaceDetected(true)
      } catch (error) {
        console.error('❌ Error processing face landmarks:', error)
        console.log('Landmarks that caused error:', {
          length: landmarks.length,
          sample: [0, 33, 133, 144, 159, 160].map(i => ({ index: i, exists: !!landmarks[i] }))
        })
        setFaceDetected(false)
        setDetectedFeatures(null)
      }
    } else {
      // Log when no face detected (throttled)
      const now = Date.now()
      if (!window.lastNoFaceLog || now - window.lastNoFaceLog > 2000) {
        console.log('❌ No face detected in frame')
        window.lastNoFaceLog = now
      }
      
      setFaceDetected(false)
      setDetectedFeatures(null)
    }
    
    // Restore context state
    ctx.restore()
  }

  const drawFacialGrid = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Set up drawing style - PINK theme!
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)' // Hot pink
    ctx.fillStyle = 'rgba(236, 72, 153, 0.9)' // Hot pink
    ctx.lineWidth = 2

    // Vertical offset to align mesh with face (negative = up, positive = down)
    const yOffset = -80 // Shift mesh up by 80 pixels

    // Helper function to draw landmarks with safety check
    const drawLandmark = (index: number, size = 3) => {
      try {
        if (!(index in landmarks)) return
        const landmark = landmarks[index]
        if (!landmark || landmark.x === undefined || landmark.y === undefined) return
        
        const x = landmark.x * width
        const y = (landmark.y * height) + yOffset
    ctx.beginPath()
        ctx.arc(x, y, size, 0, 2 * Math.PI)
        ctx.fill()
      } catch (e) {
        // Silently skip this landmark if any error occurs
      }
    }

    // Helper function to draw line between landmarks with safety check
    const drawLine = (indices: number[]) => {
      try {
        // Safely check if all landmarks exist without throwing
        const validIndices: number[] = []
        for (const index of indices) {
          try {
            if (index in landmarks && landmarks[index] && landmarks[index].x !== undefined) {
              validIndices.push(index)
            }
          } catch (e) {
            // Skip this index if it causes an error
          }
        }
        
        if (validIndices.length < 2) {
          // Need at least 2 points to draw a line
          return
        }
        
    ctx.beginPath()
        validIndices.forEach((index, i) => {
          const x = landmarks[index].x * width
          const y = (landmarks[index].y * height) + yOffset
      if (i === 0) {
            ctx.moveTo(x, y)
      } else {
            ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
      } catch (e) {
        // Silently skip this line if any error occurs
      }
    }

    // Face oval outline (in pink) - Complete face contour that fits the whole face
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.7)' // Pink
    ctx.lineWidth = 3
    
    // Complete face oval - goes all the way around from top, down right side, across chin, up left side, back to top
    const completeFaceOval = [
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 
      152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
    ]
    drawLine([...completeFaceOval, completeFaceOval[0]]) // Close the loop

    // Left eye (in hot pink)
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)' // Hot pink
    ctx.lineWidth = 2
    const leftEyeUpper = [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
    const leftEyeLower = [33, 7, 163, 144, 145, 153, 154, 155, 133]
    drawLine(leftEyeUpper)
    drawLine([...leftEyeLower, leftEyeLower[0]])
    
    // Left eye key points (wrap entire block in try-catch)
    try {
      for (const i of [33, 133, 160, 144]) {
        drawLandmark(i, 4)
      }
    } catch (e) {
      // Skip left eye points if error
    }

    // Right eye (in green)
    const rightEyeUpper = [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
    const rightEyeLower = [263, 249, 390, 373, 374, 380, 381, 382, 362]
    drawLine(rightEyeUpper)
    drawLine([...rightEyeLower, rightEyeLower[0]])
    
    // Right eye key points (wrap entire block in try-catch)
    try {
      for (const i of [263, 362, 387, 373]) {
        drawLandmark(i, 4)
      }
    } catch (e) {
      // Skip right eye points if error
    }

    // Eyebrows (in light pink)
    ctx.strokeStyle = 'rgba(244, 114, 182, 0.7)' // Light pink
    const leftEyebrow = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
    const rightEyebrow = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
    drawLine(leftEyebrow)
    drawLine(rightEyebrow)

    // Nose bridge (in pale pink)
    ctx.strokeStyle = 'rgba(251, 182, 206, 0.6)' // Pale pink
    drawLine([168, 6, 197, 195, 5])

    // Eye spacing indicators (horizontal line between inner corners)
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)' // Hot pink
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    drawLine([133, 362])
    ctx.setLineDash([])

    // Add scanning effect (optional - animated lines)
    const time = Date.now() / 1000
    const scanY = (((time % 2) / 2) * height) + yOffset
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)' // Pink scan line
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, scanY)
    ctx.lineTo(width, scanY)
    ctx.stroke()
  }

  const analyzeFeatures = (landmarks: any[], width: number, height: number): DetectedFeatures => {
    // Verify all required landmarks exist
    const requiredIndices = [133, 33, 159, 145, 362, 263, 386, 374, 234, 454, 10, 152]
    const missingIndices = requiredIndices.filter(i => !landmarks[i])
    
    if (missingIndices.length > 0) {
      console.error('❌ Missing required landmarks for analysis:', missingIndices)
      // Return default features
      return {
        eyeShape: 'Unknown',
        eyeSpacing: 'Unknown',
        faceShape: 'Unknown',
        eyeSize: 'Unknown',
        confidence: {
          eyeShape: 0,
          eyeSpacing: 0,
          faceShape: 0,
          eyeSize: 0
        }
      }
    }
    
    // Get key landmark positions
    const leftEyeInner = landmarks[133]
    const leftEyeOuter = landmarks[33]
    const leftEyeTop = landmarks[159]
    const leftEyeBottom = landmarks[145]
    const rightEyeInner = landmarks[362]
    const rightEyeOuter = landmarks[263]
    const rightEyeTop = landmarks[386]
    const rightEyeBottom = landmarks[374]
    
    const faceLeft = landmarks[234]
    const faceRight = landmarks[454]
    const faceTop = landmarks[10]
    const faceBottom = landmarks[152]

    // Calculate eye dimensions
    const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x)
    const leftEyeHeight = Math.abs(leftEyeTop.y - leftEyeBottom.y)
    const rightEyeWidth = Math.abs(rightEyeInner.x - rightEyeOuter.x)
    const rightEyeHeight = Math.abs(rightEyeTop.y - rightEyeBottom.y)
    
    const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2
    const eyeRatio = avgEyeWidth / avgEyeHeight

    // Detect eye shape
    let eyeShape = 'Almond'
    let eyeShapeConfidence = 0.7
    
    if (eyeRatio > 3.0) {
      eyeShape = 'Almond'
      eyeShapeConfidence = 0.85
    } else if (eyeRatio < 2.5) {
      eyeShape = 'Round'
      eyeShapeConfidence = 0.8
    } else if (leftEyeTop.y < leftEyeBottom.y - 0.02) {
      eyeShape = 'Hooded'
      eyeShapeConfidence = 0.75
    } else if (leftEyeOuter.y < leftEyeInner.y) {
      eyeShape = 'Upturned'
      eyeShapeConfidence = 0.8
    } else if (leftEyeOuter.y > leftEyeInner.y) {
      eyeShape = 'Downturned'
      eyeShapeConfidence = 0.8
    }

    // Detect eye spacing
    const eyeSpacing = Math.abs(rightEyeInner.x - leftEyeInner.x)
    const eyeSpacingRatio = eyeSpacing / avgEyeWidth
    
    let eyeSpacingType = 'Average'
    let spacingConfidence = 0.75
    
    if (eyeSpacingRatio > 1.2) {
      eyeSpacingType = 'Wide-set'
      spacingConfidence = 0.85
    } else if (eyeSpacingRatio < 0.8) {
      eyeSpacingType = 'Close-set'
      spacingConfidence = 0.85
    }

    // Detect face shape
    const faceWidth = Math.abs(faceRight.x - faceLeft.x)
    const faceHeight = Math.abs(faceBottom.y - faceTop.y)
    const faceRatio = faceHeight / faceWidth
    
    let faceShape = 'Oval'
    let faceConfidence = 0.7
    
    if (faceRatio > 1.4) {
      faceShape = 'Oval'
      faceConfidence = 0.85
    } else if (faceRatio < 1.2) {
      faceShape = 'Round'
      faceConfidence = 0.8
    } else if (faceWidth > faceHeight * 0.9) {
      faceShape = 'Square'
      faceConfidence = 0.75
    }

    // Detect eye size
    const eyeArea = avgEyeWidth * avgEyeHeight
    const faceArea = faceWidth * faceHeight
    const eyeSizeRatio = eyeArea / faceArea
    
    let eyeSize = 'Medium'
    let sizeConfidence = 0.75
    
    if (eyeSizeRatio > 0.04) {
      eyeSize = 'Large'
      sizeConfidence = 0.8
    } else if (eyeSizeRatio < 0.025) {
      eyeSize = 'Small'
      sizeConfidence = 0.8
    }

        return {
      eyeShape,
      eyeSpacing: eyeSpacingType,
      faceShape,
      eyeSize,
      confidence: {
        eyeShape: eyeShapeConfidence,
        eyeSpacing: spacingConfidence,
        faceShape: faceConfidence,
        eyeSize: sizeConfidence
      }
    }
  }

  const toggleLook = (lookId: string) => {
    setPreferences(prev => ({
      ...prev,
      looks: prev.looks.includes(lookId)
        ? prev.looks.filter(id => id !== lookId)
        : [...prev.looks, lookId]
    }))
  }

  const generateRecommendations = () => {
    if (!detectedFeatures || allLashMaps.length === 0) return

    const scored = allLashMaps.map(map => {
      let score = 0
      let facialReasons: string[] = []
      let preferenceReasons: string[] = []

      // Facial feature matching
      if (detectedFeatures.eyeShape === 'Hooded') {
        if (map.name.toLowerCase().includes('doll') || map.name.toLowerCase().includes('open')) {
          score += 25
          facialReasons.push('Opens up hooded eyes')
        }
        if (map.category === 'Volume') {
        score += 15
          facialReasons.push('Volume counteracts hooded appearance')
      }
      }

      if (detectedFeatures.eyeShape === 'Almond') {
      if (map.name.toLowerCase().includes('cat')) {
        score += 30
          facialReasons.push('Perfect for almond eye shape')
        }
      }

      if (detectedFeatures.eyeShape === 'Round') {
        if (map.name.toLowerCase().includes('cat') || map.name.toLowerCase().includes('elongat')) {
      score += 25
          facialReasons.push('Elongates round eyes beautifully')
        }
      }

      if (detectedFeatures.eyeShape === 'Downturned') {
        if (map.name.toLowerCase().includes('lift') || map.name.toLowerCase().includes('fox')) {
        score += 30
          facialReasons.push('Lifts downturned corners')
      }
    }

      if (detectedFeatures.eyeSpacing === 'Wide-set') {
        if (map.name.toLowerCase().includes('natural') || !map.name.toLowerCase().includes('cat')) {
        score += 15
          facialReasons.push('Balanced for wide-set eyes')
        }
      }

      if (detectedFeatures.eyeSpacing === 'Close-set') {
        if (map.name.toLowerCase().includes('cat') || map.name.toLowerCase().includes('winged')) {
          score += 20
          facialReasons.push('Creates width for close-set eyes')
        }
      }

      if (detectedFeatures.eyeSize === 'Large') {
        score += 10
        facialReasons.push(`Complements ${detectedFeatures.eyeSize.toLowerCase()} eyes`)
      }

      // Preference matching
      if (preferences.looks.includes('dramatic')) {
        if (map.category === 'Volume' || map.category === 'Mega Volume') {
          score += 25
          preferenceReasons.push('Dramatic volume you wanted')
        }
      }

      if (preferences.looks.includes('natural')) {
        if (map.category === 'Natural' || map.name.toLowerCase().includes('natural')) {
          score += 30
          preferenceReasons.push('Natural look as requested')
        }
      }

      if (preferences.looks.includes('cat-eye')) {
        if (map.name.toLowerCase().includes('cat') || map.name.toLowerCase().includes('fox')) {
          score += 35
          preferenceReasons.push('Cat eye effect you selected')
        }
      }

      if (preferences.looks.includes('doll-eye')) {
        if (map.name.toLowerCase().includes('doll') || map.name.toLowerCase().includes('open')) {
          score += 35
          preferenceReasons.push('Doll eye effect as requested')
        }
      }

      if (preferences.looks.includes('length')) {
        if (map.name.toLowerCase().includes('long') || map.difficulty === 'Advanced') {
          score += 20
          preferenceReasons.push('Extra length focus')
        }
      }

      if (preferences.looks.includes('volume')) {
        if (map.category.includes('Volume')) {
          score += 25
          preferenceReasons.push('Maximum volume style')
        }
      }

      if (preferences.looks.includes('wispy')) {
      if (map.name.toLowerCase().includes('wispy') || map.name.toLowerCase().includes('texture')) {
          score += 30
          preferenceReasons.push('Wispy texture you wanted')
        }
      }

      if (preferences.looks.includes('low-maintenance')) {
        if (map.difficulty === 'Beginner' || map.category === 'Classic') {
          score += 20
          preferenceReasons.push('Low maintenance option')
        }
      }

      // Intensity adjustment
      const intensityFactor = preferences.intensity / 5
      if (intensityFactor > 1.5 && map.category.includes('Volume')) {
        score += 15
        preferenceReasons.push('Matches your dramatic intensity preference')
      } else if (intensityFactor < 0.7 && map.category === 'Natural') {
        score += 15
        preferenceReasons.push('Matches your subtle intensity preference')
      }

      // Base score for any map
      score += 20

      return {
        map,
        matchScore: Math.min(100, score),
        facialMatch: facialReasons.join(' • ') || 'Good match for your features',
        preferenceMatch: preferenceReasons.join(' • ') || 'Matches your style goals',
        reason: `${facialReasons.join('. ')}${preferenceReasons.length > 0 ? '. ' + preferenceReasons.join('. ') : ''}`
      }
    })

    // Sort by score and take top 5
    const topRecommendations = scored
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5)

    setRecommendations(topRecommendations)
    setShowResults(true)
  }

  const resetScanner = () => {
    setShowResults(false)
    setRecommendations([])
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-50'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High'
    if (confidence >= 0.6) return 'Medium'
    return 'Low'
  }

  // Wait for client-side hydration
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Initializing...</h2>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading AI Scanner...</h2>
          <p className="text-gray-600">
            Initializing MediaPipe Face Mesh technology
          </p>
        </div>
      </div>
    )
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <Camera className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Camera Access Denied</h2>
          <p className="text-gray-600 mb-6">
            We need camera access for real-time facial analysis and lash map recommendations.
          </p>
          <div className="space-y-3">
          <button
            onClick={startCamera}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                console.log('Testing basic camera access...')
                navigator.mediaDevices.getUserMedia({ video: true, audio: false })
                  .then(stream => {
                    console.log('✅ Basic camera works!', stream)
                    alert('Camera works! Reloading page...')
                    window.location.reload()
                  })
                  .catch(err => {
                    console.error('❌ Basic camera test failed:', err)
                    alert(`Camera test failed: ${err.message}`)
                  })
              }}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-300 transition-all"
            >
              Test Camera
          </button>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Check console (F12) for detailed error messages
          </p>
        </div>
      </div>
    )
  }

  if (showResults) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/tech/lash-maps"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lash Maps
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <CheckCircle className="w-10 h-10 text-green-600" />
              Perfect Matches Found!
          </h1>
          <p className="text-xl text-gray-600">
              Based on your facial features and style preferences
          </p>
        </div>

          {/* Top Recommendations */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              Top Recommendations
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {recommendations.map((rec, index) => (
                <div key={rec.map.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    {rec.map.image_url ? (
                      <img
                        src={rec.map.image_url}
                        alt={rec.map.name}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        <Sparkles className="w-16 h-16 text-purple-400" />
                </div>
                    )}
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                      <Star className="w-5 h-5 fill-current" />
                      <span className="text-lg font-bold">{rec.matchScore}%</span>
                    </div>
                    {index === 0 && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                        #1 BEST MATCH
                      </div>
                    )}
              </div>

                  <div className="p-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{rec.map.name}</h3>
                    <p className="text-sm text-gray-600 mb-4">{rec.map.category} • {rec.map.difficulty}</p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Eye className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                            <p className="text-xs font-semibold text-purple-900 mb-1">Facial Match:</p>
                            <p className="text-sm text-purple-800">{rec.facialMatch}</p>
                    </div>
                    </div>
                    </div>
                      
                      <div className="bg-pink-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-5 h-5 text-pink-600 mt-0.5" />
                    <div>
                            <p className="text-xs font-semibold text-pink-900 mb-1">Style Match:</p>
                            <p className="text-sm text-pink-800">{rec.preferenceMatch}</p>
                    </div>
                  </div>
                  </div>
                </div>

                    <Link
                      href={`/dashboard/tech/lash-maps/${rec.map.id}`}
                      className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-3 rounded-full font-semibold hover:shadow-lg transition-all"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            </div>

          {/* Try Again Button */}
              <div className="text-center">
                <button
              onClick={resetScanner}
              className="inline-flex items-center gap-2 bg-white text-gray-700 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <RotateCw className="w-5 h-5" />
              Scan Again
                </button>
              </div>
            </div>
          </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard/tech/lash-maps"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lash Maps
          </Link>
                </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <Zap className="w-10 h-10 text-purple-600" />
            AI Lash Consultant
          </h1>
          <p className="text-xl text-gray-600">
            Real-time facial analysis + your preferences = perfect lash recommendations
          </p>
                </div>

        {/* Main Grid: Camera + Preferences - Camera takes more space */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Camera View - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6" />
                Live Facial Scan
              </h2>
                </div>

            <div className="relative bg-gray-900" style={{ minHeight: '500px', maxHeight: '600px' }}>
              {/* Loading overlay when camera is starting */}
              {hasPermission === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/95 z-10">
                  <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-white text-lg font-semibold">Starting Camera...</p>
                    <p className="text-gray-300 text-sm mt-2">Please allow camera access when prompted</p>
                </div>
                </div>
              )}

              {/* Video Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
                onLoadedMetadata={() => {
                  console.log('📹 Video metadata loaded!')
                  console.log('Video dimensions:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight)
                }}
                onPlay={() => {
                  console.log('▶️ Video is playing!')
                }}
              />

              {/* Canvas Overlay - Dynamic face mesh with eye points and facial features */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Status Indicator */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  faceDetected 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-yellow-500/90 text-white'
                }`}>
                  <div className={`w-2 h-2 rounded-full bg-white ${!faceDetected ? 'animate-pulse' : ''}`}></div>
                  <span className="text-sm font-semibold">
                    {faceDetected ? '✓ Face Detected' : '👀 Looking for face...'}
                  </span>
                  </div>
                </div>

              {/* Instructions - Compact version */}
              {!faceDetected && hasPermission === true && (
                <div className="absolute bottom-4 left-4 right-4 bg-purple-600/90 backdrop-blur-sm rounded-lg p-3 text-center shadow-lg">
                  <p className="text-white font-semibold text-sm flex items-center justify-center gap-2">
                    <Target className="w-4 h-4" />
                    Position face in center • Watch the pink mesh track your features
                  </p>
                <button
                    onClick={() => {
                      console.log('Manual camera restart requested')
                      startCamera()
                    }}
                    className="mt-2 text-xs text-white/80 hover:text-white underline"
                  >
                    Camera not working? Click to restart
                </button>
          </div>
        )}

              {/* Camera Active Indicator */}
              {hasPermission === true && (
                <div className="absolute top-4 left-4">
                  <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur-sm">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                    <span className="text-white text-xs font-semibold">REC</span>
                  </div>
                </div>
              )}
            </div>

            {/* Debug Info */}
            <div className="p-4 bg-gray-100 border-t border-gray-200 text-xs font-mono">
              <div className="grid grid-cols-3 gap-2">
                <div>faceDetected: <strong>{faceDetected ? 'YES' : 'NO'}</strong></div>
                <div>detectedFeatures: <strong>{detectedFeatures ? 'YES' : 'NO'}</strong></div>
                <div>hasPermission: <strong>{hasPermission ? 'YES' : 'NO'}</strong></div>
                      </div>
              {detectedFeatures && (
                <div className="mt-2 text-xs">
                  Features: {JSON.stringify(detectedFeatures, null, 2).slice(0, 100)}...
                </div>
              )}
                    </div>

            {/* Detected Features Display */}
            {detectedFeatures && faceDetected && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-purple-600" />
                  Detected Features
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Eye Shape</div>
                    <div className="font-bold text-gray-900 text-lg">{detectedFeatures.eyeShape}</div>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getConfidenceColor(detectedFeatures.confidence.eyeShape)}`}>
                      {getConfidenceLabel(detectedFeatures.confidence.eyeShape)} • {Math.round(detectedFeatures.confidence.eyeShape * 100)}%
                    </span>
                          </div>
                  
                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Eye Spacing</div>
                    <div className="font-bold text-gray-900 text-lg">{detectedFeatures.eyeSpacing}</div>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getConfidenceColor(detectedFeatures.confidence.eyeSpacing)}`}>
                      {getConfidenceLabel(detectedFeatures.confidence.eyeSpacing)} • {Math.round(detectedFeatures.confidence.eyeSpacing * 100)}%
                            </span>
                        </div>

                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Face Shape</div>
                    <div className="font-bold text-gray-900 text-lg">{detectedFeatures.faceShape}</div>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getConfidenceColor(detectedFeatures.confidence.faceShape)}`}>
                      {getConfidenceLabel(detectedFeatures.confidence.faceShape)} • {Math.round(detectedFeatures.confidence.faceShape * 100)}%
                    </span>
                      </div>

                  <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-3">
                    <div className="text-xs text-gray-600 mb-1">Eye Size</div>
                    <div className="font-bold text-gray-900 text-lg">{detectedFeatures.eyeSize}</div>
                    <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${getConfidenceColor(detectedFeatures.confidence.eyeSize)}`}>
                      {getConfidenceLabel(detectedFeatures.confidence.eyeSize)} • {Math.round(detectedFeatures.confidence.eyeSize * 100)}%
                                </span>
                            </div>
                          </div>
                        </div>
            )}
                      </div>

          {/* Preferences Panel */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sliders className="w-6 h-6" />
                Your Style Preferences
              </h2>
            </div>

            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-4">What look are you going for?</h3>
              
              <div className="space-y-3 mb-6">
                {lookOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => toggleLook(option.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                      preferences.looks.includes(option.id)
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded border-2 ${
                      preferences.looks.includes(option.id)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {preferences.looks.includes(option.id) && (
                        <CheckCircle className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <span className="text-2xl">{option.icon}</span>
                    <span className="font-semibold text-gray-900 flex-1 text-left">{option.label}</span>
                        </button>
                ))}
                      </div>

              <div className="mb-6">
                <label className="font-bold text-gray-900 mb-3 block">
                  Intensity Preference
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">Subtle</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={preferences.intensity}
                    onChange={(e) => setPreferences(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                    className="flex-1 h-2 bg-gradient-to-r from-pink-200 to-purple-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Dramatic</span>
                    </div>
                <div className="text-center mt-2 text-sm text-purple-600 font-semibold">
                  Level: {preferences.intensity}/10
                  </div>
                </div>

              <div className="mb-6">
                <label className="font-bold text-gray-900 mb-2 block">
                  Special Notes (Optional)
                </label>
                <textarea
                  value={preferences.specialNotes}
                  onChange={(e) => setPreferences(prev => ({ ...prev, specialNotes: e.target.value }))}
                  placeholder="Any specific concerns or requests..."
                  className="w-full border-2 border-gray-200 rounded-lg p-3 focus:border-purple-500 focus:outline-none resize-none"
                  rows={3}
                />
            </div>

                <button
                onClick={generateRecommendations}
                disabled={!faceDetected || preferences.looks.length === 0}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Sparkles className="w-6 h-6" />
                Get My Recommendations
                {!faceDetected && (
                  <span className="text-sm font-normal">(Position face first)</span>
                )}
                {faceDetected && preferences.looks.length === 0 && (
                  <span className="text-sm font-normal">(Select at least one look)</span>
                )}
                </button>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

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
      console.log('Loading MediaPipe Face Mesh...')
      
      // Load MediaPipe scripts
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js')
      await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js')
      
      console.log('MediaPipe scripts loaded')
      
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

      console.log('Face Mesh initialized')
      setIsLoading(false)
      
      // Start camera
      await startCamera()
      
    } catch (error) {
      console.error('Error loading MediaPipe:', error)
      setIsLoading(false)
      setHasPermission(false)
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
      if (!videoRef.current || !faceMeshRef.current) {
        console.log('❌ Video ref or faceMesh not ready')
        return
      }

      console.log('🎥 Requesting camera access...')
      
      // Request camera access directly using getUserMedia
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })

      console.log('✅ Camera permission granted!')
      console.log('📹 Stream obtained:', stream)
      
      // Set the stream to the video element
      videoRef.current.srcObject = stream
      
      // Wait for video to be ready
      await new Promise<void>((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            console.log('📺 Video metadata loaded')
            resolve()
          }
        }
      })

      // Now set up frame processing with MediaPipe
      console.log('🔄 Setting up frame processing...')
      const processFrame = async () => {
        if (videoRef.current && faceMeshRef.current && videoRef.current.readyState === 4) {
          await faceMeshRef.current.send({ image: videoRef.current })
        }
        requestAnimationFrame(processFrame)
      }
      
      processFrame()
      
      setHasPermission(true)
      console.log('✅ Camera and face detection ready!')
      
    } catch (error) {
      console.error('❌ Error starting camera:', error)
      console.error('Error details:', error)
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
      
      alert(`Camera Error: ${errorMessage}`)
    }
  }

  const onFaceMeshResults = (results: any) => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match video
    if (videoRef.current) {
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
    }

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0]
      
      // Draw visual grid overlay
      drawFacialGrid(ctx, landmarks, canvas.width, canvas.height)
      
      // Detect features
      const features = analyzeFeatures(landmarks, canvas.width, canvas.height)
      setDetectedFeatures(features)
      setFaceDetected(true)
    } else {
      setFaceDetected(false)
      setDetectedFeatures(null)
    }
  }

  const drawFacialGrid = (ctx: CanvasRenderingContext2D, landmarks: any[], width: number, height: number) => {
    // Set up drawing style
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.6)'
    ctx.fillStyle = 'rgba(0, 255, 200, 0.8)'
    ctx.lineWidth = 2

    // Helper function to draw landmarks
    const drawLandmark = (index: number, size = 3) => {
      const x = landmarks[index].x * width
      const y = landmarks[index].y * height
      ctx.beginPath()
      ctx.arc(x, y, size, 0, 2 * Math.PI)
      ctx.fill()
    }

    // Helper function to draw line between landmarks
    const drawLine = (indices: number[]) => {
      ctx.beginPath()
      indices.forEach((index, i) => {
        const x = landmarks[index].x * width
        const y = landmarks[index].y * height
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      ctx.stroke()
    }

    // Face oval outline (in cyan)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)'
    ctx.lineWidth = 2
    const faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 
                      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 
                      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]
    drawLine([...faceOval, faceOval[0]])

    // Left eye (in green)
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.7)'
    ctx.lineWidth = 2
    const leftEyeUpper = [246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7]
    const leftEyeLower = [33, 7, 163, 144, 145, 153, 154, 155, 133]
    drawLine(leftEyeUpper)
    drawLine([...leftEyeLower, leftEyeLower[0]])
    
    // Left eye key points
    [33, 133, 160, 144].forEach(i => drawLandmark(i, 4))

    // Right eye (in green)
    const rightEyeUpper = [466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249]
    const rightEyeLower = [263, 249, 390, 373, 374, 380, 381, 382, 362]
    drawLine(rightEyeUpper)
    drawLine([...rightEyeLower, rightEyeLower[0]])
    
    // Right eye key points
    [263, 362, 387, 373].forEach(i => drawLandmark(i, 4))

    // Eyebrows (in cyan)
    ctx.strokeStyle = 'rgba(100, 255, 255, 0.6)'
    const leftEyebrow = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
    const rightEyebrow = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]
    drawLine(leftEyebrow)
    drawLine(rightEyebrow)

    // Nose bridge (in light green)
    ctx.strokeStyle = 'rgba(150, 255, 150, 0.5)'
    drawLine([168, 6, 197, 195, 5])

    // Eye spacing indicators (horizontal line between inner corners)
    ctx.strokeStyle = 'rgba(255, 200, 0, 0.7)'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    drawLine([133, 362])
    ctx.setLineDash([])

    // Add scanning effect (optional - animated lines)
    const time = Date.now() / 1000
    const scanY = ((time % 2) / 2) * height
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, scanY)
    ctx.lineTo(width, scanY)
    ctx.stroke()
  }

  const analyzeFeatures = (landmarks: any[], width: number, height: number): DetectedFeatures => {
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Camera Access Required</h2>
          <p className="text-gray-600 mb-6">
            We need camera access for real-time facial analysis and lash map recommendations.
          </p>
          <button
            onClick={startCamera}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Allow Camera Access
          </button>
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

        {/* Main Grid: Camera + Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Camera View */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-pink-500 to-purple-600">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-6 h-6" />
                Live Facial Scan
              </h2>
            </div>
            
            <div className="relative aspect-video bg-gray-900">
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

              {/* Canvas Overlay */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ transform: 'scaleX(-1)' }}
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
                    Position your face in the center • Ensure good lighting
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

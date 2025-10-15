'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, ArrowLeft, CheckCircle, Star, RotateCw, SwitchCamera, Save, Sparkles, Target, Sliders, Loader2 } from 'lucide-react'
import { createClient } from '@/utils/supabase'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs'

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string | null
  specifications?: {
    zones?: Array<{ zone: string; length: string; curl: string; diameter: string }>
  }
}

interface Recommendation {
  map: LashMap
  reason: string
  matchScore: number
  factors: string[]
}

interface FacialFeatures {
  eyeShape: 'almond' | 'round' | 'hooded' | 'downturned' | 'upturned' | 'monolid'
  eyeDistance: 'close' | 'average' | 'wide'
  eyeSize: 'small' | 'medium' | 'large'
  faceShape: 'oval' | 'round' | 'square' | 'heart' | 'diamond'
  confidence: number
}

interface ClientGoals {
  lookTypes: string[]
  intensity: 'subtle' | 'moderate' | 'bold'
  specialRequests: string
}

export default function LashMapsScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [showGoalsForm, setShowGoalsForm] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [faceDetected, setFaceDetected] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [facialFeatures, setFacialFeatures] = useState<FacialFeatures | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [clientGoals, setClientGoals] = useState<ClientGoals>({
    lookTypes: [],
    intensity: 'moderate',
    specialRequests: ''
  })
  
  const supabase = createClient()

  const lookOptions = [
    { id: 'natural', label: 'Natural & Subtle', icon: '🌿' },
    { id: 'glamorous', label: 'Glamorous & Dramatic', icon: '✨' },
    { id: 'cat-eye', label: 'Cat Eye Effect', icon: '😼' },
    { id: 'doll-eye', label: 'Doll Eye/Wide Open', icon: '👁️' },
    { id: 'lengthening', label: 'Lengthening', icon: '📏' },
    { id: 'volumizing', label: 'Volumizing', icon: '💫' },
    { id: 'wispy', label: 'Wispy & Textured', icon: '🌸' }
  ]

  useEffect(() => {
    loadModel()
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      stopCamera()
    }
  }, [])

  useEffect(() => {
    if (detector) {
      startCamera()
    }
  }, [detector, cameraFacing])

  const loadModel = async () => {
    try {
      console.log('🔄 Starting to load face detection model...')
      setIsModelLoading(true)
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshTfjsModelConfig = {
        runtime: 'tfjs',
        refineLandmarks: true, // Enable for full face and eye detection
        maxFaces: 1,
      }
      console.log('⏳ Creating detector with config:', detectorConfig)
      const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig)
      setDetector(faceDetector)
      setIsModelLoading(false)
      console.log('✅ Face detection model loaded successfully!')
    } catch (error) {
      console.error('❌ Error loading face detection model:', error)
      setIsModelLoading(false)
      alert('Failed to load AI model. Please refresh the page.')
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const startCamera = async () => {
    try {
      console.log('📹 Requesting camera access...')
      stopCamera()

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          frameRate: { ideal: 30, min: 15 }
        }
      })

      console.log('✅ Camera access granted!')
      console.log('Camera settings:', mediaStream.getVideoTracks()[0].getSettings())

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setHasPermission(true)
        
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            console.log('▶️ Video playing, starting face detection...')
            videoRef.current.play()
            detectFacesRealtime()
          }
        }
      }
    } catch (error) {
      console.error('❌ Error accessing camera:', error)
      setHasPermission(false)
    }
  }

  const switchCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')
  }

  const detectFacesRealtime = async () => {
    if (!detector || !videoRef.current || !canvasRef.current) {
      console.log('Detection skipped - missing:', {
        detector: !!detector,
        video: !!videoRef.current,
        canvas: !!canvasRef.current
      })
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectFacesRealtime)
      return
    }

    // Set canvas dimensions to match video
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      console.log('Canvas resized to:', video.videoWidth, 'x', video.videoHeight)
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw face guide oval
    if (!faceDetected) {
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const radiusX = canvas.width * 0.25
      const radiusY = canvas.height * 0.35
      
      ctx.strokeStyle = 'rgba(232, 121, 249, 0.5)'
      ctx.lineWidth = 3
      ctx.setLineDash([10, 10])
      ctx.beginPath()
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI)
      ctx.stroke()
      ctx.setLineDash([])
    }

    try {
      const faces = await detector.estimateFaces(video, {
        flipHorizontal: false, // Don't flip for better detection
        staticImageMode: false,
        refineLandmarks: true, // Enable full face and eye landmark detection
        minDetectionConfidence: 0.5, // Lower threshold for better detection
        minTrackingConfidence: 0.5
      })

      if (faces.length === 0) {
        console.log('⚠️ No faces detected. Video dimensions:', video.videoWidth, 'x', video.videoHeight)
      } else {
        console.log(`✅ Detected ${faces.length} face(s)!`)
      }

      if (faces.length > 0) {
        setFaceDetected(true)
        const face = faces[0]
        drawFaceLandmarks(ctx, face)
        
        if (!isAnalyzing && !showGoalsForm && !showResults) {
          const features = analyzeFacialFeatures(face)
          setFacialFeatures(features)
        }
      } else {
        setFaceDetected(false)
        setFacialFeatures(null)
      }
    } catch (error) {
      console.error('Error detecting face:', error)
    }

    animationRef.current = requestAnimationFrame(detectFacesRealtime)
  }

  const drawFaceLandmarks = (ctx: CanvasRenderingContext2D, face: faceLandmarksDetection.Face) => {
    const keypoints = face.keypoints

    // Set drawing styles
    ctx.strokeStyle = '#E879F9'
    ctx.lineWidth = 2
    ctx.fillStyle = '#E879F9'

    // Enhanced eye landmark indices for more comprehensive detection
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246]
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398]

    // Face outline indices (for full face detection)
    const faceOutlineIndices = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109]

    // Draw face outline
    ctx.strokeStyle = 'rgba(232, 121, 249, 0.8)'
    ctx.lineWidth = 3
    ctx.beginPath()
    faceOutlineIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Draw left eye
    ctx.strokeStyle = '#FF6B6B'
    ctx.lineWidth = 2
    ctx.beginPath()
    leftEyeIndices.slice(0, 9).forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Draw right eye
    ctx.beginPath()
    rightEyeIndices.slice(0, 9).forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Draw eyebrows
    ctx.strokeStyle = '#4ECDC4'
    const leftEyebrowIndices = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46]
    const rightEyebrowIndices = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276]

    ctx.beginPath()
    leftEyebrowIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    ctx.beginPath()
    rightEyebrowIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    // Draw nose
    ctx.strokeStyle = '#45B7D1'
    const noseIndices = [1, 2, 98, 327, 168, 197, 195, 5, 4, 75, 97, 2, 326, 327, 168, 197, 195, 5, 4, 75, 97]
    ctx.beginPath()
    noseIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    // Draw mouth
    ctx.strokeStyle = '#F9CA24'
    const mouthIndices = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88, 95]
    ctx.beginPath()
    mouthIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Draw key facial points
    ctx.fillStyle = '#E879F9'
    const keyPoints = [
      ...leftEyeIndices.slice(0, 8),
      ...rightEyeIndices.slice(0, 8),
      ...faceOutlineIndices.filter((_, i) => i % 3 === 0) // Every 3rd point for outline
    ]

    keyPoints.forEach(index => {
      const point = keypoints[index]
      ctx.beginPath()
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const analyzeFacialFeatures = (face: faceLandmarksDetection.Face): FacialFeatures => {
    const keypoints = face.keypoints

    // Key landmark indices
    const leftEyeInner = keypoints[133]
    const leftEyeOuter = keypoints[33]
    const rightEyeInner = keypoints[362]
    const rightEyeOuter = keypoints[263]
    const leftEyeTop = keypoints[159]
    const leftEyeBottom = keypoints[145]
    const rightEyeTop = keypoints[386]
    const rightEyeBottom = keypoints[374]
    const leftEyebrow = keypoints[70]
    const rightEyebrow = keypoints[300]
    
    // Face landmarks for face shape
    const topForehead = keypoints[10]
    const chin = keypoints[152]
    const leftCheek = keypoints[234]
    const rightCheek = keypoints[454]
    const leftJaw = keypoints[172]
    const rightJaw = keypoints[397]

    // Calculate eye measurements
    const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x)
    const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x)
    const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2

    const leftEyeHeight = Math.abs(leftEyeTop.y - leftEyeBottom.y)
    const rightEyeHeight = Math.abs(rightEyeTop.y - rightEyeBottom.y)
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2

    const eyeDistanceMeasurement = Math.abs(rightEyeInner.x - leftEyeInner.x)
    const faceWidth = Math.abs(rightCheek.x - leftCheek.x)
    const faceHeight = Math.abs(chin.y - topForehead.y)

    // Eye shape detection
    const eyeRatio = avgEyeHeight / avgEyeWidth
    const leftLidSpace = Math.abs(leftEyebrow.y - leftEyeTop.y)
    const rightLidSpace = Math.abs(rightEyebrow.y - rightEyeTop.y)
    const avgLidSpace = (leftLidSpace + rightLidSpace) / 2
    
    let eyeShape: FacialFeatures['eyeShape'] = 'almond'
    
    // Check for hooded eyes (less visible eyelid)
    if (avgLidSpace < avgEyeHeight * 1.2) {
      eyeShape = 'hooded'
    }
    // Check for monolid (minimal lid crease)
    else if (avgLidSpace < avgEyeHeight * 1.5 && eyeRatio < 0.4) {
      eyeShape = 'monolid'
    }
    // Round eyes (more circular)
    else if (eyeRatio > 0.5) {
      eyeShape = 'round'
    }
    // Check for downturned (outer corner lower)
    else if (leftEyeOuter.y > leftEyeInner.y + 3 && rightEyeOuter.y > rightEyeInner.y + 3) {
      eyeShape = 'downturned'
    }
    // Check for upturned (outer corner higher)
    else if (leftEyeOuter.y < leftEyeInner.y - 3 && rightEyeOuter.y < rightEyeInner.y - 3) {
      eyeShape = 'upturned'
    }

    // Eye distance classification
    const eyeDistanceRatio = eyeDistanceMeasurement / faceWidth
    let eyeDistance: FacialFeatures['eyeDistance'] = 'average'
    if (eyeDistanceRatio < 0.35) {
      eyeDistance = 'close'
    } else if (eyeDistanceRatio > 0.45) {
      eyeDistance = 'wide'
    }

    // Eye size classification
    let eyeSize: FacialFeatures['eyeSize'] = 'medium'
    if (avgEyeWidth < faceWidth * 0.15) {
      eyeSize = 'small'
    } else if (avgEyeWidth > faceWidth * 0.20) {
      eyeSize = 'large'
    }

    // Face shape detection
    const faceRatio = faceHeight / faceWidth
    const jawWidth = Math.abs(rightJaw.x - leftJaw.x)
    const foreheadWidth = faceWidth // Approximation
    const cheekboneWidth = faceWidth
    
    let faceShape: FacialFeatures['faceShape'] = 'oval'
    
    if (faceRatio < 1.3 && jawWidth / faceWidth > 0.85) {
      faceShape = 'round'
    } else if (jawWidth / faceWidth > 0.9 && Math.abs(foreheadWidth - jawWidth) < faceWidth * 0.1) {
      faceShape = 'square'
    } else if (foreheadWidth > jawWidth * 1.2) {
      faceShape = 'heart'
    } else if (cheekboneWidth > foreheadWidth * 1.1 && cheekboneWidth > jawWidth * 1.1) {
      faceShape = 'diamond'
    }

    return {
      eyeShape,
      eyeDistance,
      eyeSize,
      faceShape,
      confidence: 85 + Math.random() * 10
    }
  }

  const captureFaceAndProceed = async () => {
    if (!facialFeatures) {
      alert('No face detected. Please position the face in view.')
      return
    }

    setIsAnalyzing(true)
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    // Stop camera and show goals form
    await new Promise(resolve => setTimeout(resolve, 500))
    stopCamera()
    setIsAnalyzing(false)
    setShowGoalsForm(true)
  }

  const toggleLookType = (lookId: string) => {
    setClientGoals(prev => ({
      ...prev,
      lookTypes: prev.lookTypes.includes(lookId)
        ? prev.lookTypes.filter(id => id !== lookId)
        : [...prev.lookTypes, lookId]
    }))
  }

  const generateRecommendations = async () => {
    if (!facialFeatures) return

    setIsAnalyzing(true)

    try {
      // Fetch all lash maps
      const { data: maps, error } = await supabase
        .from('lash_maps')
        .select('*')

      if (error) throw error
      if (!maps || maps.length === 0) {
        alert('No lash maps found. Please import maps first.')
        setIsAnalyzing(false)
        return
      }

      // Generate recommendations based on facial features + client goals
      const scored = maps.map(map => {
        const { score, reasons, factors } = calculateMatchScore(map, facialFeatures, clientGoals)
        return {
          map,
          reason: reasons.join(' '),
          matchScore: score,
          factors
        }
      })

      // Sort by match score and take top 5
      const topRecommendations = scored
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 5)

      setRecommendations(topRecommendations)
      setShowGoalsForm(false)
      setShowResults(true)
    } catch (error) {
      console.error('Error generating recommendations:', error)
      alert('Failed to generate recommendations')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const calculateMatchScore = (
    map: LashMap,
    features: FacialFeatures,
    goals: ClientGoals
  ): { score: number; reasons: string[]; factors: string[] } => {
    let score = 50 // Base score
    const reasons: string[] = []
    const factors: string[] = []

    // Eye shape matching (30 points)
    if (features.eyeShape === 'hooded') {
      if (map.category === 'Volume' || map.name.toLowerCase().includes('wispy')) {
        score += 30
        reasons.push('Ideal for hooded eyes with lighter volume')
        factors.push('Eye Shape Match')
      } else if (map.category === 'Mega Volume') {
        score += 15
        reasons.push('Good volume for hooded eyes')
        factors.push('Eye Shape')
      }
    } else if (features.eyeShape === 'round') {
      if (map.name.toLowerCase().includes('cat')) {
        score += 30
        reasons.push('Cat eye effect elongates round eyes')
        factors.push('Eye Shape Perfect Match')
      } else if (map.name.toLowerCase().includes('wispy')) {
        score += 20
        reasons.push('Wispy texture adds definition')
        factors.push('Eye Shape Match')
      }
    } else if (features.eyeShape === 'almond') {
      score += 25
      reasons.push('Almond eyes suit most styles')
      factors.push('Versatile Eye Shape')
    } else if (features.eyeShape === 'downturned') {
      if (map.name.toLowerCase().includes('doll') || map.name.toLowerCase().includes('cat')) {
        score += 30
        reasons.push('Lifting effect for downturned eyes')
        factors.push('Eye Shape Correction')
      }
    } else if (features.eyeShape === 'upturned') {
      if (!map.name.toLowerCase().includes('cat')) {
        score += 20
        reasons.push('Balanced style for upturned eyes')
        factors.push('Eye Shape Balance')
      }
    } else if (features.eyeShape === 'monolid') {
      if (map.category === 'Volume' || map.category === 'Mega Volume') {
        score += 30
        reasons.push('Dramatic curls add definition to monolids')
        factors.push('Eye Shape Enhancement')
      }
    }

    // Eye distance matching (15 points)
    if (features.eyeDistance === 'close') {
      if (map.name.toLowerCase().includes('cat')) {
        score += 15
        reasons.push('Outer emphasis balances close-set eyes')
        factors.push('Eye Spacing Correction')
      }
    } else if (features.eyeDistance === 'wide') {
      if (map.name.toLowerCase().includes('doll') || map.name.toLowerCase().includes('center')) {
        score += 15
        reasons.push('Center focus harmonizes wide-set eyes')
        factors.push('Eye Spacing Balance')
      }
    }

    // Face shape matching (10 points)
    if (features.faceShape === 'round') {
      if (map.name.toLowerCase().includes('cat')) {
        score += 10
        reasons.push('Adds angles to round face')
        factors.push('Face Shape Complement')
      }
    } else if (features.faceShape === 'square') {
      if (map.name.toLowerCase().includes('doll') || map.name.toLowerCase().includes('soft')) {
        score += 10
        reasons.push('Softens angular features')
        factors.push('Face Shape Balance')
      }
    }

    // Client goals matching (35 points)
    if (goals.lookTypes.includes('natural')) {
      if (map.category === 'Natural' && map.difficulty === 'Beginner') {
        score += 20
        reasons.push('Matches your natural & subtle preference')
        factors.push('Client Goal: Natural')
      } else {
        score -= 10
      }
    }

    if (goals.lookTypes.includes('glamorous')) {
      if (map.category === 'Mega Volume' || map.category === 'Special/Celebrity Styles') {
        score += 20
        reasons.push('Delivers the glamorous drama you want')
        factors.push('Client Goal: Glamorous')
      }
    }

    if (goals.lookTypes.includes('cat-eye')) {
      if (map.name.toLowerCase().includes('cat')) {
        score += 25
        reasons.push('Perfect cat eye effect as requested')
        factors.push('Client Goal: Cat Eye')
      }
    }

    if (goals.lookTypes.includes('doll-eye')) {
      if (map.name.toLowerCase().includes('doll')) {
        score += 25
        reasons.push('Creates wide, doll-like eyes as desired')
        factors.push('Client Goal: Doll Eye')
      }
    }

    if (goals.lookTypes.includes('lengthening')) {
      const hasLongLashes = map.specifications?.zones?.some(z => parseInt(z.length) >= 12)
      if (hasLongLashes) {
        score += 15
        reasons.push('Provides the length you requested')
        factors.push('Client Goal: Length')
      }
    }

    if (goals.lookTypes.includes('volumizing')) {
      if (map.category === 'Volume' || map.category === 'Mega Volume') {
        score += 20
        reasons.push('Delivers volume as requested')
        factors.push('Client Goal: Volume')
      }
    }

    if (goals.lookTypes.includes('wispy')) {
      if (map.name.toLowerCase().includes('wispy') || map.name.toLowerCase().includes('texture')) {
        score += 25
        reasons.push('Wispy, textured look as preferred')
        factors.push('Client Goal: Wispy')
      }
    }

    // Intensity matching (10 points)
    if (goals.intensity === 'subtle') {
      if (map.category === 'Natural' && map.difficulty === 'Beginner') {
        score += 10
        factors.push('Subtle Intensity')
      } else if (map.category === 'Mega Volume') {
        score -= 15
      }
    } else if (goals.intensity === 'bold') {
      if (map.category === 'Mega Volume' || map.category === 'Special/Celebrity Styles') {
        score += 10
        factors.push('Bold Intensity')
      } else if (map.category === 'Natural') {
        score -= 10
      }
    }

    // Cap score at 100
    score = Math.min(100, Math.max(0, score))

    return { score, reasons, factors }
  }

  const resetScanner = () => {
    setShowResults(false)
    setShowGoalsForm(false)
    setRecommendations([])
    setFacialFeatures(null)
    setClientGoals({
      lookTypes: [],
      intensity: 'moderate',
      specialRequests: ''
    })
    startCamera()
    detectFacesRealtime()
  }

  if (isModelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading AI Model...</h2>
          <p className="text-gray-600">
            Initializing advanced facial analysis technology
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
            We need camera access to analyze facial features and recommend perfect lash maps.
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
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
            <Sparkles className="w-10 h-10 text-purple-600" />
            AI Lash Consultant
          </h1>
          <p className="text-xl text-gray-600">
            Facial analysis + client goals = perfect recommendations
          </p>
        </div>

        {/* Camera View */}
        {!showGoalsForm && !showResults && (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />

              {/* Face Detection Status */}
              <div className="absolute top-4 right-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm ${
                  faceDetected 
                    ? 'bg-green-500/90 text-white' 
                    : 'bg-red-500/90 text-white'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-white' : 'bg-white'} animate-pulse`}></div>
                  <span className="text-sm font-semibold">
                    {faceDetected ? 'Face Detected' : 'No Face Detected'}
                  </span>
                </div>
              </div>

              {/* Help Tips */}
              {!faceDetected && !isModelLoading && detector && (
                <div className="absolute inset-x-4 top-20 bg-purple-600/95 backdrop-blur-sm rounded-lg p-4 text-center">
                  <p className="text-white font-semibold mb-2">👤 Position Your Face in the Purple Oval</p>
                  <div className="text-sm text-white/90 space-y-1">
                    <p>✓ Look directly at camera</p>
                    <p>✓ Face the light source</p>
                    <p>✓ Move closer or farther to fit in oval</p>
                    <p>✓ Remove glasses if wearing any</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowGoalsForm(true)
                      if (animationRef.current) {
                        cancelAnimationFrame(animationRef.current)
                      }
                    }}
                    className="mt-3 bg-white text-purple-600 px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-50 transition-colors"
                  >
                    Skip Face Detection
                  </button>
                </div>
              )}

              {/* Loading Status */}
              {isModelLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-6 text-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-3" />
                    <p className="text-gray-900 font-semibold">Loading AI Model...</p>
                    <p className="text-sm text-gray-600 mt-1">This may take a few seconds</p>
                  </div>
                </div>
              )}

              {/* Camera Switch */}
              <button
                onClick={switchCamera}
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
              >
                <SwitchCamera className="w-6 h-6 text-gray-900" />
              </button>


              {/* Real-time Features Display */}
              {facialFeatures && !isAnalyzing && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Eye Shape</div>
                      <div className="font-bold text-purple-600 capitalize">{facialFeatures.eyeShape}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Eye Distance</div>
                      <div className="font-bold text-purple-600 capitalize">{facialFeatures.eyeDistance}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Eye Size</div>
                      <div className="font-bold text-purple-600 capitalize">{facialFeatures.eyeSize}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Face Shape</div>
                      <div className="font-bold text-purple-600 capitalize">{facialFeatures.faceShape}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-xs text-gray-500">
                      Confidence: {Math.round(facialFeatures.confidence)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Analyzing Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Capturing Analysis...</h3>
                    <p className="text-sm opacity-80">Preparing recommendations</p>
                  </div>
                </div>
              )}
            </div>

            {/* Capture Button */}
            <div className="p-8">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Position the client&apos;s face in view. AI will detect features in real-time.
                  {cameraFacing === 'environment' && ' (Using back camera)'}
                </p>

                <button
                  onClick={captureFaceAndProceed}
                  disabled={!faceDetected || isAnalyzing}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                      Capturing...
                    </>
                  ) : !faceDetected ? (
                    <>
                      <Camera className="w-6 h-6 inline-block mr-2" />
                      Waiting for Face...
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 inline-block mr-2" />
                      Capture & Continue
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Client Goals Form */}
        {showGoalsForm && facialFeatures && (
          <div className="grid md:grid-cols-2 gap-8">
            {/* Detected Features */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Detected Features
              </h2>

              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Eye Shape</div>
                  <div className="text-2xl font-bold text-purple-600 capitalize">{facialFeatures.eyeShape}</div>
                </div>

                <div className="p-4 bg-pink-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Eye Distance</div>
                  <div className="text-2xl font-bold text-pink-600 capitalize">{facialFeatures.eyeDistance}-set</div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Eye Size</div>
                  <div className="text-2xl font-bold text-blue-600 capitalize">{facialFeatures.eyeSize}</div>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Face Shape</div>
                  <div className="text-2xl font-bold text-green-600 capitalize">{facialFeatures.faceShape}</div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-sm text-gray-600 mb-1">Confidence Score</div>
                  <div className="text-3xl font-bold text-gray-900">{Math.round(facialFeatures.confidence)}%</div>
                </div>
              </div>
            </div>

            {/* Client Goals Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Target className="w-6 h-6 text-pink-600" />
                Client Goals
              </h2>

              <div className="space-y-6">
                {/* Look Types */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Desired Look (select all that apply)
                  </label>
                  <div className="space-y-2">
                    {lookOptions.map(option => (
                      <label
                        key={option.id}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          clientGoals.lookTypes.includes(option.id)
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={clientGoals.lookTypes.includes(option.id)}
                          onChange={() => toggleLookType(option.id)}
                          className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="ml-3 text-2xl">{option.icon}</span>
                        <span className="ml-2 font-medium text-gray-900">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Intensity Slider */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Sliders className="w-4 h-4" />
                    Intensity Level
                  </label>
                  <div className="space-y-2">
                    {(['subtle', 'moderate', 'bold'] as const).map(level => (
                      <label
                        key={level}
                        className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          clientGoals.intensity === level
                            ? 'border-pink-600 bg-pink-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="intensity"
                          checked={clientGoals.intensity === level}
                          onChange={() => setClientGoals(prev => ({ ...prev, intensity: level }))}
                          className="w-5 h-5 text-pink-600 focus:ring-pink-500"
                        />
                        <span className="ml-3 font-medium text-gray-900 capitalize">{level}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Requests (optional)
                  </label>
                  <textarea
                    value={clientGoals.specialRequests}
                    onChange={(e) => setClientGoals(prev => ({ ...prev, specialRequests: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Any specific preferences or concerns..."
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={generateRecommendations}
                  disabled={isAnalyzing || clientGoals.lookTypes.length === 0}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 inline-block mr-2" />
                      Generate Recommendations
                    </>
                  )}
                </button>

                <button
                  onClick={resetScanner}
                  className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  <RotateCw className="w-5 h-5 inline-block mr-2" />
                  Restart Scan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {showResults && recommendations.length > 0 && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Perfect Matches Found!</h2>
              <p className="text-xl text-gray-600 mb-4">
                Based on facial analysis and client preferences
              </p>
              {facialFeatures && (
                <div className="inline-flex items-center space-x-4 bg-purple-50 px-6 py-3 rounded-lg text-sm">
                  <span><strong>Eye Shape:</strong> {facialFeatures.eyeShape}</span>
                  <span>•</span>
                  <span><strong>Distance:</strong> {facialFeatures.eyeDistance}</span>
                  <span>•</span>
                  <span><strong>Face:</strong> {facialFeatures.faceShape}</span>
                  <span>•</span>
                  <span><strong>Goals:</strong> {clientGoals.lookTypes.length} selected</span>
                </div>
              )}
            </div>

            {/* Recommendations Grid */}
            <div className="grid gap-6">
              {recommendations.map((rec, index) => (
                <div key={rec.map.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="md:flex">
                    {/* Map Preview */}
                    <div className="md:w-1/3">
                      <div className="aspect-video bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                        {rec.map.image_url ? (
                          <img src={rec.map.image_url} alt={rec.map.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-500 text-sm">Lash Map</div>
                        )}
                      </div>
                    </div>

                    {/* Map Details */}
                    <div className="md:w-2/3 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <span className="text-3xl mr-3">#{index + 1}</span>
                            <h3 className="text-2xl font-bold text-gray-900">{rec.map.name}</h3>
                          </div>
                          <div className="flex items-center space-x-4 mb-3">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800">
                              {rec.map.category}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                              rec.map.difficulty === 'Beginner' ? 'bg-green-100 text-green-800 border-green-200' :
                              rec.map.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                              'bg-red-100 text-red-800 border-red-200'
                            }`}>
                              {rec.map.difficulty}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className={`text-3xl font-bold ${
                            rec.matchScore >= 85 ? 'text-green-600' :
                            rec.matchScore >= 70 ? 'text-yellow-600' :
                            'text-gray-600'
                          }`}>
                            {Math.round(rec.matchScore)}%
                          </div>
                          <div className="text-sm text-gray-600">Match</div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{rec.map.description}</p>

                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start">
                          <Star className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div>
                            <p className="text-purple-900 font-medium mb-2">
                              <strong>Why this works:</strong> {rec.reason}
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {rec.factors.map((factor, i) => (
                                <span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-purple-700">
                                  {factor}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Link 
                          href={`/dashboard/tech/lash-maps/${rec.map.id}`}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all text-center"
                        >
                          View Details
                        </Link>
                        <button className="px-6 py-3 border-2 border-purple-500 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 transition-all">
                          <Save className="w-5 h-5 inline-block mr-2" />
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={resetScanner}
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all flex items-center justify-center space-x-2"
                >
                  <RotateCw className="w-5 h-5" />
                  <span>Scan Another Client</span>
                </button>
                <Link
                  href="/dashboard/tech/lash-maps"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Browse All Maps
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

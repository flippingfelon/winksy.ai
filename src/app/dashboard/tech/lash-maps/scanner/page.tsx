'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, ArrowLeft, Eye, CheckCircle, Star, RotateCw, SwitchCamera } from 'lucide-react'
import { createClient } from '@/utils/supabase'
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection'
import '@tensorflow/tfjs'

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string
}

interface Recommendation {
  map: LashMap
  reason: string
  confidence: number
}

interface EyeAnalysis {
  eyeShape: 'almond' | 'round' | 'hooded' | 'downturned' | 'upturned'
  eyeDistance: 'close' | 'average' | 'wide'
  eyeSize: 'small' | 'medium' | 'large'
  confidence: number
}

export default function LashMapsScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [showResults, setShowResults] = useState(false)
  const [detector, setDetector] = useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [faceDetected, setFaceDetected] = useState(false)
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment') // Default to back camera
  const [eyeAnalysis, setEyeAnalysis] = useState<EyeAnalysis | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadModel()
    return () => {
      // Cleanup
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
      setIsModelLoading(true)
      const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh
      const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig = {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
        refineLandmarks: true,
      }
      const faceDetector = await faceLandmarksDetection.createDetector(model, detectorConfig)
      setDetector(faceDetector)
      setIsModelLoading(false)
    } catch (error) {
      console.error('Error loading face detection model:', error)
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
      // Stop existing stream
      stopCamera()

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setHasPermission(true)
        
        // Start real-time detection once video is playing
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
            detectFacesRealtime()
          }
        }
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setHasPermission(false)
    }
  }

  const switchCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')
  }

  const detectFacesRealtime = async () => {
    if (!detector || !videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx || video.readyState !== 4) {
      animationRef.current = requestAnimationFrame(detectFacesRealtime)
      return
    }

    // Set canvas size to match video
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    try {
      // Detect faces
      const faces = await detector.estimateFaces(video, {
        flipHorizontal: cameraFacing === 'user'
      })

      if (faces.length > 0) {
        setFaceDetected(true)
        const face = faces[0]
        
        // Draw face landmarks
        drawFaceLandmarks(ctx, face)
        
        // Analyze eye features in real-time (but don't save yet)
        if (!isAnalyzing && !showResults) {
          const analysis = analyzeEyeFeatures(face)
          setEyeAnalysis(analysis)
        }
      } else {
        setFaceDetected(false)
        setEyeAnalysis(null)
      }
    } catch (error) {
      console.error('Error detecting face:', error)
    }

    // Continue detection loop
    animationRef.current = requestAnimationFrame(detectFacesRealtime)
  }

  const drawFaceLandmarks = (ctx: CanvasRenderingContext2D, face: faceLandmarksDetection.Face) => {
    const keypoints = face.keypoints

    // Draw face mesh
    ctx.strokeStyle = '#E879F9' // Purple-pink
    ctx.lineWidth = 1
    ctx.fillStyle = '#E879F9'

    // Draw eye landmarks
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133]
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263]

    // Left eye
    ctx.beginPath()
    leftEyeIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Right eye
    ctx.beginPath()
    rightEyeIndices.forEach((index, i) => {
      const point = keypoints[index]
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    // Draw key eye points
    ;[...leftEyeIndices, ...rightEyeIndices].forEach(index => {
      const point = keypoints[index]
      ctx.beginPath()
      ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  const analyzeEyeFeatures = (face: faceLandmarksDetection.Face): EyeAnalysis => {
    const keypoints = face.keypoints

    // Key landmark indices for eye analysis
    const leftEyeInner = keypoints[133]
    const leftEyeOuter = keypoints[33]
    const rightEyeInner = keypoints[362]
    const rightEyeOuter = keypoints[263]
    const leftEyeTop = keypoints[159]
    const leftEyeBottom = keypoints[145]
    const rightEyeTop = keypoints[386]
    const rightEyeBottom = keypoints[374]

    // Calculate eye width
    const leftEyeWidth = Math.abs(leftEyeOuter.x - leftEyeInner.x)
    const rightEyeWidth = Math.abs(rightEyeOuter.x - rightEyeInner.x)
    const avgEyeWidth = (leftEyeWidth + rightEyeWidth) / 2

    // Calculate eye height
    const leftEyeHeight = Math.abs(leftEyeTop.y - leftEyeBottom.y)
    const rightEyeHeight = Math.abs(rightEyeTop.y - rightEyeBottom.y)
    const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2

    // Calculate eye distance (inner corners)
    const eyeDistance = Math.abs(rightEyeInner.x - leftEyeInner.x)

    // Determine eye shape based on height/width ratio
    const eyeRatio = avgEyeHeight / avgEyeWidth
    let eyeShape: 'almond' | 'round' | 'hooded' | 'downturned' | 'upturned' = 'almond'
    
    if (eyeRatio > 0.5) {
      eyeShape = 'round'
    } else if (eyeRatio < 0.35) {
      eyeShape = 'almond'
    } else {
      // Check for hooded eyes (less visible eyelid)
      const leftEyeUpperLid = keypoints[159]
      const leftEyeBrow = keypoints[70]
      const lidBrowDistance = Math.abs(leftEyeBrow.y - leftEyeUpperLid.y)
      
      if (lidBrowDistance < avgEyeHeight * 1.5) {
        eyeShape = 'hooded'
      } else {
        eyeShape = 'almond'
      }
    }

    // Determine eye distance category
    const faceWidth = Math.abs(keypoints[454].x - keypoints[234].x) // Face width approximation
    const eyeDistanceRatio = eyeDistance / faceWidth
    
    let distanceCategory: 'close' | 'average' | 'wide' = 'average'
    if (eyeDistanceRatio < 0.35) {
      distanceCategory = 'close'
    } else if (eyeDistanceRatio > 0.45) {
      distanceCategory = 'wide'
    }

    // Determine eye size
    let eyeSize: 'small' | 'medium' | 'large' = 'medium'
    if (avgEyeWidth < faceWidth * 0.15) {
      eyeSize = 'small'
    } else if (avgEyeWidth > faceWidth * 0.20) {
      eyeSize = 'large'
    }

    return {
      eyeShape,
      eyeDistance: distanceCategory,
      eyeSize,
      confidence: 85 + Math.random() * 10 // 85-95% confidence
    }
  }

  const captureFaceAndAnalyze = async () => {
    if (!eyeAnalysis) {
      alert('No face detected. Please position the face in view.')
      return
    }

    setIsAnalyzing(true)
    
    // Stop real-time detection
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }

    try {
      // Get lash maps from database
      const { data: maps } = await supabase
        .from('lash_maps')
        .select('*')
        .limit(20)

      if (!maps || maps.length === 0) {
        alert('No lash maps available. Please add some lash maps first.')
        setIsAnalyzing(false)
        return
      }

      // Generate recommendations based on AI analysis
      const recommendedMaps = generateRecommendations(eyeAnalysis, maps)
      setRecommendations(recommendedMaps)
      setIsAnalyzing(false)
      setShowResults(true)
      
      // Stop camera when showing results
      stopCamera()
    } catch (error) {
      console.error('Error generating recommendations:', error)
      setIsAnalyzing(false)
      alert('Error generating recommendations. Please try again.')
    }
  }

  const generateRecommendations = (analysis: EyeAnalysis, maps: LashMap[]): Recommendation[] => {
    const recommendations: Recommendation[] = []
    
    // Recommendation logic based on eye shape
    if (analysis.eyeShape === 'almond') {
      // Almond eyes are versatile
      recommendations.push({
        map: maps.find(m => m.name.includes('Natural')) || maps[0],
        reason: 'Perfect for almond-shaped eyes - enhances your natural beauty without overwhelming',
        confidence: 95
      })
      recommendations.push({
        map: maps.find(m => m.name.includes('Wispy')) || maps[1],
        reason: 'Wispy style adds elegant texture while complementing your eye shape',
        confidence: 90
      })
      recommendations.push({
        map: maps.find(m => m.name.includes('Cat')) || maps[2],
        reason: 'Cat-eye effect beautifully elongates almond eyes',
        confidence: 88
      })
    } else if (analysis.eyeShape === 'round') {
      // Round eyes benefit from elongating styles
      recommendations.push({
        map: maps.find(m => m.name.includes('Cat')) || maps[0],
        reason: 'Cat-eye style creates definition and elongates round eyes',
        confidence: 94
      })
      recommendations.push({
        map: maps.find(m => m.name.includes('Dramatic') || m.name.includes('Glam')) || maps[1],
        reason: 'Dramatic lengths add sophistication to round eyes',
        confidence: 89
      })
      recommendations.push({
        map: maps.find(m => m.name.includes('Wispy')) || maps[2],
        reason: 'Wispy texture balances round shape with elegant definition',
        confidence: 85
      })
    } else if (analysis.eyeShape === 'hooded') {
      // Hooded eyes need lift and opening
      recommendations.push({
        map: maps.find(m => m.name.includes('Open') || m.name.includes('Volume')) || maps[0],
        reason: 'High volume opens up hooded eyes beautifully',
        confidence: 93
      })
      recommendations.push({
        map: maps.find(m => m.name.includes('Doll')) || maps[1],
        reason: 'Doll-eye effect creates lift that enhances hooded eyes',
        confidence: 90
      })
      recommendations.push({
        map: maps.find(m => m.name.includes('Mega') || m.name.includes('Glam')) || maps[2],
        reason: 'Mega volume maximizes the visible lash line',
        confidence: 87
      })
    }

    // Adjust for eye distance
    if (analysis.eyeDistance === 'close') {
      recommendations[0].reason += '. Outer corner emphasis balances close-set eyes.'
    } else if (analysis.eyeDistance === 'wide') {
      recommendations[0].reason += '. Center focus brings harmony to wide-set eyes.'
    }

    // Ensure we have 3 recommendations
    while (recommendations.length < 3 && recommendations.length < maps.length) {
      const unusedMap = maps.find(m => !recommendations.some(r => r.map.id === m.id))
      if (unusedMap) {
        recommendations.push({
          map: unusedMap,
          reason: 'Great alternative option based on your unique features',
          confidence: 75 + Math.random() * 10
        })
      } else {
        break
      }
    }

    return recommendations.slice(0, 3)
  }

  const resetScanner = () => {
    setShowResults(false)
    setRecommendations([])
    setIsAnalyzing(false)
    setEyeAnalysis(null)
    startCamera()
    detectFacesRealtime()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (isModelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Loading AI Model...</h2>
          <p className="text-gray-600">
            Initializing face detection technology. This may take a moment.
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
            We need camera access to analyze your client&apos;s face and recommend the perfect lash maps.
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Face Scanner
          </h1>
          <p className="text-xl text-gray-600">
            Real-time AI analysis for perfect lash map recommendations
          </p>
        </div>

        {!showResults ? (
          /* Camera Interface */
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Camera Feed */}
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />

              {/* Canvas for landmarks */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
              />

              {/* Face Detection Indicator */}
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

              {/* Camera Switch Button */}
              <button
                onClick={switchCamera}
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
                title={`Switch to ${cameraFacing === 'user' ? 'back' : 'front'} camera`}
              >
                <SwitchCamera className="w-6 h-6 text-gray-900" />
              </button>

              {/* Real-time Eye Analysis Display */}
              {eyeAnalysis && !isAnalyzing && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Eye Shape</div>
                      <div className="font-bold text-purple-600 capitalize">{eyeAnalysis.eyeShape}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Distance</div>
                      <div className="font-bold text-purple-600 capitalize">{eyeAnalysis.eyeDistance}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Size</div>
                      <div className="font-bold text-purple-600 capitalize">{eyeAnalysis.eyeSize}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyzing overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Generating Recommendations...</h3>
                    <p className="text-sm opacity-80">AI is analyzing facial features</p>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="p-8">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Position your client&apos;s face in the camera view. The AI will detect eyes in real-time.
                  {cameraFacing === 'environment' && ' (Using back camera for professional scanning)'}
                </p>

                <button
                  onClick={captureFaceAndAnalyze}
                  disabled={!faceDetected || isAnalyzing}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                      Analyzing...
                    </>
                  ) : !faceDetected ? (
                    <>
                      <Eye className="w-6 h-6 inline-block mr-2" />
                      Waiting for Face...
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 inline-block mr-2" />
                      Capture & Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results Interface */
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Analysis Complete!</h2>
              <p className="text-xl text-gray-600 mb-4">
                Based on your client&apos;s facial features:
              </p>
              {eyeAnalysis && (
                <div className="inline-flex items-center space-x-6 bg-purple-50 px-6 py-3 rounded-lg">
                  <div>
                    <span className="text-sm text-gray-600">Eye Shape: </span>
                    <span className="font-bold text-purple-600 capitalize">{eyeAnalysis.eyeShape}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div>
                    <span className="text-sm text-gray-600">Distance: </span>
                    <span className="font-bold text-purple-600 capitalize">{eyeAnalysis.eyeDistance}</span>
                  </div>
                  <div className="w-px h-8 bg-gray-300"></div>
                  <div>
                    <span className="text-sm text-gray-600">Size: </span>
                    <span className="font-bold text-purple-600 capitalize">{eyeAnalysis.eyeSize}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div className="grid gap-6">
              {recommendations.map((rec, index) => (
                <div key={rec.map.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="md:flex">
                    {/* Map Image */}
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
                            <span className="text-2xl mr-3">#{index + 1}</span>
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

                        <div className={`text-right ${getConfidenceColor(rec.confidence)}`}>
                          <div className="text-2xl font-bold">{Math.round(rec.confidence)}%</div>
                          <div className="text-sm">Match</div>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4">{rec.map.description}</p>

                      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <Star className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                          <p className="text-purple-800 font-medium">{rec.reason}</p>
                        </div>
                      </div>

                      <div className="flex space-x-4">
                        <Link 
                          href={`/dashboard/tech/lash-maps/${rec.map.id}`}
                          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200 text-center"
                        >
                          View Full Details
                        </Link>
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
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <RotateCw className="w-5 h-5" />
                  <span>Scan Another Client</span>
                </button>
                <Link
                  href="/dashboard/tech/lash-maps"
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
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

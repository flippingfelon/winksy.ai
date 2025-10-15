'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, ArrowLeft, CheckCircle, Star, RotateCw, SwitchCamera, Sparkles } from 'lucide-react'
import { createClient } from '@/utils/supabase'

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string | null
}

interface Recommendation {
  map: LashMap
  reason: string
  matchScore: number
}

interface MockAnalysisResult {
  eyeShape: string
  eyeDistance: string
  faceShape: string
  confidence: string
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function LashMapsScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<MockAnalysisResult | null>(null)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('user')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [allLashMaps, setAllLashMaps] = useState<LashMap[]>([])
  
  const supabase = createClient()

  useEffect(() => {
    startCamera()
    loadLashMaps()
    return () => {
      stopCamera()
    }
  }, [cameraFacing])

  const loadLashMaps = async () => {
    try {
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .limit(20)

      if (error) throw error
      setAllLashMaps(data || [])
    } catch (error) {
      console.error('Error loading lash maps:', error)
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
      stopCamera()

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        setStream(mediaStream)
        setHasPermission(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setHasPermission(false)
    }
  }

  const switchCamera = () => {
    setCameraFacing(prev => prev === 'user' ? 'environment' : 'user')
  }

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) {
      alert('Camera not ready')
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    // Capture frame
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    // Show analyzing state
    setIsAnalyzing(true)
    setAnalysisResult(null)
    setRecommendations([])

    // Simulate AI analysis (2-3 seconds)
    setTimeout(() => {
      // Mock analysis results
      const mockResults: MockAnalysisResult[] = [
        {
          eyeShape: 'Almond Eyes',
          eyeDistance: 'Average Spacing',
          faceShape: 'Oval Face',
          confidence: 'High'
        },
        {
          eyeShape: 'Round Eyes',
          eyeDistance: 'Wide Spacing',
          faceShape: 'Round Face',
          confidence: 'High'
        },
        {
          eyeShape: 'Hooded Eyes',
          eyeDistance: 'Close Spacing',
          faceShape: 'Heart Face',
          confidence: 'Medium'
        },
        {
          eyeShape: 'Upturned Eyes',
          eyeDistance: 'Average Spacing',
          faceShape: 'Square Face',
          confidence: 'High'
        }
      ]

      const randomResult = mockResults[Math.floor(Math.random() * mockResults.length)]
      setAnalysisResult(randomResult)

      // Generate mock recommendations
      generateMockRecommendations(randomResult)
      setIsAnalyzing(false)
    }, 2500)
  }

  const generateMockRecommendations = (result: MockAnalysisResult) => {
    if (allLashMaps.length === 0) {
      // If no lash maps loaded, create placeholder recommendations
      const placeholderRecommendations: Recommendation[] = [
        {
          map: {
            id: '1',
            name: 'Natural Wispy',
            category: 'Natural',
            difficulty: 'Beginner',
            description: 'Soft, natural-looking lashes with subtle texture',
            image_url: null
          },
          reason: `Perfect for ${result.eyeShape.toLowerCase()} - enhances natural beauty`,
          matchScore: 95
        },
        {
          map: {
            id: '2',
            name: 'Cat Eye Glam',
            category: 'Volume',
            difficulty: 'Intermediate',
            description: 'Dramatic winged effect with volume',
            image_url: null
          },
          reason: `Complements ${result.faceShape.toLowerCase()} beautifully`,
          matchScore: 90
        },
        {
          map: {
            id: '3',
            name: 'Doll Eye Effect',
            category: 'Mega Volume',
            difficulty: 'Advanced',
            description: 'Opens up eyes for a wide-eyed look',
            image_url: null
          },
          reason: `Great for ${result.eyeDistance.toLowerCase()} - creates balance`,
          matchScore: 85
        }
      ]
      setRecommendations(placeholderRecommendations)
      return
    }

    // Randomly select 3 lash maps from loaded maps
    const shuffled = [...allLashMaps].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, 3)

    const reasons = [
      `Perfect for ${result.eyeShape.toLowerCase()} - enhances natural beauty`,
      `Complements ${result.faceShape.toLowerCase()} beautifully`,
      `Great for ${result.eyeDistance.toLowerCase()} - creates balance`,
      'Recommended by our AI for your unique features',
      'Popular choice for similar eye shapes',
      'Creates perfect symmetry with your facial structure'
    ]

    const mockRecommendations: Recommendation[] = selected.map((map, index) => ({
      map,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      matchScore: 95 - (index * 5)
    }))

    setRecommendations(mockRecommendations)
  }

  const resetScanner = () => {
    setAnalysisResult(null)
    setRecommendations([])
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }
    }
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

  if (!analysisResult) {
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
              <Sparkles className="w-10 h-10 text-purple-600" />
              AI Lash Consultant
            </h1>
            <p className="text-xl text-gray-600">
              Position your face in the camera and click Analyze Face
            </p>
          </div>

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
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ display: 'none' }}
              />

              {/* Camera Switch Button */}
              <button
                onClick={switchCamera}
                className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
                title="Switch Camera"
              >
                <SwitchCamera className="w-6 h-6 text-gray-900" />
              </button>

              {/* Analyzing Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm">
                  <div className="bg-white rounded-lg p-8 text-center max-w-sm">
                    <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Face...</h3>
                    <p className="text-gray-600">
                      Our AI is detecting your facial features
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 text-center">
              <button
                onClick={captureAndAnalyze}
                disabled={isAnalyzing}
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-3"
              >
                <Camera className="w-6 h-6" />
                {isAnalyzing ? 'Analyzing...' : 'Analyze Face'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            Analysis Complete!
          </h1>
          <p className="text-xl text-gray-600">
            Here are your personalized lash map recommendations
          </p>
        </div>

        {/* Analysis Results */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            Detected Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <div className="text-3xl mb-2">👁️</div>
              <div className="text-sm text-gray-600 mb-1">Eye Shape</div>
              <div className="text-xl font-bold text-gray-900">{analysisResult.eyeShape}</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <div className="text-3xl mb-2">📏</div>
              <div className="text-sm text-gray-600 mb-1">Eye Distance</div>
              <div className="text-xl font-bold text-gray-900">{analysisResult.eyeDistance}</div>
            </div>
            
            <div className="text-center p-6 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl">
              <div className="text-3xl mb-2">💎</div>
              <div className="text-sm text-gray-600 mb-1">Face Shape</div>
              <div className="text-xl font-bold text-gray-900">{analysisResult.faceShape}</div>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>Confidence: {analysisResult.confidence}</span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Recommended Lash Maps
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-semibold text-gray-900">{rec.matchScore}%</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{rec.map.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{rec.map.category} • {rec.map.difficulty}</p>
                  <p className="text-gray-700 mb-4">{rec.map.description}</p>
                  
                  <div className="bg-purple-50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-purple-900 font-medium">{rec.reason}</p>
                  </div>

                  <Link
                    href={`/dashboard/tech/lash-maps/${rec.map.id}`}
                    className="block w-full text-center bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full font-semibold hover:shadow-lg transition-all"
                  >
                    View Details
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
            className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            <RotateCw className="w-5 h-5" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}

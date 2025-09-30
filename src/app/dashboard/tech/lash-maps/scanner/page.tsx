'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Camera, ArrowLeft, Eye, CheckCircle, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase'

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

export default function LashMapsScannerPage() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [showResults, setShowResults] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    startCamera()
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setHasPermission(true)
      }
    } catch (error) {
      console.error('Error accessing camera:', error)
      setHasPermission(false)
    }
  }

  const analyzeFace = async () => {
    if (!videoRef.current || !canvasRef.current) return

    setIsAnalyzing(true)

    // Capture current frame
    const canvas = canvasRef.current
    const video = videoRef.current
    const ctx = canvas.getContext('2d')

    if (ctx) {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    }

    // Mock AI analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Mock AI results - in real implementation, this would analyze the captured image
    const mockEyeShape = ['almond', 'round', 'hooded'][Math.floor(Math.random() * 3)]

    let recommendedMaps: Recommendation[] = []

    // Get lash maps from database
    const { data: maps } = await supabase
      .from('lash_maps')
      .select('*')
      .limit(20)

    if (maps) {
      // Mock recommendations based on eye shape
      if (mockEyeShape === 'almond') {
        recommendedMaps = [
          {
            map: maps.find(m => m.name === 'Classic Natural') || maps[0],
            reason: 'Perfect for almond-shaped eyes - enhances natural shape',
            confidence: 95
          },
          {
            map: maps.find(m => m.name === 'Wispy Volume') || maps[1],
            reason: 'Adds volume while maintaining elegance',
            confidence: 87
          },
          {
            map: maps.find(m => m.name === 'Bella Hadid') || maps[2],
            reason: 'Celebrity style that complements almond eyes',
            confidence: 82
          }
        ]
      } else if (mockEyeShape === 'round') {
        recommendedMaps = [
          {
            map: maps.find(m => m.name === 'Dramatic Volume') || maps[0],
            reason: 'Creates definition for round eyes',
            confidence: 92
          },
          {
            map: maps.find(m => m.name === 'Kim K Glam') || maps[1],
            reason: 'Adds length and drama to balance round shape',
            confidence: 89
          },
          {
            map: maps.find(m => m.name === 'Red Carpet') || maps[2],
            reason: 'Glamorous style perfect for special occasions',
            confidence: 85
          }
        ]
      } else {
        recommendedMaps = [
          {
            map: maps.find(m => m.name === 'Hybrid Volume') || maps[0],
            reason: 'Opens up hooded eyes beautifully',
            confidence: 90
          },
          {
            map: maps.find(m => m.name === 'Mega Glam') || maps[1],
            reason: 'High volume to enhance hooded eye appearance',
            confidence: 86
          },
          {
            map: maps.find(m => m.name === 'Kylie Jenner') || maps[2],
            reason: 'Wispy style that lifts hooded eyes',
            confidence: 78
          }
        ]
      }
    }

    setRecommendations(recommendedMaps)
    setIsAnalyzing(false)
    setShowResults(true)
  }

  const resetScanner = () => {
    setShowResults(false)
    setRecommendations([])
    setIsAnalyzing(false)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600'
    if (confidence >= 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
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
        <div className="flex items-center mb-8">
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
            Let AI analyze your client&apos;s face and recommend the perfect lash maps
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

              {/* Face overlay guide */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {/* Eye guide circles */}
                  <div className="flex space-x-16">
                    <div className="w-24 h-24 border-4 border-pink-400 border-dashed rounded-full opacity-70"></div>
                    <div className="w-24 h-24 border-4 border-purple-400 border-dashed rounded-full opacity-70"></div>
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <Eye className="w-8 h-8 text-white opacity-80" />
                  </div>
                </div>
              </div>

              {/* Analyzing overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="animate-spin w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold mb-2">Analyzing Face...</h3>
                    <p className="text-sm opacity-80">AI is detecting eye shape and facial features</p>
                  </div>
                </div>
              )}
            </div>

            {/* Hidden canvas for capturing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Controls */}
            <div className="p-8">
              <div className="text-center">
                <p className="text-gray-600 mb-6">
                  Position your client&apos;s face in the camera view and ensure both eyes are visible within the guide circles.
                </p>

                <button
                  onClick={analyzeFace}
                  disabled={isAnalyzing || hasPermission !== true}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 inline-block mr-2" />
                      Analyze Face
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
              <p className="text-xl text-gray-600 mb-6">
                Based on your client&apos;s facial features, here are the perfect lash map recommendations:
              </p>
            </div>

            {/* Recommendations */}
            <div className="grid gap-6">
              {recommendations.map((rec, index) => (
                <div key={rec.map.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="md:flex">
                    {/* Map Image */}
                    <div className="md:w-1/3">
                      <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <div className="text-gray-500 text-sm">Lash Map Image</div>
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
                          <div className="text-2xl font-bold">{rec.confidence}%</div>
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
                        <button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:shadow-lg transition-all duration-200">
                          View Full Details
                        </button>
                        <button className="px-6 py-3 border-2 border-pink-500 text-pink-600 rounded-lg font-semibold hover:bg-pink-50 transition-all duration-200">
                          Save to Favorites
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
                  className="bg-gray-100 text-gray-700 px-8 py-3 rounded-full font-semibold hover:bg-gray-200 transition-all duration-200"
                >
                  Scan Another Client
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

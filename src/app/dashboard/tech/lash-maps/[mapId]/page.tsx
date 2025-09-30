'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, ShoppingBag, Eye, Clock, User, Star } from 'lucide-react'
import { createClient } from '@/utils/supabase'

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string
  video_url?: string
  created_at: string
}

interface RecommendedProduct {
  name: string
  type: string
  why_needed: string
}

export default function LashMapDetailPage() {
  const params = useParams()
  const router = useRouter()
  const mapId = params.mapId as string

  const [lashMap, setLashMap] = useState<LashMap | null>(null)
  const [recommendedProducts, setRecommendedProducts] = useState<RecommendedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchLashMapDetails = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .eq('id', mapId)
        .single()

      if (error) throw error

      setLashMap(data)

      // Generate recommended products based on the map
      generateRecommendedProducts(data)
    } catch (error) {
      console.error('Error fetching lash map details:', error)
      router.push('/dashboard/tech/lash-maps')
    } finally {
      setLoading(false)
    }
  }, [mapId, supabase, router])

  useEffect(() => {
    if (mapId) {
      fetchLashMapDetails()
    }
  }, [mapId, fetchLashMapDetails])

  const generateRecommendedProducts = (map: LashMap) => {
    const baseProducts: RecommendedProduct[] = [
      { name: 'Lash Adhesive', type: 'Adhesive', why_needed: 'Essential for secure lash application' },
      { name: 'Under Eye Gel Pads', type: 'Protection', why_needed: 'Protects eyelid skin during application' },
      { name: 'Lash Primer', type: 'Treatment', why_needed: 'Prepares natural lashes for better retention' }
    ]

    const difficultyProducts: RecommendedProduct[] = []

    if (map.difficulty === 'Beginner') {
      difficultyProducts.push(
        { name: 'Classic Lash Extensions (10mm)', type: 'Lash Extensions', why_needed: 'Perfect for natural enhancement' },
        { name: 'Lash Mapping Tweezers', type: 'Tools', why_needed: 'Essential for precise placement' }
      )
    } else if (map.difficulty === 'Intermediate') {
      difficultyProducts.push(
        { name: 'Mixed Length Extensions', type: 'Lash Extensions', why_needed: 'Creates dimension and texture' },
        { name: 'Volume Lash Extensions', type: 'Lash Extensions', why_needed: 'Adds fullness without being dramatic' },
        { name: 'Professional Lash Curler', type: 'Tools', why_needed: 'Creates perfect curl patterns' }
      )
    } else {
      difficultyProducts.push(
        { name: 'Premium Volume Lashes', type: 'Lash Extensions', why_needed: 'Professional-grade volume for expert results' },
        { name: 'Fan Lash Extensions', type: 'Lash Extensions', why_needed: 'Creates dramatic fan effects' },
        { name: 'Precision Micro Tweezers', type: 'Tools', why_needed: 'Ultra-fine control for complex patterns' },
        { name: 'LED Curing Lamp', type: 'Equipment', why_needed: 'Accelerates adhesive curing for perfect bonds' }
      )
    }

    setRecommendedProducts([...baseProducts, ...difficultyProducts])
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Pro':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyDescription = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'Perfect for lash artists learning basic techniques'
      case 'Intermediate':
        return 'Requires some experience with lash mapping'
      case 'Pro':
        return 'Advanced techniques for experienced professionals'
      default:
        return ''
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!lashMap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lash Map Not Found</h2>
          <Link
            href="/dashboard/tech/lash-maps"
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            Back to Library
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Link
            href="/dashboard/tech/lash-maps"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lash Maps Library
          </Link>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left Column - Image and Basic Info */}
          <div className="space-y-8">
            {/* Main Image */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <div className="text-lg font-medium">Lash Map Illustration</div>
                  <div className="text-sm opacity-75">{lashMap.name}</div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Map Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(lashMap.difficulty)}`}>
                    {lashMap.difficulty}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="font-medium text-gray-900">{lashMap.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Technique:</span>
                  <span className="font-medium text-gray-900">Classic Extension</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <div className="flex items-center text-gray-900">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="font-medium">2-3 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details and Actions */}
          <div className="space-y-8">
            {/* Title and Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{lashMap.name}</h1>
              <p className="text-gray-600 mb-6 leading-relaxed">{lashMap.description}</p>

              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <Star className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-purple-900 mb-1">Difficulty Level: {lashMap.difficulty}</h4>
                    <p className="text-purple-800 text-sm">{getDifficultyDescription(lashMap.difficulty)}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Training Video
                </button>

                <button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 mr-2" />
                  Order Supplies for This Map
                </button>
              </div>
            </div>

            {/* Recommended Products */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <ShoppingBag className="w-5 h-5 mr-2 text-purple-600" />
                Recommended Supplies
              </h3>

              <div className="space-y-4">
                {recommendedProducts.map((product, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{product.name}</h4>
                        <p className="text-sm text-purple-600 font-medium mb-1">{product.type}</p>
                        <p className="text-sm text-gray-600">{product.why_needed}</p>
                      </div>
                      <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Technique Notes</h3>

              <div className="space-y-4">
                <div className="flex items-start">
                  <User className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Client Suitability</h4>
                    <p className="text-gray-600 text-sm">Perfect for clients seeking natural enhancement without dramatic volume.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Maintenance Schedule</h4>
                    <p className="text-gray-600 text-sm">Refills every 3-4 weeks to maintain natural appearance.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Eye className="w-5 h-5 text-purple-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Aftercare Tips</h4>
                    <p className="text-gray-600 text-sm">Avoid oil-based products and schedule regular cleanings for best retention.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Play, Package, Settings, Eye } from 'lucide-react'
import { createClient } from '@/utils/supabase'

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string
  video_url?: string
  specifications?: {
    lengths?: { [key: string]: number }
    curl_options?: string
    diameter?: string
    recommended_products?: string[]
  } | string // Support both old string format and new object format
  preview_image_url?: string
  reference_map_url?: string
  created_at: string
}

interface LashZone {
  id: string
  name: string
  position: number
  length: string
  curl: string
  diameter: string
  description: string
}

interface LashMapSpecs {
  // Old format properties
  zones?: LashZone[]
  curl_options?: string[]
  curl_explanation?: string
  diameter?: string
  technique?: string
  application_time?: string
  maintenance?: string
  notes?: string[]
  created_at?: string

  // New format properties
  lengths?: { [key: string]: number }
  recommended_products?: string[]
}

interface RecommendedProduct {
  name: string
  type: string
  why_needed: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EyeDiagram({ mapSpecifications, mapName }: { mapSpecifications?: any, mapName?: string }) {
  // Get the actual lengths from specifications or use defaults
  const lengths = mapSpecifications?.lengths ?
    Object.values(mapSpecifications.lengths) :
    [9, 10, 11, 12, 11] // fallback

  const maxLength = Math.max(...(lengths as number[]))
  const minLength = Math.min(...(lengths as number[]))

  // Special handling for Natural Wispy - create spiky pattern
  const isNaturalWispy = mapName === 'Natural Wispy'

  // Dynamic sizing based on number of zones
  const numZones = lengths.length
  
  // Fixed canvas size for consistency - zones will adjust within this space
  const eyeWidth = 700 // Fixed width for all maps
  const eyeHeight = 200 // Fixed height
  const baseLashHeight = 15 // Minimum lash height
  const maxLashHeight = isNaturalWispy ? 120 : 80

  // Smart zone labels based on number of zones
  const getZoneLabels = (count: number) => {
    if (count === 5) return ['Inner', 'Inner-Mid', 'Center', 'Outer-Mid', 'Outer']
    if (count === 7) return ['Inner', 'Inner-Mid', 'Center-Inner', 'Center', 'Center-Outer', 'Outer-Mid', 'Outer']
    if (count === 10) return ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
    return Array.from({length: count}, (_, i) => `${i + 1}`)
  }
  
  const zoneLabels = getZoneLabels(numZones)

  // Calculate viewBox dimensions
  const viewBoxWidth = eyeWidth
  const viewBoxHeight = eyeHeight + 100
  const viewBoxValue = `0 0 ${viewBoxWidth} ${viewBoxHeight}`
  
  // Calculate zone spacing - more zones = lines closer together
  const paddingX = 100 // Padding on each side
  const usableWidth = eyeWidth - (paddingX * 2)
  const zoneSpacing = usableWidth / (numZones - 1)

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lash Map Diagram</h2>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          {isNaturalWispy ? 'Natural Wispy - Clean 7-zone pattern' :
           numZones === 7 ? '7-Zone Symmetrical Doll Eye Pattern' :
           numZones === 5 ? '5-Zone Classic Pattern' :
           numZones === 10 ? '10-Zone Precision Pattern' :
           numZones + '-Zone Custom Pattern'}
          <span className="text-purple-600 font-semibold">• {numZones} Zones</span>
        </p>
      </div>

      <div className="flex justify-center">
        <svg
          width="100%"
          height={eyeHeight + 100}
          viewBox={viewBoxValue}
          className="border border-gray-200 rounded-lg bg-gradient-to-b from-blue-50 to-white max-w-4xl"
          style={{ maxHeight: '400px' }}
                >
                  {/* Eye outline - positioned below lash lines */}
                  <ellipse
                    cx={eyeWidth / 2}
                    cy={eyeHeight / 2 + 120}
                    rx={eyeWidth / 2 - 80}
                    ry={60}
                    fill="none"
                    stroke="#374151"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

          {/* Lash lines with dynamic spacing based on number of zones */}
          {lengths.map((length, index) => {
            // Calculate X position - evenly distribute zones across usable width
            const zoneStartX = paddingX + (index * zoneSpacing)
            
            // Adjust visual elements based on zone count
            const strokeWidth = numZones > 8 ? 2.5 : numZones > 5 ? 3 : 4
            // Increased by 40% total: 14px → 17px → 20px, 16px → 19px → 23px
            const labelSize = numZones > 8 ? 'text-[20px]' : 'text-[23px]'
            // Increased by 40% total: 16px → 19px → 23px, 18px → 22px → 26px
            const lengthSize = numZones > 8 ? 'text-[23px]' : 'text-[26px]'

            if (isNaturalWispy) {
              // Clean single line per zone for Natural Wispy
              const currentLength = length as number
              const scaledHeight = ((currentLength - minLength) / (maxLength - minLength)) * (maxLashHeight - baseLashHeight) + baseLashHeight

              return (
                <g key={`zone-${index}`}>
                  {/* Zone divider line (subtle) */}
                  {index > 0 && (
                    <line
                      x1={zoneStartX - zoneSpacing / 2}
                      y1={eyeHeight / 2 - 20}
                      x2={zoneStartX - zoneSpacing / 2}
                      y2={eyeHeight / 2 + 30}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.4"
                    />
                  )}
                  
                  {/* Single clean lash line per zone */}
                  <line
                    x1={zoneStartX}
                    y1={eyeHeight / 2 + 15}
                    x2={zoneStartX}
                    y2={eyeHeight / 2 + 15 - scaledHeight}
                    stroke="#7c3aed"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
                  />

                  {/* Length value at top (no "mm") - moved 30% higher */}
                  <text
                    x={zoneStartX}
                    y={eyeHeight / 2 + 15 - scaledHeight - 39}
                    textAnchor="middle"
                    className={`${lengthSize} font-bold fill-purple-700`}
                  >
                    {currentLength}
                  </text>

                  {/* Zone label below length value - moved 30% higher */}
                  <text
                    x={zoneStartX}
                    y={eyeHeight / 2 + 15 - scaledHeight - 19}
                    textAnchor="middle"
                    className={`${labelSize} font-semibold fill-gray-700`}
                  >
                    {zoneLabels[index] || ''}
                  </text>
                  
                  {/* Zone marker dot at base */}
                  <circle
                    cx={zoneStartX}
                    cy={eyeHeight / 2 + 15}
                    r={numZones > 8 ? 2 : 3}
                    fill="#8b5cf6"
                  />
                </g>
              )
            } else {
              // Regular single lash per zone for other maps
              const currentLength = length as number
              const scaledHeight = ((currentLength - minLength) / (maxLength - minLength)) * (maxLashHeight - baseLashHeight) + baseLashHeight

              return (
                <g key={`lash-${index}`}>
                  {/* Zone divider line (subtle) */}
                  {index > 0 && (
                    <line
                      x1={zoneStartX - zoneSpacing / 2}
                      y1={eyeHeight / 2 - 20}
                      x2={zoneStartX - zoneSpacing / 2}
                      y2={eyeHeight / 2 + 30}
                      stroke="#e5e7eb"
                      strokeWidth="1"
                      strokeDasharray="3,3"
                      opacity="0.4"
                    />
                  )}
                  
                  {/* Lash line */}
                  <line
                    x1={zoneStartX}
                    y1={eyeHeight / 2 + 15}
                    x2={zoneStartX}
                    y2={eyeHeight / 2 + 15 - scaledHeight}
                    stroke="#8b5cf6"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    filter="drop-shadow(0 2px 4px rgba(139, 92, 246, 0.3))"
                  />

                  {/* Length value at top (no "mm") - moved 30% higher */}
                  <text
                    x={zoneStartX}
                    y={eyeHeight / 2 + 15 - scaledHeight - 39}
                    textAnchor="middle"
                    className={`${lengthSize} font-bold fill-purple-700`}
                  >
                    {currentLength}
                  </text>

                  {/* Zone label below length value - moved 30% higher */}
                  <text
                    x={zoneStartX}
                    y={eyeHeight / 2 + 15 - scaledHeight - 19}
                    textAnchor="middle"
                    className={`${labelSize} font-semibold fill-gray-700`}
                  >
                    {zoneLabels[index]}
                  </text>
                  
                  {/* Zone marker dot at base */}
                  <circle
                    cx={zoneStartX}
                    cy={eyeHeight / 2 + 15}
                    r={numZones > 8 ? 2 : 3}
                    fill="#8b5cf6"
                  />
                </g>
              )
            }
          })}

          <path
            d={`M ${eyeWidth / 2 - 60} ${eyeHeight / 2} Q ${eyeWidth / 2} ${eyeHeight / 2 - 15} ${eyeWidth / 2 + 60} ${eyeHeight / 2}`}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="1"
            strokeDasharray="3,3"
          />
        </svg>
      </div>

      {/* Clean minimal specifications */}
      <div className="mt-6 text-center">
        <div className="text-sm text-gray-600">
          {isNaturalWispy ? 'Alternate C curl (tall) and CC curl (short) for texture' : 'Standard lash map pattern'}
        </div>
      </div>
    </div>
  )
}

export default function LashMapDetailPage() {
  const params = useParams()
  const router = useRouter()
  const mapId = params.mapId as string

  const [lashMap, setLashMap] = useState<LashMap | null>(null)
  const [specifications, setSpecifications] = useState<LashMapSpecs | null>(null)
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

      // Parse specifications if available
      if (data.specifications) {
        try {
          // Handle both new object format and old string format
          let specs;
          if (typeof data.specifications === 'string') {
            specs = JSON.parse(data.specifications);
          } else {
            specs = data.specifications;
          }
          setSpecifications(specs);
        } catch (parseError) {
          console.warn('Failed to parse specifications:', parseError);
          setSpecifications(null);
        }
      }

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
    // Special case for Classic Soft Cat Eye
    if (map.name === 'Classic Soft Cat Eye') {
      const classicSoftCatEyeProducts: RecommendedProduct[] = [
        { name: '0.15mm Classic Lashes', type: 'Lash Extensions', why_needed: 'Perfect thickness for natural volume' },
        { name: 'CC or D Curl Lashes', type: 'Lash Extensions', why_needed: 'Creates soft, natural curl pattern' },
        { name: 'Lengths: 9mm, 10mm, 11mm, 12mm', type: 'Lash Extensions', why_needed: 'Graduated lengths for dimensional effect' },
        { name: 'Lash Adhesive', type: 'Adhesive', why_needed: 'Essential for secure lash application' },
        { name: 'Isolation Tweezers', type: 'Tools', why_needed: 'Precise placement of individual lashes' },
        { name: 'Volume Tweezers (if needed)', type: 'Tools', why_needed: 'For creating subtle volume effects' }
      ]
      setRecommendedProducts(classicSoftCatEyeProducts)
      return
    }

    // Default products for other maps
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-start mb-8">
          <Link
            href="/dashboard/tech/lash-maps"
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Lash Maps Library
          </Link>
        </div>

        {/* Map Header with Name - Compact */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{lashMap.name}</h1>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(lashMap.difficulty)}`}>
              {lashMap.difficulty}
            </span>
          </div>
        </div>

        {/* Main Content Grid - 40% Diagram, 30% Specs, 20% Tutorial, 10% Products */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual Eye Diagram - 40% of space */}
          <div className="lg:col-span-5">
            <EyeDiagram mapSpecifications={specifications || undefined} mapName={lashMap.name} />
          </div>

          {/* Right Column - Specifications and Tutorial */}
          <div className="lg:col-span-7 space-y-6">
            {/* Specifications - ALWAYS SHOW FOR ALL MAPS */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Settings className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Specifications</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Length Zones - Uniform Template */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Length Zones</h4>
                  <div className="space-y-1">
                    {specifications?.lengths && Object.keys(specifications.lengths).length > 0 ? (
                      Object.entries(specifications.lengths).map(([zone, length]) => (
                        <div key={zone} className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">Zone {zone}:</span>
                          <span className="font-medium text-gray-900 text-xs">{length}mm</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-gray-600">No zones specified</span>
                    )}
                  </div>
                </div>

                {/* Application Details - Uniform Template */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Application Details</h4>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Curl:</span>
                      <span className="font-medium text-gray-900 text-xs">{specifications?.curl_options || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Diameter:</span>
                      <span className="font-medium text-gray-900 text-xs">{specifications?.diameter || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Difficulty:</span>
                      <span className="font-medium text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                        {lashMap.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-600">Category:</span>
                      <span className="font-medium text-gray-900 text-xs">{lashMap.category}</span>
                    </div>
                  </div>
                </div>

                {/* Recommended Products - Uniform Template */}
                <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                  <h4 className="text-base font-semibold text-gray-900 mb-3">Recommended Products</h4>
                  <div className="flex flex-wrap gap-1">
                    {specifications?.recommended_products && specifications.recommended_products.length > 0 ? (
                      specifications.recommended_products.map((product, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {product}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-600">No products specified</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tutorial/Training Buttons - 20% of space, Prominent CTA */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4 text-center">Start Learning</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:bg-white/30 transition-all duration-200 flex flex-col items-center space-y-2">
                  <Play className="w-8 h-8" />
                  <span className="font-semibold text-sm">Watch Training Video</span>
                  <span className="text-xs opacity-90">Step-by-step tutorial</span>
                </button>
                <button className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 hover:bg-white/30 transition-all duration-200 flex flex-col items-center space-y-2">
                  <Eye className="w-8 h-8" />
                  <span className="font-semibold text-sm">View Preview</span>
                  <span className="text-xs opacity-90">Realistic result</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Products - 10% of space, Compact footer-style */}
        <div className="mt-6">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center space-x-2 mb-3">
              <Package className="w-4 h-4 text-purple-600" />
              <h4 className="text-sm font-semibold text-gray-700">Quick Reference - Supplies Needed</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {recommendedProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between py-1 px-2 bg-white rounded-lg border border-gray-100">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{product.name}</div>
                    <div className="text-xs text-purple-600 truncate">{product.type}</div>
                  </div>
                  <button className="ml-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded text-xs font-medium hover:shadow-sm transition-all">
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </div>
  )
}


'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Camera, Eye, Star, MapPin, Users, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase'

interface LashMap {
  id: string
  name: string
  category: string
  difficulty: string
  description: string
  image_url: string
  video_url?: string
  preview_image_url?: string
  reference_map_url?: string
  created_at: string
}

interface GroupedMaps {
  [key: string]: {
    [difficulty: string]: LashMap[]
  }
}

export default function LashMapsPage() {
  const [groupedMaps, setGroupedMaps] = useState<GroupedMaps>({})
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const fetchLashMaps = useCallback(async () => {
    try {
      console.log('Starting to fetch lash maps...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set')

      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('Supabase response received:', { hasData: !!data, hasError: !!error })

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Processing data:', data?.length, 'maps')

      // Group maps by category and difficulty
      const grouped: GroupedMaps = {}
      data?.forEach((map) => {
        if (!grouped[map.category]) {
          grouped[map.category] = {
            Beginner: [],
            Intermediate: [],
            Pro: []
          }
        }
        grouped[map.category][map.difficulty].push(map)
      })

      console.log('Grouped data:', grouped)
      setGroupedMaps(grouped)
    } catch (error) {
      console.error('Error fetching lash maps:', error)
      // For now, set loading to false even on error so we can see the page
      setTimeout(() => setLoading(false), 2000)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    console.log('Component mounted, fetching lash maps...')
    fetchLashMaps()
  }, [fetchLashMaps])

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

  const categories = ['Natural', 'Volume', 'Mega Volume', 'Special/Celebrity Styles']

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Lash Map Library
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Discover the perfect lash map for every client and occasion
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/dashboard/tech/lash-maps/admin"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-6 h-6 mr-3" />
              Add New Map (Admin)
            </Link>

            <Link
              href="/dashboard/tech/lash-maps/create"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Plus className="w-6 h-6 mr-3" />
              Create Custom Map
            </Link>

            <Link
              href="/dashboard/tech/lash-maps/scanner"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Camera className="w-6 h-6 mr-3" />
              AI Face Scanner - Find Perfect Maps
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div key={category}>
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{category}</h2>
                <p className="text-gray-600 mb-4">
                  {category === 'Natural' && 'Clean, natural enhancements'}
                  {category === 'Volume' && 'Beautiful volume lashes'}
                  {category === 'Mega Volume' && 'Maximum volume and drama'}
                  {category === 'Special/Celebrity Styles' && 'Celebrity-inspired glamorous looks'}
                </p>
                <div className="h-px bg-gradient-to-r from-purple-200 to-pink-200"></div>
              </div>

              {/* Difficulty Levels */}
              <div className="space-y-8">
                {['Beginner', 'Intermediate', 'Pro'].map((difficulty) => {
                  const mapsForDifficulty = groupedMaps[category]?.[difficulty] || []
                  if (mapsForDifficulty.length === 0) return null

                  return (
                    <div key={difficulty}>
                      <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(difficulty)} mr-3`}>
                          {difficulty}
                        </span>
                        {difficulty} Level ({mapsForDifficulty.length} maps)
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {mapsForDifficulty.map((map) => (
                          <Link
                            key={map.id}
                            href={`/dashboard/tech/lash-maps/${map.id}`}
                            className="group relative bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-100 hover:border-purple-200"
                          >
                            <div className="aspect-[4/3] relative">
                              {map.preview_image_url ? (
                                <div
                                  className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                                  style={{ backgroundImage: `url(${map.preview_image_url})` }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
                                  <Eye className="w-12 h-12 text-purple-300" />
                                </div>
                              )}

                              {/* Overlay with map name and difficulty */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-4">
                                <h4 className="text-lg font-bold text-white mb-2 group-hover:text-pink-200 transition-colors">
                                  {map.name}
                                </h4>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium self-start ${getDifficultyColor(difficulty)}`}>
                                  {difficulty}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

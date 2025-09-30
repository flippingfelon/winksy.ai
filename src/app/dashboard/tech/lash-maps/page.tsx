'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Camera, Eye, Star, MapPin, Users } from 'lucide-react'
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
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

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

      setGroupedMaps(grouped)
    } catch (error) {
      console.error('Error fetching lash maps:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
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

          {/* AI Scanner Button */}
          <Link
            href="/dashboard/tech/lash-maps/scanner"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <Camera className="w-6 h-6 mr-3" />
            AI Face Scanner - Find Perfect Maps
          </Link>
        </div>

        {/* Categories */}
        <div className="space-y-16">
          {categories.map((category) => (
            <div key={category} className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  {category === 'Natural' && <Eye className="w-6 h-6 text-white" />}
                  {category === 'Volume' && <Star className="w-6 h-6 text-white" />}
                  {category === 'Mega Volume' && <Users className="w-6 h-6 text-white" />}
                  {category === 'Special/Celebrity Styles' && <MapPin className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">{category}</h2>
                  <p className="text-gray-600">
                    {category === 'Natural' && 'Clean, natural enhancements'}
                    {category === 'Volume' && 'Beautiful volume lashes'}
                    {category === 'Mega Volume' && 'Maximum volume and drama'}
                    {category === 'Special/Celebrity Styles' && 'Celebrity-inspired glamorous looks'}
                  </p>
                </div>
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
                          <div key={map.id} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                            <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg mb-4 flex items-center justify-center">
                              <div className="text-gray-500 text-sm">Lash Map Image</div>
                            </div>

                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{map.name}</h4>
                            <p className="text-gray-600 text-sm mb-4">{map.description}</p>

                            <Link
                              href={`/dashboard/tech/lash-maps/${map.id}`}
                              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:shadow-lg transition-all duration-200 block text-center"
                            >
                              View Details
                            </Link>
                          </div>
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

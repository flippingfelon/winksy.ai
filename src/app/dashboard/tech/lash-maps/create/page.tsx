'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Eye, ChevronDown } from 'lucide-react'
import { createClient } from '@/utils/supabase'

interface LashZone {
  name: string
  length: string
  curl: string
  diameter: string
}

interface LashMapTemplate {
  name: string
  category: string
  difficulty: string
  zones: Record<string, LashZone>
  description: string
}

const TEMPLATES: Record<string, LashMapTemplate> = {
  natural: {
    name: 'Natural Base',
    category: 'Natural',
    difficulty: 'Beginner',
    description: 'Subtle, everyday natural enhancement',
    zones: {
      'inner-corner': { name: 'Inner Corner', length: '8mm', curl: 'C', diameter: '0.15' },
      'inner': { name: 'Inner', length: '10mm', curl: 'C', diameter: '0.15' },
      'center': { name: 'Center', length: '11mm', curl: 'C', diameter: '0.15' },
      'outer': { name: 'Outer', length: '10mm', curl: 'C', diameter: '0.15' },
      'outer-corner': { name: 'Outer Corner', length: '9mm', curl: 'C', diameter: '0.15' }
    }
  },
  volume: {
    name: 'Volume Base',
    category: 'Volume',
    difficulty: 'Intermediate',
    description: 'Classic volume lashes for maximum fullness',
    zones: {
      'inner-corner': { name: 'Inner Corner', length: '9mm', curl: 'D', diameter: '0.07' },
      'inner': { name: 'Inner', length: '11mm', curl: 'D', diameter: '0.07' },
      'center': { name: 'Center', length: '12mm', curl: 'D', diameter: '0.07' },
      'outer': { name: 'Outer', length: '11mm', curl: 'D', diameter: '0.07' },
      'outer-corner': { name: 'Outer Corner', length: '10mm', curl: 'D', diameter: '0.07' }
    }
  },
  mega: {
    name: 'Mega Volume Base',
    category: 'Mega Volume',
    difficulty: 'Pro',
    description: 'Extreme volume for dramatic effects',
    zones: {
      'inner-corner': { name: 'Inner Corner', length: '10mm', curl: 'D', diameter: '0.05' },
      'inner': { name: 'Inner', length: '12mm', curl: 'D', diameter: '0.05' },
      'center': { name: 'Center', length: '14mm', curl: 'D', diameter: '0.05' },
      'outer': { name: 'Outer', length: '12mm', curl: 'D', diameter: '0.05' },
      'outer-corner': { name: 'Outer Corner', length: '11mm', curl: 'D', diameter: '0.05' }
    }
  }
}

const LENGTH_OPTIONS = ['6mm', '7mm', '8mm', '9mm', '10mm', '11mm', '12mm', '13mm', '14mm', '15mm']
const CURL_OPTIONS = ['J', 'B', 'C', 'CC', 'D', 'DD', 'L', 'L+', 'M']
const DIAMETER_OPTIONS = ['0.03', '0.05', '0.07', '0.10', '0.12', '0.15', '0.18', '0.20', '0.25']

const ZONE_POSITIONS = {
  'inner-corner': { x: 25, y: 50, angle: 15 },
  'inner': { x: 35, y: 45, angle: 30 },
  'center': { x: 50, y: 40, angle: 0 },
  'outer': { x: 65, y: 45, angle: -30 },
  'outer-corner': { x: 75, y: 50, angle: -15 }
}

export default function CreateLashMapPage() {
  const router = useRouter()
  const supabase = createClient()

  const [selectedTemplate, setSelectedTemplate] = useState<string>('natural')
  const [zones, setZones] = useState<Record<string, LashZone>>(TEMPLATES.natural.zones)
  const [mapName, setMapName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Natural')
  const [difficulty, setDifficulty] = useState('Beginner')
  const [trainingUrl, setTrainingUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Update zones when template changes
  const handleTemplateChange = (template: string) => {
    setSelectedTemplate(template)
    const templateData = TEMPLATES[template]
    setZones(templateData.zones)
    setCategory(templateData.category)
    setDifficulty(templateData.difficulty)
    setDescription(templateData.description)
    setMapName(`${templateData.name} Custom`)
  }

  // Update zone parameters
  const updateZone = (zoneId: string, field: keyof LashZone, value: string) => {
    setZones(prev => ({
      ...prev,
      [zoneId]: { ...prev[zoneId], [field]: value }
    }))
  }

  // Save the lash map
  const handleSave = async () => {
    if (!mapName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a name for your lash map' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      // Convert zones to JSON for storage
      const specifications = {
        zones,
        created_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('lash_maps')
        .insert({
          name: mapName.trim(),
          category,
          difficulty,
          description: description.trim(),
          image_url: `/images/lash-maps/custom-${Date.now()}.jpg`, // Placeholder
          video_url: trainingUrl.trim() || null,
          specifications: JSON.stringify(specifications)
        })
        .select()
        .single()

      if (error) throw error

      setMessage({ type: 'success', text: 'Lash map saved successfully!' })

      // Redirect to the new map's detail page after a delay
      setTimeout(() => {
        router.push(`/dashboard/tech/lash-maps/${data.id}`)
      }, 1500)

    } catch (error) {
      console.error('Error saving lash map:', error)
      setMessage({ type: 'error', text: 'Failed to save lash map. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  // Calculate lash line height based on length
  const getLashHeight = (length: string) => {
    const mm = parseInt(length.replace('mm', ''))
    return (mm - 5) * 3 // Scale factor for visual representation
  }

  // Get curl color
  const getCurlColor = (curl: string) => {
    const colors: Record<string, string> = {
      'J': '#10b981', // green
      'B': '#3b82f6', // blue
      'C': '#8b5cf6', // purple
      'CC': '#ec4899', // pink
      'D': '#f59e0b', // amber
      'DD': '#ef4444', // red
      'L': '#6b7280', // gray
      'L+': '#374151', // dark gray
      'M': '#1f2937'  // darker gray
    }
    return colors[curl] || '#8b5cf6'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/tech/lash-maps"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Library
            </Link>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Lash Map'}</span>
          </button>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Canvas and Preview */}
          <div className="space-y-6">
            {/* Title */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Custom Lash Map</h1>
              <p className="text-gray-600">Design your perfect lash map with our interactive canvas</p>
            </div>

            {/* Template Selector */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Choose Base Template
              </label>
              <div className="relative">
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="natural">🌸 Natural Base - Subtle enhancement</option>
                  <option value="volume">💫 Volume Base - Maximum fullness</option>
                  <option value="mega">✨ Mega Volume Base - Dramatic effects</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Templates pre-fill with industry-standard patterns
              </p>
            </div>

            {/* Eye Canvas */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Eye className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-900">Lash Map Canvas</h3>
              </div>

              <div className="relative">
                {/* Eye Diagram SVG */}
                <svg
                  viewBox="0 0 300 150"
                  className="w-full h-auto border-2 border-gray-200 rounded-lg bg-gradient-to-b from-blue-50 to-white"
                >
                  {/* Eye outline */}
                  <ellipse
                    cx="150"
                    cy="75"
                    rx="80"
                    ry="35"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />

                  {/* Iris */}
                  <circle
                    cx="150"
                    cy="75"
                    r="25"
                    fill="#3b82f6"
                    opacity="0.3"
                  />

                  {/* Pupil */}
                  <circle
                    cx="150"
                    cy="75"
                    r="12"
                    fill="#1e40af"
                  />

                  {/* Zone dividers */}
                  <line x1="70" y1="75" x2="230" y2="75" stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4,4" />

                  {/* Lash lines */}
                  {Object.entries(zones).map(([zoneId, zone]) => {
                    const position = ZONE_POSITIONS[zoneId as keyof typeof ZONE_POSITIONS]
                    const height = getLashHeight(zone.length)
                    const color = getCurlColor(zone.curl)

                    return (
                      <g key={zoneId}>
                        {/* Lash line */}
                        <line
                          x1={position.x * 3}
                          y1={75 - 10}
                          x2={position.x * 3}
                          y2={75 - 10 - height}
                          stroke={color}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />

                        {/* Zone label */}
                        <text
                          x={position.x * 3}
                          y={85}
                          textAnchor="middle"
                          fontSize="8"
                          fill="#6b7280"
                          className="text-xs"
                        >
                          {zone.length}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {/* Zone labels overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="grid grid-cols-5 h-full">
                    <div className="flex items-end justify-center pb-4">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        Inner Corner
                      </span>
                    </div>
                    <div className="flex items-end justify-center pb-4">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        Inner
                      </span>
                    </div>
                    <div className="flex items-end justify-center pb-4">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        Center
                      </span>
                    </div>
                    <div className="flex items-end justify-center pb-4">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        Outer
                      </span>
                    </div>
                    <div className="flex items-end justify-center pb-4">
                      <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded shadow-sm">
                        Outer Corner
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Controls */}
          <div className="space-y-6">
            {/* Zone Controls */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Zone Configuration</h3>

              <div className="space-y-4">
                {Object.entries(zones).map(([zoneId, zone]) => (
                  <div key={zoneId} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">{zone.name}</h4>

                    <div className="grid grid-cols-3 gap-3">
                      {/* Length */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Length
                        </label>
                        <select
                          value={zone.length}
                          onChange={(e) => updateZone(zoneId, 'length', e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {LENGTH_OPTIONS.map(length => (
                            <option key={length} value={length}>{length}</option>
                          ))}
                        </select>
                      </div>

                      {/* Curl */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Curl
                        </label>
                        <select
                          value={zone.curl}
                          onChange={(e) => updateZone(zoneId, 'curl', e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {CURL_OPTIONS.map(curl => (
                            <option key={curl} value={curl}>{curl}</option>
                          ))}
                        </select>
                      </div>

                      {/* Diameter */}
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Diameter
                        </label>
                        <select
                          value={zone.diameter}
                          onChange={(e) => updateZone(zoneId, 'diameter', e.target.value)}
                          className="w-full px-2 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {DIAMETER_OPTIONS.map(diameter => (
                            <option key={diameter} value={diameter}>{diameter}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Save Configuration */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Save Configuration</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Map Name *
                  </label>
                  <input
                    type="text"
                    value={mapName}
                    onChange={(e) => setMapName(e.target.value)}
                    placeholder="Enter a name for your lash map"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Natural">Natural</option>
                      <option value="Volume">Volume</option>
                      <option value="Mega Volume">Mega Volume</option>
                      <option value="Special/Celebrity Styles">Special Styles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your lash map design..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Training Video URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={trainingUrl}
                    onChange={(e) => setTrainingUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

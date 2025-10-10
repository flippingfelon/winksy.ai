'use client'

import { useState } from 'react'
import { Sparkles, Save, Plus, Minus } from 'lucide-react'

interface CustomLashMapBuilderProps {
  onSave: (customMap: {
    name: string
    lengths: { [key: string]: number }
    curl_used: string
    diameter_used: string
  }) => void
  initialData?: {
    name: string
    lengths: { [key: string]: number }
    curl_used: string
    diameter_used: string
  }
}

export default function CustomLashMapBuilder({ onSave, initialData }: CustomLashMapBuilderProps) {
  const [mapData, setMapData] = useState(initialData || {
    name: '',
    lengths: {
      inner: 8,
      innerMid: 9,
      center: 11,
      outerMid: 10,
      outer: 9
    },
    curl_used: 'C',
    diameter_used: '0.15mm'
  })

  const handleLengthChange = (zone: string, increment: number) => {
    setMapData({
      ...mapData,
      lengths: {
        ...mapData.lengths,
        [zone]: Math.max(6, Math.min(15, (mapData.lengths[zone] || 8) + increment))
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mapData.name.trim()) {
      alert('Please enter a name for your custom lash map')
      return
    }
    onSave(mapData)
  }

  // Calculate positions for visual preview
  const lengths = [
    mapData.lengths.inner,
    mapData.lengths.innerMid,
    mapData.lengths.center,
    mapData.lengths.outerMid,
    mapData.lengths.outer
  ]

  const maxLength = Math.max(...lengths)
  const minLength = Math.min(...lengths)
  const eyeWidth = 700
  const eyeHeight = 200
  const baseLashHeight = 15
  const maxLashHeight = 80
  const paddingX = 100
  const usableWidth = eyeWidth - (paddingX * 2)
  const zoneSpacing = usableWidth / 4 // 5 zones = 4 spaces

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-6 h-6 text-purple-600" />
        <h3 className="text-xl font-bold text-gray-900">Custom Lash Map Builder</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Map Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Custom Map Name *
          </label>
          <input
            type="text"
            required
            value={mapData.name}
            onChange={(e) => setMapData({ ...mapData, name: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="e.g., My Signature Style"
          />
        </div>

        {/* Length Zones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Lash Lengths (mm) *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { key: 'inner', label: 'Inner' },
              { key: 'innerMid', label: 'Inner-Mid' },
              { key: 'center', label: 'Center' },
              { key: 'outerMid', label: 'Outer-Mid' },
              { key: 'outer', label: 'Outer' }
            ].map((zone) => (
              <div key={zone.key} className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2 text-center">{zone.label}</p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLengthChange(zone.key, -1)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                    {mapData.lengths[zone.key]}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleLengthChange(zone.key, 1)}
                    className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Preview */}
        <div className="bg-white rounded-xl p-6 border-2 border-purple-200">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Visual Preview</h4>
          <div className="flex justify-center">
            <svg
              width="100%"
              height={eyeHeight + 100}
              viewBox={`0 0 ${eyeWidth} ${eyeHeight + 100}`}
              className="border border-gray-200 rounded-lg bg-gradient-to-b from-blue-50 to-white max-w-4xl"
              style={{ maxHeight: '400px' }}
            >
              {/* Eye outline */}
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

              {/* Lash lines */}
              {lengths.map((length, index) => {
                const zoneStartX = paddingX + (index * zoneSpacing)
                const scaledHeight = ((length - minLength) / (maxLength - minLength)) * (maxLashHeight - baseLashHeight) + baseLashHeight
                const strokeWidth = 4
                const labelSize = 'text-[23px]'
                const lengthSize = 'text-[26px]'

                const zoneLabels = ['Inner', 'Inner-Mid', 'Center', 'Outer-Mid', 'Outer']

                return (
                  <g key={`lash-${index}`}>
                    {/* Zone divider line */}
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

                    {/* Length value */}
                    <text
                      x={zoneStartX}
                      y={eyeHeight / 2 + 15 - scaledHeight - 39}
                      textAnchor="middle"
                      className={`${lengthSize} font-bold fill-purple-700`}
                    >
                      {length}
                    </text>

                    {/* Zone label */}
                    <text
                      x={zoneStartX}
                      y={eyeHeight / 2 + 15 - scaledHeight - 19}
                      textAnchor="middle"
                      className={`${labelSize} font-semibold fill-gray-700`}
                    >
                      {zoneLabels[index]}
                    </text>

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

                    {/* Zone marker dot */}
                    <circle
                      cx={zoneStartX}
                      cy={eyeHeight / 2 + 15}
                      r={3}
                      fill="#8b5cf6"
                    />
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {/* Curl and Diameter */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Curl Type *
            </label>
            <select
              required
              value={mapData.curl_used}
              onChange={(e) => setMapData({ ...mapData, curl_used: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            >
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="CC">CC</option>
              <option value="D">D</option>
              <option value="DD">DD</option>
              <option value="L">L</option>
              <option value="B or C">B or C</option>
              <option value="C or CC">C or CC</option>
              <option value="CC or D">CC or D</option>
              <option value="D or DD">D or DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diameter *
            </label>
            <select
              required
              value={mapData.diameter_used}
              onChange={(e) => setMapData({ ...mapData, diameter_used: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            >
              <option value="0.10mm">0.10mm</option>
              <option value="0.12mm">0.12mm</option>
              <option value="0.15mm">0.15mm</option>
              <option value="0.18mm">0.18mm</option>
              <option value="0.20mm">0.20mm</option>
              <option value="0.25mm">0.25mm</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center justify-center gap-2 text-lg font-semibold"
        >
          <Save className="w-5 h-5" />
          Save & Use This Custom Map
        </button>
      </form>
    </div>
  )
}


'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase'
import { Plus, Edit, Trash2, Upload, Save, X, Eye, ChevronUp, ChevronDown, Minus, Settings } from 'lucide-react'
import Link from 'next/link'

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
  specifications?: {
    lengths?: { [key: string]: number }
    curl_options?: string
    diameter?: string
    recommended_products?: string[]
  }
  created_at: string
}

interface LashMapFormData {
  name: string
  category: string
  difficulty: string
  description: string
  video_url: string
  lengths: { [key: string]: string } // Now supports 7 zones
  curl_options: string
  diameter: string
  recommended_products: string[]
  preview_image: File | null
  reference_map: File | null
}

export default function LashMapsAdminPage() {
  const [maps, setMaps] = useState<LashMap[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMap, setEditingMap] = useState<LashMap | null>(null)
  const [uploading, setUploading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const [formData, setFormData] = useState<LashMapFormData>({
    name: '',
    category: 'Natural',
    difficulty: 'Beginner',
    description: '',
    video_url: '',
    lengths: { '1': '', '2': '', '3': '', '4': '', '5': '', '6': '', '7': '' },
    curl_options: '',
    diameter: '',
    recommended_products: [],
    preview_image: null,
    reference_map: null
  })

  const [newProduct, setNewProduct] = useState('')

  const fetchLashMaps = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('lash_maps')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMaps(data || [])
    } catch (error) {
      console.error('Error fetching lash maps:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchLashMaps()
  }, [fetchLashMaps])

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `lash-maps/${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('lash-map-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage
        .from('lash-map-images')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      let previewImageUrl = editingMap?.preview_image_url || null
      let referenceMapUrl = editingMap?.reference_map_url || null

      // Upload images if provided
      if (formData.preview_image) {
        const url = await uploadImage(formData.preview_image, 'previews')
        if (url) previewImageUrl = url
      }

      if (formData.reference_map) {
        const url = await uploadImage(formData.reference_map, 'references')
        if (url) referenceMapUrl = url
      }

      // Prepare lengths object
      const lengths: { [key: string]: number } = {}
      Object.entries(formData.lengths).forEach(([key, value]) => {
        if (value) lengths[key] = parseFloat(value)
      })

      // Prepare recommended products array
      const recommendedProducts = formData.recommended_products.filter(p => p.length > 0)

      const specifications = {
        lengths: Object.keys(lengths).length > 0 ? lengths : undefined,
        curl_options: formData.curl_options || undefined,
        diameter: formData.diameter || undefined,
        recommended_products: recommendedProducts.length > 0 ? recommendedProducts : undefined
      }

      const mapData = {
        name: formData.name,
        category: formData.category,
        difficulty: formData.difficulty,
        description: formData.description,
        video_url: formData.video_url || null,
        preview_image_url: previewImageUrl,
        reference_map_url: referenceMapUrl,
        specifications: Object.keys(specifications).some(key =>
          specifications[key as keyof typeof specifications] !== undefined
        ) ? specifications : null
      }

      if (editingMap) {
        // Update existing map
        const { error } = await supabase
          .from('lash_maps')
          .update(mapData)
          .eq('id', editingMap.id)

        if (error) throw error
      } else {
        // Create new map
        const { error } = await supabase
          .from('lash_maps')
          .insert(mapData)

        if (error) throw error
      }

      // Reset form and refresh data
      resetForm()
      fetchLashMaps()
      setShowForm(false)
      setEditingMap(null)
    } catch (error: unknown) {
      console.error('Error saving lash map:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error saving lash map: ${errorMessage}`)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (map: LashMap) => {
    setEditingMap(map)
    setFormData({
      name: map.name,
      category: map.category,
      difficulty: map.difficulty,
      description: map.description || '',
      video_url: map.video_url || '',
      lengths: map.specifications?.lengths ?
        Object.fromEntries(Object.entries(map.specifications.lengths).map(([k, v]) => [k, v.toString()])) :
        { '1': '', '2': '', '3': '', '4': '', '5': '', '6': '', '7': '' },
      curl_options: map.specifications?.curl_options || '',
      diameter: map.specifications?.diameter || '',
      recommended_products: map.specifications?.recommended_products || [],
      preview_image: null,
      reference_map: null
    })
    setShowForm(true)
  }

  const handleDelete = async (mapId: string) => {
    if (!confirm('Are you sure you want to delete this lash map?')) return

    try {
      const { error } = await supabase
        .from('lash_maps')
        .delete()
        .eq('id', mapId)

      if (error) throw error

      fetchLashMaps()
    } catch (error) {
      console.error('Error deleting lash map:', error)
      alert('Error deleting lash map. Please try again.')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'Natural',
      difficulty: 'Beginner',
      description: '',
      video_url: '',
      lengths: { '1': '', '2': '', '3': '', '4': '', '5': '', '6': '', '7': '' },
      curl_options: '',
      diameter: '',
      recommended_products: [],
      preview_image: null,
      reference_map: null
    })
    setNewProduct('')
  }

  const handleAddProduct = () => {
    if (newProduct.trim()) {
      setFormData({
        ...formData,
        recommended_products: [...formData.recommended_products, newProduct.trim()]
      })
      setNewProduct('')
    }
  }

  const handleRemoveProduct = (index: number) => {
    setFormData({
      ...formData,
      recommended_products: formData.recommended_products.filter((_, i) => i !== index)
    })
  }

  const handleNewMap = () => {
    setEditingMap(null)
    resetForm()
    setShowForm(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Pro':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-gray-200 rounded-lg"></div>
            <div className="h-20 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Lash Maps Admin
              </h1>
              <p className="text-gray-600">
                Manage lash map library and add new designs
              </p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/dashboard/tech/lash-maps"
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Library
              </Link>
              <button
                onClick={handleNewMap}
                className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Map
              </button>
            </div>
          </div>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingMap ? 'Edit Lash Map' : 'Add New Lash Map'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Live Preview */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-600" />
                    Live Preview
                  </h3>
                  
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <Settings className="w-5 h-5 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">Specifications</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Length Zones Preview */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                        <h4 className="text-base font-semibold text-gray-900 mb-3">Length Zones</h4>
                        <div className="space-y-1">
                          {Object.keys(formData.lengths).some(key => formData.lengths[key]) ? (
                            Object.entries(formData.lengths).map(([zone, length]) => 
                              length ? (
                                <div key={zone} className="flex justify-between items-center">
                                  <span className="text-xs text-gray-600">Zone {zone}:</span>
                                  <span className="font-medium text-gray-900 text-xs">{length}mm</span>
                                </div>
                              ) : null
                            )
                          ) : (
                            <span className="text-xs text-gray-600">No zones specified</span>
                          )}
                        </div>
                      </div>

                      {/* Application Details Preview */}
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                        <h4 className="text-base font-semibold text-gray-900 mb-3">Application Details</h4>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Curl:</span>
                            <span className="font-medium text-gray-900 text-xs">{formData.curl_options || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Diameter:</span>
                            <span className="font-medium text-gray-900 text-xs">{formData.diameter || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Difficulty:</span>
                            <span className="font-medium text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800">
                              {formData.difficulty}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-600">Category:</span>
                            <span className="font-medium text-gray-900 text-xs">{formData.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Recommended Products Preview */}
                      <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
                        <h4 className="text-base font-semibold text-gray-900 mb-3">Recommended Products</h4>
                        <div className="flex flex-wrap gap-1">
                          {formData.recommended_products.length > 0 ? (
                            formData.recommended_products.map((product, index) => (
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
                </div>

                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Map Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., Natural Soft Cat Eye"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="Natural">Natural</option>
                      <option value="Volume">Volume</option>
                      <option value="Mega Volume">Mega Volume</option>
                      <option value="Special/Celebrity Styles">Special/Celebrity Styles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty *
                    </label>
                    <select
                      required
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Pro">Pro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Training Video URL
                    </label>
                    <input
                      type="url"
                      value={formData.video_url}
                      onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    placeholder="Describe the lash map style and when to use it..."
                  />
                </div>

                {/* Lengths */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lengths (mm) - 7 Zones (Symmetrical Doll Eye)
                  </label>
                  <div className="grid grid-cols-7 gap-3">
                    {[
                      { key: 1, label: 'Inner' },
                      { key: 2, label: 'Inner-Mid' },
                      { key: 3, label: 'Center-Inner' },
                      { key: 4, label: 'Center' },
                      { key: 5, label: 'Center-Outer' },
                      { key: 6, label: 'Outer-Mid' },
                      { key: 7, label: 'Outer' }
                    ].map((zone) => (
                      <div key={zone.key}>
                        <label className="block text-xs text-gray-500 mb-1 text-center">{zone.label}</label>
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = parseFloat(formData.lengths[zone.key.toString()] || '0')
                              setFormData({
                                ...formData,
                                lengths: { ...formData.lengths, [zone.key.toString()]: (currentVal + 1).toString() }
                              })
                            }}
                            className="p-1 bg-purple-50 hover:bg-purple-100 rounded text-purple-600 transition-colors"
                          >
                            <ChevronUp className="w-3 h-3 mx-auto" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            max="20"
                            value={formData.lengths[zone.key.toString()] || ''}
                            onChange={(e) => setFormData({
                              ...formData,
                              lengths: { ...formData.lengths, [zone.key.toString()]: e.target.value }
                            })}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-semibold text-gray-900"
                            placeholder="8"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentVal = parseFloat(formData.lengths[zone.key.toString()] || '0')
                              if (currentVal > 0) {
                                setFormData({
                                  ...formData,
                                  lengths: { ...formData.lengths, [zone.key.toString()]: (currentVal - 1).toString() }
                                })
                              }
                            }}
                            className="p-1 bg-purple-50 hover:bg-purple-100 rounded text-purple-600 transition-colors"
                          >
                            <ChevronDown className="w-3 h-3 mx-auto" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Use the ↑↓ buttons to adjust lengths easily. Typical pattern: 8-9-10-11-10-9-8mm
                  </p>
                </div>

                {/* Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Curl Options *
                    </label>
                    <select
                      required
                      value={formData.curl_options}
                      onChange={(e) => setFormData({ ...formData, curl_options: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select curl type</option>
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
                      <option value="DD or L">DD or L</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Diameter *
                    </label>
                    <select
                      required
                      value={formData.diameter}
                      onChange={(e) => setFormData({ ...formData, diameter: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select diameter</option>
                      <option value="0.03mm">0.03mm</option>
                      <option value="0.05mm">0.05mm</option>
                      <option value="0.07mm">0.07mm</option>
                      <option value="0.10mm">0.10mm</option>
                      <option value="0.12mm">0.12mm</option>
                      <option value="0.15mm">0.15mm</option>
                      <option value="0.18mm">0.18mm</option>
                      <option value="0.20mm">0.20mm</option>
                      <option value="0.25mm">0.25mm</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended Products
                  </label>
                  
                  {/* Product List */}
                  <div className="space-y-2 mb-3">
                    {formData.recommended_products.map((product, index) => (
                      <div key={index} className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-lg">
                        <span className="flex-1 text-sm text-gray-900">{product}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(index)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Remove product"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.recommended_products.length === 0 && (
                      <div className="text-sm text-gray-500 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                        No products added yet
                      </div>
                    )}
                  </div>

                  {/* Add Product Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newProduct}
                      onChange={(e) => setNewProduct(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddProduct()
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                      placeholder="e.g., 0.15mm Natural Lashes"
                    />
                    <button
                      type="button"
                      onClick={handleAddProduct}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Image Uploads */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview Image (Finished Look)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({
                        ...formData,
                        preview_image: e.target.files?.[0] || null
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                    {editingMap?.preview_image_url && (
                      <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reference Map (Technical Diagram)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFormData({
                        ...formData,
                        reference_map: e.target.files?.[0] || null
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
                    />
                    {editingMap?.reference_map_url && (
                      <p className="text-xs text-gray-500 mt-1">Leave empty to keep current image</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Save className="w-4 h-4 mr-2" />
                        {editingMap ? 'Update Map' : 'Create Map'}
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Maps List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Existing Lash Maps ({maps.length})
            </h3>
          </div>

          <div className="divide-y divide-gray-200">
            {maps.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                No lash maps found. Create your first one!
              </div>
            ) : (
              maps.map((map) => (
                <div key={map.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <h4 className="font-semibold text-gray-900">{map.name}</h4>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {map.category}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(map.difficulty)}`}>
                          {map.difficulty}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{map.description}</p>
                      {map.specifications && (
                        <div className="mt-2 text-xs text-gray-500">
                          {map.specifications.lengths && (
                            <div className="mb-1">
                              <span className="font-medium">Lengths:</span>{' '}
                              {Object.keys(map.specifications.lengths).length === 7
                                ? `${map.specifications.lengths['1']}-${map.specifications.lengths['2']}-${map.specifications.lengths['3']}-${map.specifications.lengths['4']}-${map.specifications.lengths['5']}-${map.specifications.lengths['6']}-${map.specifications.lengths['7']}mm`
                                : Object.values(map.specifications.lengths).join(', ') + 'mm'
                              }
                            </div>
                          )}
                          <div className="flex gap-4">
                            {map.specifications.curl_options && (
                              <span>Curl: {map.specifications.curl_options}</span>
                            )}
                            {map.specifications.diameter && (
                              <span>Diameter: {map.specifications.diameter}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(map)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(map.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { ProtectedRoute } from '@/components/ProtectedRoute'

interface LashMapPreview {
  name: string
  category: string
  difficulty: string
  description: string
  zones: Array<{
    zone: string
    length: string
    curl: string
    diameter: string
  }>
  products: string[]
  application_notes: string
}

interface ImportResult {
  created: number
  updated: number
  skipped: number
  errors: string[]
  details: Array<{
    name: string
    action: 'created' | 'updated' | 'skipped' | 'error'
    message?: string
  }>
}

export default function LashMapsImportPage() {
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [preview, setPreview] = useState<LashMapPreview[]>([])
  const [importMode, setImportMode] = useState<'update' | 'skip' | 'create-only'>('update')
  const [result, setResult] = useState<ImportResult | null>(null)

  const loadPreview = async () => {
    setPreviewLoading(true)
    try {
      const response = await fetch('/api/lash-maps/import/preview')
      const data = await response.json()
      
      if (data.success) {
        setPreview(data.maps)
      } else {
        alert(`Failed to load preview: ${data.error}`)
      }
    } catch (error) {
      console.error('Error loading preview:', error)
      alert('Failed to load preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  const runImport = async () => {
    if (!confirm(`Are you sure you want to import ${preview.length} lash maps with mode: ${importMode}?`)) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/lash-maps/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: importMode })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.result)
      } else {
        alert(`Import failed: ${data.error}`)
      }
    } catch (error) {
      console.error('Error importing:', error)
      alert('Failed to import lash maps')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link
              href="/dashboard/tech/lash-maps/admin"
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Admin
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Import Lash Maps
            </h1>
            <p className="text-xl text-gray-600">
              Import lash maps from perplexityresults.json
            </p>
          </div>

          {/* Import Controls */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="space-y-6">
              {/* Import Mode Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Import Mode
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setImportMode('update')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importMode === 'update'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <RefreshCw className={`w-6 h-6 mx-auto mb-2 ${
                      importMode === 'update' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Update Existing</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Update existing maps, create new ones
                    </div>
                  </button>

                  <button
                    onClick={() => setImportMode('skip')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importMode === 'skip'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <AlertCircle className={`w-6 h-6 mx-auto mb-2 ${
                      importMode === 'skip' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Skip Duplicates</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Only create new maps, skip existing
                    </div>
                  </button>

                  <button
                    onClick={() => setImportMode('create-only')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      importMode === 'create-only'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Upload className={`w-6 h-6 mx-auto mb-2 ${
                      importMode === 'create-only' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                    <div className="font-semibold">Create New Only</div>
                    <div className="text-sm text-gray-600 mt-1">
                      Only create, error on duplicates
                    </div>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={loadPreview}
                  disabled={previewLoading || loading}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {previewLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full inline-block mr-2"></div>
                      Loading Preview...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 inline-block mr-2" />
                      Preview Maps
                    </>
                  )}
                </button>

                <button
                  onClick={runImport}
                  disabled={loading || previewLoading || preview.length === 0}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 inline-block mr-2" />
                      Import {preview.length > 0 ? `${preview.length} Maps` : 'Lash Maps'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          {preview.length > 0 && !result && (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Preview: {preview.length} Maps
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {preview.map((map, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{map.name}</h3>
                    <div className="text-sm space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-800">
                          {map.category}
                        </span>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                          {map.difficulty}
                        </span>
                      </div>
                      <p className="text-gray-600 line-clamp-2">{map.description}</p>
                      <div className="text-xs text-gray-500">
                        {map.zones.length} zones • {map.products.length} products
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Import Results */}
          {result && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-center mb-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Import Complete!
                </h2>
              </div>

              {/* Summary Stats */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="text-center p-6 bg-green-50 rounded-xl">
                  <div className="text-3xl font-bold text-green-600">{result.created}</div>
                  <div className="text-gray-600">Created</div>
                </div>
                <div className="text-center p-6 bg-blue-50 rounded-xl">
                  <div className="text-3xl font-bold text-blue-600">{result.updated}</div>
                  <div className="text-gray-600">Updated</div>
                </div>
                <div className="text-center p-6 bg-yellow-50 rounded-xl">
                  <div className="text-3xl font-bold text-yellow-600">{result.skipped}</div>
                  <div className="text-gray-600">Skipped</div>
                </div>
                <div className="text-center p-6 bg-red-50 rounded-xl">
                  <div className="text-3xl font-bold text-red-600">{result.errors.length}</div>
                  <div className="text-gray-600">Errors</div>
                </div>
              </div>

              {/* Detailed Results */}
              {result.details.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Import Details</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {result.details.map((detail, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          detail.action === 'created' ? 'bg-green-50' :
                          detail.action === 'updated' ? 'bg-blue-50' :
                          detail.action === 'skipped' ? 'bg-yellow-50' :
                          'bg-red-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {detail.action === 'created' && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {detail.action === 'updated' && <RefreshCw className="w-5 h-5 text-blue-600" />}
                          {detail.action === 'skipped' && <AlertCircle className="w-5 h-5 text-yellow-600" />}
                          {detail.action === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                          <div>
                            <div className="font-semibold">{detail.name}</div>
                            {detail.message && (
                              <div className="text-sm text-gray-600">{detail.message}</div>
                            )}
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          detail.action === 'created' ? 'bg-green-100 text-green-800' :
                          detail.action === 'updated' ? 'bg-blue-100 text-blue-800' :
                          detail.action === 'skipped' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {detail.action}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Errors */}
              {result.errors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Errors</h3>
                  <div className="space-y-2">
                    {result.errors.map((error, index) => (
                      <div key={index} className="p-3 bg-red-50 rounded-lg text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setResult(null)
                    setPreview([])
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Import Again
                </button>
                <Link
                  href="/dashboard/tech/lash-maps"
                  className="flex-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all text-center"
                >
                  View All Lash Maps
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}


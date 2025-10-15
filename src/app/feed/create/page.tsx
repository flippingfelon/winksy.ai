'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Profile, LashMap } from '@/types/database'
import {
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  X,
  Sparkles,
  Loader2
} from 'lucide-react'

export default function CreatePostPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [lashMaps, setLashMaps] = useState<LashMap[]>([])
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [postType, setPostType] = useState<'look' | 'tutorial' | 'tip' | 'before-after'>('look')
  const [selectedMapId, setSelectedMapId] = useState<string>('')
  const [isTechOnly, setIsTechOnly] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      if (user?.id) {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile(profileData)
          // Only show tech-only toggle if user is a tech
          if (!profileData.roles.includes('tech')) {
            setIsTechOnly(false)
          }
        }

        // Fetch lash maps for tagging
        const { data: mapsData } = await supabase
          .from('lash_maps')
          .select('*')
          .order('name')
        
        if (mapsData) setLashMaps(mapsData)
      }
    }

    fetchData()
  }, [user, supabase])

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert('Image size must be less than 10MB')
        return
      }

      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!user || !imageFile) {
      alert('Please select an image')
      return
    }

    setLoading(true)

    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      const filePath = `posts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('feed-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        // If bucket doesn't exist, show helpful error
        if (uploadError.message.includes('not found')) {
          alert('Storage bucket not set up yet. Please create a "feed-images" bucket in Supabase Storage.')
          setLoading(false)
          return
        }
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('feed-images')
        .getPublicUrl(filePath)

      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption,
          post_type: postType,
          lash_map_id: selectedMapId || null,
          is_tech_only: isTechOnly && profile?.roles.includes('tech')
        })

      if (postError) throw postError

      // Award points for posting
      await supabase
        .from('points')
        .insert({
          user_id: user.id,
          amount: 100,
          reason: 'Created a post',
          reference_type: 'post'
        })

      // Update profile points
      if (profile) {
        await supabase
          .from('profiles')
          .update({ points: (profile.points || 0) + 100 })
          .eq('id', user.id)
      }

      // Success! Redirect to feed
      router.push('/feed')
    } catch (error) {
      console.error('Error creating post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href="/feed" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Create Post
              </h1>
              <button
                onClick={handleSubmit}
                disabled={loading || !imageFile}
                className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
              >
                {loading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </header>

        {/* Form Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Upload Photo</h3>
              
              {imagePreview ? (
                <div className="relative">
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900 mb-1">Upload a photo</p>
                      <p className="text-sm text-gray-600">Click to select or drag and drop</p>
                      <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 10MB</p>
                    </div>
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Upload className="w-5 h-5" />
                      <span className="text-sm font-medium">Choose File</span>
                    </div>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Caption */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Caption</h3>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption... Share your lash story! ✨"
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
            </div>

            {/* Post Type */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Post Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'look', label: 'Lash Look', emoji: '✨' },
                  { value: 'tutorial', label: 'Tutorial', emoji: '📚' },
                  { value: 'tip', label: 'Tip', emoji: '💡' },
                  { value: 'before-after', label: 'Before/After', emoji: '🔄' }
                ].map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setPostType(type.value as typeof postType)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      postType === type.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl mb-2 block">{type.emoji}</span>
                    <span className="font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tag Lash Map */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold">Tag Lash Map (Optional)</h3>
              </div>
              <select
                value={selectedMapId}
                onChange={(e) => setSelectedMapId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">No lash map</option>
                {lashMaps.map((map) => (
                  <option key={map.id} value={map.id}>
                    {map.name} - {map.category}
                  </option>
                ))}
              </select>
            </div>

            {/* Tech Only Toggle */}
            {profile?.roles.includes('tech') && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Techs Only</h3>
                    <p className="text-sm text-gray-600">Only visible to lash technicians</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isTechOnly}
                      onChange={(e) => setIsTechOnly(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      onClick={() => setIsTechOnly(!isTechOnly)}
                      className={`w-14 h-8 rounded-full transition-colors ${
                        isTechOnly ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                          isTechOnly ? 'translate-x-7 ml-1' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </div>
                </label>
              </div>
            )}

            {/* Points Reward Info */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Earn 100 Points!</p>
                  <p className="text-sm text-gray-600">Post to earn points and level up</p>
                </div>
              </div>
            </div>

            {/* Submit Button (Mobile) */}
            <button
              type="submit"
              disabled={loading || !imageFile}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Share with Community</span>
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  )
}



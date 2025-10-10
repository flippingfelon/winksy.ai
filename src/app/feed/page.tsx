'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { createClient } from '@/utils/supabase'
import { Post, Profile, LashMap } from '@/types/database'
import {
  Sparkles,
  Heart,
  MessageCircle,
  Share2,
  Plus,
  ArrowLeft,
  Camera,
  MoreVertical
} from 'lucide-react'

type FeedFilter = 'for-you' | 'following' | 'techs-only' | 'tutorials'

interface PostWithAuthor extends Post {
  author: Profile
  lash_map?: LashMap | null
  user_has_liked?: boolean
}

export default function FeedPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<PostWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('for-you')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [setupNeeded, setSetupNeeded] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (data) setProfile(data)
      }
    }

    fetchProfile()
  }, [user, supabase])

  useEffect(() => {
    fetchPosts()
  }, [activeFilter, user, supabase])

  async function fetchPosts() {
    setLoading(true)
    try {
      // First, check if the posts table exists
      const { error: tableCheckError } = await supabase
        .from('posts')
        .select('id')
        .limit(1)

      if (tableCheckError) {
        console.error('Posts table does not exist. Please run the migration first.')
        console.error('Run: See LASH_FEED_SETUP.md for instructions')
        console.error('Error details:', tableCheckError)
        setSetupNeeded(true)
        setPosts([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(id, full_name, avatar_url, roles),
          lash_maps(id, name, category)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply filters
      if (activeFilter === 'techs-only') {
        query = query.eq('is_tech_only', true)
      } else if (activeFilter === 'tutorials') {
        query = query.in('post_type', ['tutorial', 'tip'])
      } else if (activeFilter === 'following') {
        // Get users that current user is following
        const { data: follows, error: followsError } = await supabase
          .from('user_follows')
          .select('following_id')
          .eq('follower_id', user?.id || '')

        if (followsError) {
          console.warn('Could not fetch follows:', followsError)
          setPosts([])
          setLoading(false)
          return
        }

        if (follows && follows.length > 0) {
          const followingIds = follows.map(f => f.following_id)
          query = query.in('user_id', followingIds)
        } else {
          // No follows yet, show empty
          setPosts([])
          setLoading(false)
          return
        }
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching posts:', error)
        console.error('Error code:', error.code)
        console.error('Error message:', error.message)
        console.error('Error details:', error.details)
        setPosts([])
        setLoading(false)
        return
      }

      if (!data || data.length === 0) {
        setPosts([])
        setLoading(false)
        return
      }

      // Fetch like status for each post
      const postsWithLikes = await Promise.all(
        data.map(async (post) => {
          const { data: likeData } = await supabase
            .from('post_likes')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user?.id || '')
            .maybeSingle() // Use maybeSingle instead of single to avoid error if not found

          return {
            ...post,
            author: post.profiles || null,
            lash_map: post.lash_maps || null,
            user_has_liked: !!likeData
          } as PostWithAuthor
        })
      )

      setPosts(postsWithLikes)
    } catch (error) {
      console.error('Error fetching posts:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
      }
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  async function toggleLike(postId: string, currentlyLiked: boolean) {
    if (!user) return

    try {
      if (currentlyLiked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id })
      }

      // Update local state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              user_has_liked: !currentlyLiked,
              likes_count: currentlyLiked ? post.likes_count - 1 : post.likes_count + 1
            }
          : post
      ))
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  async function sharePost(postId: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this lash look on Winksy!',
          url: `${window.location.origin}/feed?post=${postId}`
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/feed?post=${postId}`)
      alert('Link copied to clipboard!')
    }
  }

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return `${Math.floor(seconds / 604800)}w ago`
  }

  const filters: { id: FeedFilter; label: string }[] = [
    { id: 'for-you', label: 'For You' },
    { id: 'following', label: 'Following' },
    { id: 'techs-only', label: 'Techs Only' },
    { id: 'tutorials', label: 'Tips & Tutorials' }
  ]

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link href={profile?.active_role === 'tech' ? '/dashboard/tech' : '/dashboard'} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-2">
                <Camera className="w-6 h-6 text-purple-600" />
                <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Lash Feed
                </h1>
              </div>
              <div className="w-10" /> {/* Spacer for alignment */}
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 overflow-x-auto no-scrollbar pb-3">
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeFilter === filter.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Feed Content */}
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
          {/* Setup Needed Banner */}
          {setupNeeded && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-6 mb-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    🚀 Setup Required: Database Tables Not Found
                  </h3>
                  <p className="text-gray-700 mb-4">
                    The Lash Feed database tables need to be created before you can use this feature.
                  </p>
                  <div className="bg-white rounded-lg p-4 mb-4 border border-yellow-200">
                    <p className="font-semibold text-gray-900 mb-2">Quick Setup:</p>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                      <li>Open your <strong>Supabase Dashboard</strong></li>
                      <li>Go to <strong>SQL Editor</strong></li>
                      <li>Copy the contents from <code className="bg-gray-100 px-2 py-1 rounded">create_feed_tables.sql</code></li>
                      <li>Paste and click <strong>Run</strong></li>
                      <li>Create a storage bucket named <code className="bg-gray-100 px-2 py-1 rounded">feed-images</code> (set to Public)</li>
                      <li>Refresh this page</li>
                    </ol>
                  </div>
                  <p className="text-sm text-gray-600">
                    📖 For detailed instructions, see <code className="bg-gray-100 px-2 py-1 rounded text-purple-600">LASH_FEED_SETUP.md</code>
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-10 h-10 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-6">
                {activeFilter === 'following' 
                  ? "Follow some users to see their posts here!"
                  : "Be the first to share your lash looks!"}
              </p>
              <Link
                href="/feed/create"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="w-5 h-5" />
                <span>Create Post</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map(post => (
                <article key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {post.author?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{post.author?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-500">{formatTimeAgo(post.created_at)}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <MoreVertical className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  {/* Post Image */}
                  <div className="relative w-full aspect-square bg-gray-100">
                    <Image
                      src={post.image_url}
                      alt={post.caption || 'Lash photo'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 672px"
                    />
                  </div>

                  {/* Post Actions */}
                  <div className="p-4">
                    <div className="flex items-center space-x-4 mb-3">
                      <button
                        onClick={() => toggleLike(post.id, post.user_has_liked || false)}
                        className="flex items-center space-x-1 group"
                      >
                        <Heart
                          className={`w-6 h-6 transition-all ${
                            post.user_has_liked
                              ? 'fill-red-500 text-red-500'
                              : 'text-gray-700 group-hover:text-red-500'
                          }`}
                        />
                        <span className="text-sm font-medium">{post.likes_count}</span>
                      </button>
                      <button className="flex items-center space-x-1 group">
                        <MessageCircle className="w-6 h-6 text-gray-700 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-medium">{post.comments_count}</span>
                      </button>
                      <button
                        onClick={() => sharePost(post.id)}
                        className="flex items-center space-x-1 group ml-auto"
                      >
                        <Share2 className="w-6 h-6 text-gray-700 group-hover:text-green-500 transition-colors" />
                      </button>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                      <p className="text-gray-900 mb-2">
                        <span className="font-semibold mr-2">{post.author?.full_name}</span>
                        {post.caption}
                      </p>
                    )}

                    {/* Lash Map Tag */}
                    {post.lash_map && (
                      <Link
                        href={`/dashboard/tech/lash-maps/${post.lash_map.id}`}
                        className="inline-flex items-center space-x-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>{post.lash_map.name}</span>
                      </Link>
                    )}

                    {/* Post Type Badge */}
                    <div className="mt-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        post.post_type === 'tutorial' ? 'bg-blue-100 text-blue-800' :
                        post.post_type === 'tip' ? 'bg-green-100 text-green-800' :
                        post.post_type === 'before-after' ? 'bg-purple-100 text-purple-800' :
                        'bg-pink-100 text-pink-800'
                      }`}>
                        {post.post_type}
                      </span>
                      {post.is_tech_only && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Techs Only
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>

        {/* Floating Create Button */}
        <Link
          href="/feed/create"
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-3xl transition-all hover:scale-110 z-40"
        >
          <Plus className="w-8 h-8 text-white" />
        </Link>
      </div>
    </ProtectedRoute>
  )
}


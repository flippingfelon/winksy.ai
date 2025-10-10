# Lash Feed Setup Guide

## Overview
The Lash Feed is an Instagram-style social feature that allows users to share their lash looks, tutorials, and tips with the community.

## Features Implemented ✨

### 1. **Feed Page** (`/feed`)
- Instagram-style scrolling feed
- Filter tabs: 'For You' | 'Following' | 'Techs Only' | 'Tips & Tutorials'
- Real-time like/comment counts
- Post type badges
- Tagged lash maps (clickable)
- Mobile-responsive design
- Smooth scrolling with image optimization

### 2. **Create Post Page** (`/feed/create`)
- Photo upload with preview
- Caption text area
- Post type selection (Look, Tutorial, Tip, Before/After)
- Tag lash map (optional dropdown)
- "Techs Only" toggle (for lash technicians)
- Points reward (100 points per post)
- Image validation (10MB max)

### 3. **Navigation**
- Camera icon added to both dashboards
- Tooltip on hover
- Always visible and accessible
- Quick access from any page

### 4. **Database Tables**
- `posts` - Store all feed posts
- `post_likes` - Track user likes
- `post_comments` - Store comments
- `user_follows` - Follow relationships
- Automatic counters with triggers
- Row Level Security (RLS) policies

## Setup Instructions

### Step 1: Run Database Migration

You need to create the database tables in Supabase. Choose one method:

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `create_feed_tables.sql`
4. Paste and run it in the SQL Editor

#### Option B: Using Command Line
```bash
# Run the migration script
node run-feed-migration.js
```

### Step 2: Create Storage Bucket

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named **`feed-images`**
3. Set it to **Public** bucket
4. Configure policies:
   - Allow authenticated users to upload
   - Allow everyone to read

### Step 3: Configure Storage Policies (Optional)

Run this SQL to set up storage policies:

```sql
-- Allow authenticated users to upload their own images
INSERT INTO storage.policies (bucket_id, name, definition, check_permission)
VALUES (
  'feed-images',
  'Users can upload their own images',
  '(bucket_id = ''feed-images''::text) AND (auth.uid()::text = (storage.foldername(name))[1])',
  'INSERT'
);

-- Allow public access to read images
INSERT INTO storage.policies (bucket_id, name, definition, check_permission)
VALUES (
  'feed-images',
  'Public can view images',
  '(bucket_id = ''feed-images''::text)',
  'SELECT'
);
```

### Step 4: Test the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to your dashboard (consumer or tech)

3. Look for the **Camera icon** in the top navigation

4. Click it to access the Lash Feed

5. Click the **floating + button** to create your first post

## Usage Guide

### For Consumers
- Share your lash looks
- Follow favorite techs
- Like and comment on posts
- Earn 100 points per post
- Discover new styles and tips

### For Lash Technicians
- Share tutorials and tips
- Tag lash maps in posts
- Toggle "Techs Only" for professional content
- Build following and showcase work
- Connect with other techs

## Mobile Experience
- Fully responsive design
- Touch-friendly interactions
- Optimized image loading
- Smooth scrolling feed
- Native share functionality

## Points & Gamification
- **+100 points** for creating a post
- Points automatically added to profile
- Progress tracked toward next level

## Database Schema

### Posts Table
- `id` - UUID primary key
- `user_id` - Reference to auth.users
- `image_url` - Post image URL
- `caption` - Post caption text
- `post_type` - 'look' | 'tutorial' | 'tip' | 'before-after'
- `lash_map_id` - Optional reference to lash_maps
- `likes_count` - Auto-updated counter
- `comments_count` - Auto-updated counter
- `is_tech_only` - Boolean flag
- `tenant_id` - Multi-tenant support
- `created_at`, `updated_at` - Timestamps

### Post Likes Table
- `id` - UUID primary key
- `post_id` - Reference to posts
- `user_id` - Reference to auth.users
- `created_at` - Timestamp
- Unique constraint on (post_id, user_id)

### Post Comments Table
- `id` - UUID primary key
- `post_id` - Reference to posts
- `user_id` - Reference to auth.users
- `comment_text` - Comment content
- `created_at`, `updated_at` - Timestamps

### User Follows Table
- `id` - UUID primary key
- `follower_id` - User who follows
- `following_id` - User being followed
- `created_at` - Timestamp
- Unique constraint on (follower_id, following_id)

## Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only create/edit/delete their own content
- Everyone can view public posts
- Secure by default

### Image Upload Security
- 10MB file size limit
- Image validation on client
- Secure Supabase Storage
- Unique filenames to prevent conflicts

## Future Enhancements
- [ ] Comment functionality on posts
- [ ] Video support
- [ ] Stories (24-hour posts)
- [ ] Hashtags and search
- [ ] User profiles with post grids
- [ ] Follow/unfollow buttons
- [ ] Notifications for likes/comments
- [ ] Explore page algorithm
- [ ] Save/bookmark posts
- [ ] Direct messaging

## Troubleshooting

### Issue: "Storage bucket not found"
**Solution:** Create the `feed-images` bucket in Supabase Storage (Step 2)

### Issue: "Cannot upload images"
**Solution:** Check storage policies and ensure bucket is public

### Issue: "Feed not loading"
**Solution:** Verify database tables are created (Step 1)

### Issue: "No posts showing"
**Solution:** Create your first post! The feed needs content.

## Support
For issues or questions, check the main README or contact support.

---

**Built with:** Next.js 15, React 19, Supabase, TailwindCSS
**Theme:** Pink & Purple gradient (Winksy brand colors)


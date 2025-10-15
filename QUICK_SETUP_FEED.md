# 🚀 Quick Setup: Lash Feed Database

## You're seeing an error? Here's the fix!

The error `Error fetching posts: {}` means the database tables haven't been created yet.

---

## ⚡ 3-Minute Setup

### Step 1: Open Supabase SQL Editor
1. Go to [app.supabase.com](https://app.supabase.com)
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Click **"New query"**

### Step 2: Copy & Run the SQL
1. Open the file: **`create_feed_tables.sql`** (in your project root)
2. Copy **all** the contents
3. Paste into the Supabase SQL Editor
4. Click **"Run"** (or press Cmd/Ctrl + Enter)

✅ You should see: **"Success. No rows returned"**

### Step 3: Create Storage Bucket
1. In Supabase Dashboard, go to **"Storage"**
2. Click **"Create a new bucket"**
3. Bucket name: `feed-images`
4. **Important:** Set it to **Public** bucket
5. Click **"Create bucket"**

### Step 4: Test
1. Go back to your app: `/feed`
2. Refresh the page (Cmd/Ctrl + R)
3. The error should be gone! 🎉
4. Click the floating **+** button to create your first post

---

## 🔍 Verify Setup

Run this in Supabase SQL Editor to check:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('posts', 'post_likes', 'post_comments', 'user_follows');

-- Should return 4 rows
```

---

## 💡 What Gets Created

### Tables:
- ✅ `posts` - Feed posts
- ✅ `post_likes` - Like system
- ✅ `post_comments` - Comments
- ✅ `user_follows` - Follow relationships

### Features:
- ✅ Row Level Security (RLS)
- ✅ Automatic like/comment counters
- ✅ Indexes for performance
- ✅ Secure policies

### Storage:
- ✅ `feed-images` bucket for photos

---

## ❌ Troubleshooting

### "Error: relation does not exist"
**Fix:** Run the SQL migration (Step 2 above)

### "Storage bucket not found"
**Fix:** Create the `feed-images` bucket (Step 3 above)

### "Permission denied"
**Fix:** Make sure you're logged in and the RLS policies are created

### SQL fails to run
**Try:**
1. Make sure you copied **all** the SQL
2. Run it as one query (don't split it)
3. Check for any error messages in red

### Still having issues?
1. Check the console for detailed error messages
2. See `LASH_FEED_SETUP.md` for full documentation
3. Verify your Supabase URL and keys in `.env.local`

---

## 📁 File Locations

```
create_feed_tables.sql          ← SQL migration (run in Supabase)
LASH_FEED_SETUP.md             ← Full setup guide
LASH_FEED_SUMMARY.md           ← Technical details
src/app/feed/page.tsx          ← Feed page
src/app/feed/create/page.tsx   ← Create post page
```

---

## ✅ After Setup

Once the setup is complete:

1. **View Feed:** Click the Camera icon (📷) in header
2. **Create Post:** Click the floating + button
3. **Upload Photo:** Select or drag an image
4. **Write Caption:** Add text to your post
5. **Post:** Earn 100 points! 🎉

---

## 🎯 Next Features to Add

After basic setup works:
- [ ] Comment functionality
- [ ] Follow/unfollow buttons
- [ ] User profiles
- [ ] Notifications
- [ ] Video support

---

**Need more help?** See `LASH_FEED_SETUP.md` for detailed instructions.

**Ready to test?** Go to `/feed` and start posting! 📸✨



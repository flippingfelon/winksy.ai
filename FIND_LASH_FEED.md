# 📸 Where to Find the Lash Feed

## Quick Access

The **Lash Feed** is accessible from any dashboard via the **Camera icon** 📷 in the top navigation bar.

## Visual Location Guide

### Consumer Dashboard
```
┌────────────────────────────────────────────────────────────┐
│  [Winksy Logo]  Winksy.ai        [Switch] 📷 🔔 ⚙️ [Profile] │
│                                   ↑                         │
│                              Lash Feed                      │
└────────────────────────────────────────────────────────────┘
```

### Tech Dashboard
```
┌────────────────────────────────────────────────────────────┐
│  [Winksy Logo]  Winksy.ai        [Switch] 📷 🔔 ⚙️ [Profile] │
│                Tech Dashboard             ↑                │
│                                      Lash Feed              │
└────────────────────────────────────────────────────────────┘
```

## Navigation Path

### Option 1: Header Navigation (Recommended)
1. Log in to your account
2. Look at the **top-right** of the screen
3. Find the **Camera icon** (📷) between Role Switcher and Bell icon
4. Click the Camera icon
5. You're now in the Lash Feed!

### Option 2: Direct URL
Simply navigate to: **`/feed`**

## What You'll See

### Feed Page (`/feed`)
```
╔═══════════════════════════════════════════════╗
║  ← Lash Feed 📷                              ║
║                                               ║
║  [For You] [Following] [Techs Only] [Tips]   ║
╠═══════════════════════════════════════════════╣
║                                               ║
║  ┌─────────────────────────────────┐         ║
║  │ 👤 Username         2h ago      │         ║
║  ├─────────────────────────────────┤         ║
║  │                                 │         ║
║  │       [Lash Photo]              │         ║
║  │                                 │         ║
║  ├─────────────────────────────────┤         ║
║  │ ❤️ 23  💬 5  ↗️                 │         ║
║  │                                 │         ║
║  │ Caption text here...            │         ║
║  │ 🌟 Natural Wispy                │         ║
║  └─────────────────────────────────┘         ║
║                                               ║
║  [More posts...]                             ║
║                                               ║
║                                       [➕]    ║
╚═══════════════════════════════════════════════╝
                                           ↑
                                     Floating + Button
                                   (Create New Post)
```

## Icon Details

### Camera Icon Appearance
- **Icon:** 📷 Camera/Photo icon from Lucide React
- **Color:** Gray (default), turns darker on hover
- **Size:** 20x20 pixels (w-5 h-5)
- **Tooltip:** Shows "Lash Feed" on hover
- **Position:** Header navigation, between Role Switcher and Bell icon

### On Hover
```
        📷
    ┌─────────┐
    │Lash Feed│
    └─────────┘
```

## Quick Actions in Feed

### View Posts
- Scroll through the feed
- Switch between filter tabs
- Like posts with ❤️ button
- View comments count 💬
- Share posts ↗️

### Create Post
1. Click the **floating + button** (bottom-right corner)
2. Upload a photo
3. Write caption
4. Select post type
5. Tag a lash map (optional)
6. Click "Post"
7. Earn 100 points! 🎉

## Filter Tabs Explained

### 📱 For You (Default)
- Curated posts for your interests
- Mix of techs and consumers
- All post types

### 👥 Following
- Posts from users you follow
- Stay connected with favorite techs
- Empty until you follow someone

### 💼 Techs Only
- Professional content
- Tech-to-tech communication
- Industry insights and tips

### 📚 Tips & Tutorials
- Educational content
- How-to guides
- Professional techniques
- Beginner-friendly

## First Time Using?

### If You Don't See Any Posts
The feed is empty! Be the first to post:
1. Click the **floating + button**
2. Share your lash look
3. Start the community

### If You Can't Find the Camera Icon
Make sure you're:
- ✅ Logged in to your account
- ✅ On the dashboard page (not landing page)
- ✅ Using a supported browser
- ✅ Looking in the **top-right header**

## Mobile View

On mobile devices, the navigation is more compact:

```
┌──────────────────────────┐
│ [≡] Winksy.ai   [Switch] │
│                 📷 🔔 👤 │
│                 ↑         │
│            Lash Feed      │
└──────────────────────────┘
```

The Camera icon is still in the same relative position!

## Browser Support

The Lash Feed works on:
- ✅ Chrome/Edge (recommended)
- ✅ Safari
- ✅ Firefox
- ✅ Mobile browsers (iOS Safari, Chrome)

## Feature Status

### ✅ Working Now
- View feed
- Filter by category
- Like posts
- Create posts
- Upload images
- Tag lash maps
- Share posts
- Earn points

### 🔜 Coming Soon
- Comment on posts
- Follow/unfollow users
- User profiles
- Notifications
- Stories
- Video support

## Troubleshooting

### "I don't see the Camera icon"
**Check:**
1. Are you logged in?
2. Are you on `/dashboard` or `/dashboard/tech`?
3. Try refreshing the page
4. Clear browser cache

### "Feed page is blank"
**Solutions:**
1. Database tables may not be created yet
2. Run the migration: See `LASH_FEED_SETUP.md`
3. Create the first post!

### "Can't upload images"
**Check:**
1. Storage bucket `feed-images` exists in Supabase
2. Bucket is set to Public
3. Image is under 10MB
4. File is an image (JPG, PNG, etc.)

## Need Help?

Refer to these files:
- **Setup:** `LASH_FEED_SETUP.md`
- **Summary:** `LASH_FEED_SUMMARY.md`
- **SQL Migration:** `create_feed_tables.sql`

---

**Happy posting! 📸✨**


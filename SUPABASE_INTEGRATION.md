# Supabase Integration Guide for Winksy.ai

## 🎯 **Integration Overview**

This guide will help you integrate Supabase authentication and database features into your Winksy.ai app.

## 📋 **Prerequisites**

1. **Supabase Project** - Created at [supabase.com](https://supabase.com)
2. **Environment Variables** - Added to your deployment platform
3. **Database Schema** - Run the SQL from `supabase-schema.sql`

## 🔧 **Step 1: Install Supabase Client**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

✅ **Already installed** in your project.

## 🔧 **Step 2: Configure Environment Variables**

Create/update your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## 🔧 **Step 3: Set Up Authentication**

### Create Auth Context (Already Done)
- ✅ `src/contexts/AuthContext.tsx` - Handles user authentication
- ✅ Integrates with Supabase Auth

### Update Auth Pages

1. **Sign In Page** (`src/app/auth/signin/page.tsx`)
2. **Sign Up Page** (`src/app/auth/signup/page.tsx`)

## 🔧 **Step 4: Database Integration**

### Tables to Connect:

1. **`profiles`** - User profiles linked to auth
2. **`lash_techs`** - Professional technician profiles
3. **`services`** - Services offered by techs
4. **`bookings`** - Appointment bookings
5. **`points`** - Gamification points system
6. **`user_levels`** - User levels and achievements
7. **`reviews`** - Rating and review system

### API Routes to Create:

- `src/app/api/auth/callback/route.ts` - OAuth callback
- `src/app/api/bookings/route.ts` - Booking management
- `src/app/api/points/route.ts` - Points system
- `src/app/api/profile/route.ts` - User profile management

## 🔧 **Step 5: Real-time Features**

### Enable Real-time for:
- Live booking availability
- Real-time notifications
- Live user stats updates
- Chat/messaging features

## 🚀 **Implementation Plan**

### Phase 1: Core Authentication (Today)
- [ ] Connect Supabase client
- [ ] Implement sign up/sign in
- [ ] User profile creation
- [ ] Protected routes

### Phase 2: Database Integration (Next)
- [ ] User profiles management
- [ ] Lash tech profiles
- [ ] Booking system
- [ ] Points and rewards

### Phase 3: Real-time Features (Future)
- [ ] Live availability updates
- [ ] Real-time notifications
- [ ] Chat system
- [ ] Live dashboard updates

## 📝 **Current Status**

✅ **Ready for Integration:**
- Supabase client installed
- Database schema prepared
- Auth context created
- UI components built
- Environment configuration ready

🔄 **Next Steps:**
1. Get Supabase project URL and keys
2. Update environment variables
3. Test authentication flow
4. Connect database operations

## 🛠️ **Let's Start!**

Run the setup command to begin integration:

```bash
node setup-database.js
```

This will guide you through the Supabase setup process.

## 📚 **Resources**

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)







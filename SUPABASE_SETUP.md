# Supabase Setup Guide for Winksy.ai

## Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Fill in:
   - Project name: `winksy-ai`
   - Database password: (save this securely!)
   - Region: Choose closest to your users
5. Click "Create new project" and wait for setup

## Step 2: Run the Database Schema

1. Once your project is ready, go to the **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click "Run" to execute the schema

## Step 3: Get Your API Keys

1. Go to **Settings** → **API** in your Supabase dashboard
2. You'll need:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public key**: (safe for client-side)
   - **Service role key**: (keep secret, server-side only)

## Step 4: Configure Environment Variables

Create a `.env.local` file in the `winsky` directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Step 5: Enable Authentication Providers

1. Go to **Authentication** → **Providers** in Supabase
2. Enable:
   - **Email** (already enabled by default)
   - **Google**: 
     - Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/)
     - Add authorized redirect URL: `https://xxxxx.supabase.co/auth/v1/callback`
   - **Facebook**:
     - Get App ID and Secret from [Facebook Developers](https://developers.facebook.com/)
     - Add redirect URL to Facebook app

## Step 6: Configure Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize:
   - Confirmation email
   - Password reset email
   - Magic link email

## Step 7: Test the Connection

After setting up your `.env.local` file, restart your development server:

```bash
npm run dev
```

The app should now connect to your Supabase backend!

## Database Tables Created

- `profiles` - User profiles linked to auth
- `lash_techs` - Professional technician profiles
- `services` - Services offered by techs
- `bookings` - Appointment bookings
- `points` - Gamification points system
- `user_levels` - User levels and achievements
- `reviews` - Rating and review system

## Row Level Security (RLS)

All tables have RLS enabled with policies for:
- Public read access where appropriate
- User-specific write access
- Tech-specific service management

## Next Steps

1. Test user registration at `/auth/signup`
2. Verify profile creation in Supabase dashboard
3. Test booking flow
4. Implement points system logic

## Troubleshooting

If you get connection errors:
- Check your `.env.local` file has correct values
- Ensure no typos in environment variable names
- Restart the dev server after changing `.env.local`
- Check Supabase dashboard for any API issues

## Support

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)

#!/usr/bin/env node

/**
 * Supabase Database Setup Helper
 * This script helps you set up your Winksy.ai database
 */

const fs = require('fs');
const path = require('path');

console.log(`
╔════════════════════════════════════════════════╗
║     Welcome to Winksy.ai Database Setup! 🎉    ║
╚════════════════════════════════════════════════╝

This guide will help you set up your Supabase database.

📋 STEPS TO COMPLETE:
═══════════════════════════════════════════════════

1️⃣  CREATE SUPABASE PROJECT
   • Go to: https://supabase.com
   • Click "New Project"
   • Name it: winksy-ai
   • Save your database password!

2️⃣  RUN DATABASE SCHEMA
   • Open your Supabase dashboard
   • Go to SQL Editor (left sidebar)
   • Click "New query"
   • Copy contents from: supabase-schema.sql
   • Click "Run"

3️⃣  GET YOUR API KEYS
   • Go to Settings → API
   • Copy these values:
     - Project URL (looks like: https://xxxxx.supabase.co)
     - anon/public key (starts with: eyJ...)
     - service role key (keep secret!)

4️⃣  UPDATE YOUR .env.local FILE
   Add these lines to your .env.local:

   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

5️⃣  ENABLE AUTHENTICATION (Optional but recommended)
   • Go to Authentication → Providers
   • Enable Google OAuth
   • Enable Facebook OAuth

═══════════════════════════════════════════════════

📊 DATABASE TABLES THAT WILL BE CREATED:
• profiles - User profiles
• lash_techs - Technician profiles  
• services - Available services
• bookings - Appointments
• points - Gamification system
• user_levels - Achievement levels
• reviews - Ratings & feedback

🔒 SECURITY:
All tables have Row Level Security (RLS) enabled
to protect user data.

═══════════════════════════════════════════════════

After completing these steps:
1. Restart your dev server: npm run dev
2. Test signup at: http://localhost:3001/auth/signup
3. Check Supabase dashboard for new user

Need help? Check SUPABASE_SETUP.md for detailed instructions.
`);

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('your-project-ref') || envContent.includes('your_project_url_here')) {
    console.log('\n⚠️  WARNING: Your .env.local file needs to be updated with real Supabase credentials!\n');
  } else if (envContent.includes('NEXT_PUBLIC_SUPABASE_URL')) {
    console.log('\n✅ .env.local file found with Supabase configuration.\n');
  }
} else {
  console.log('\n⚠️  No .env.local file found. You need to create one!\n');
}







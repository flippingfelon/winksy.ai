# Deployment Guide for Winksy.ai

## 🚀 Quick Deploy Options

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub** (Already done!)
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `flippingfelon/winksy.ai`
   - Configure environment variables (see below)
   - Click "Deploy"

3. **Environment Variables in Vercel**
   Add these in the Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Option 2: Deploy to Netlify

1. **Push to GitHub** (Already done!)

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select `flippingfelon/winksy.ai`
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Add environment variables
   - Click "Deploy site"

3. **Environment Variables in Netlify**
   Add in Site settings → Environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## 📝 Pre-Deployment Checklist

### ✅ Code Preparation (Completed)
- [x] Homepage with responsive design
- [x] Authentication pages (signin/signup)
- [x] Dashboard with gamification
- [x] PWA configuration
- [x] Tailwind CSS styling
- [x] Environment variables setup

### 🔧 Supabase Setup (Required)
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in SQL Editor
3. Get API keys from Settings → API
4. Enable Authentication providers (Google, Facebook)

### 🌐 Domain Configuration
- Domain available: winksy.ai
- Configure in Vercel/Netlify dashboard
- Add custom domain after deployment

## 🎯 Post-Deployment Steps

1. **Test Authentication**
   - Sign up flow
   - Sign in flow
   - Password reset

2. **Verify PWA Installation**
   - Check manifest loading
   - Test "Add to Home Screen"
   - Verify offline capabilities

3. **Monitor Performance**
   - Check Lighthouse scores
   - Monitor Core Web Vitals
   - Set up error tracking (Sentry)

## 🚨 Important Notes

### GitHub Push Commands
If you need to configure Git credentials:

```bash
# Set up Git credentials
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

# For HTTPS authentication, use GitHub Personal Access Token
# Go to GitHub Settings → Developer settings → Personal access tokens
# Generate a new token with repo permissions
# Use the token as your password when pushing

# Alternative: Use SSH
git remote set-url origin git@github.com:flippingfelon/winksy.ai.git
```

### Build Configuration

**package.json scripts are ready:**
```json
"scripts": {
  "dev": "next dev --turbopack",
  "build": "next build",
  "start": "next start",
  "lint": "eslint"
}
```

### Environment Variables Template

Create these in your deployment platform:

```env
# Required for app to function
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional but recommended
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔗 Useful Links

- **Repository**: https://github.com/flippingfelon/winksy.ai
- **Vercel**: https://vercel.com/new
- **Netlify**: https://app.netlify.com/start
- **Supabase**: https://app.supabase.com

## 📱 PWA Testing

After deployment, test PWA features:
1. Visit your deployed site on mobile
2. Check for "Add to Home Screen" prompt
3. Test offline functionality
4. Verify app manifest is loading

## 🎉 Launch Checklist

- [ ] Supabase database configured
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificate active
- [ ] PWA installable
- [ ] Authentication working
- [ ] Mobile responsive
- [ ] SEO meta tags present

Once deployed, your app will be live and ready for users!

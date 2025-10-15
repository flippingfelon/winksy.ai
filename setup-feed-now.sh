#!/bin/bash

# Lash Feed Quick Setup Script
# This script helps you set up the Lash Feed database

echo "═══════════════════════════════════════════════════════════"
echo "   🎀 Lash Feed Quick Setup 🎀"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Check if SQL file exists
if [ ! -f "create_feed_tables.sql" ]; then
    echo "❌ Error: create_feed_tables.sql not found"
    echo "   Make sure you're in the project root directory"
    exit 1
fi

echo "✅ Found create_feed_tables.sql"
echo ""

echo "📋 Setup Instructions:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "STEP 1: Run SQL Migration"
echo "─────────────────────────"
echo "1. Open https://app.supabase.com"
echo "2. Select your project"
echo "3. Go to SQL Editor"
echo "4. Copy the SQL below and paste it"
echo "5. Click 'Run'"
echo ""

echo "STEP 2: Create Storage Bucket"
echo "──────────────────────────────"
echo "1. Go to Storage in Supabase"
echo "2. Create new bucket: 'feed-images'"
echo "3. Set it to PUBLIC"
echo "4. Save"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Ask if user wants to see the SQL
read -p "📄 Do you want to view the SQL now? (y/n): " show_sql

if [[ $show_sql =~ ^[Yy]$ ]]; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "SQL FILE CONTENTS (copy everything below):"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    cat create_feed_tables.sql
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
fi

echo ""
echo "💡 Quick Tips:"
echo "   • SQL file location: $(pwd)/create_feed_tables.sql"
echo "   • After running SQL, create the storage bucket"
echo "   • Refresh your app at /feed"
echo ""

# Ask if user wants to copy SQL to clipboard (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "📋 Copy SQL to clipboard? (macOS only) (y/n): " copy_sql
    
    if [[ $copy_sql =~ ^[Yy]$ ]]; then
        cat create_feed_tables.sql | pbcopy
        echo "✅ SQL copied to clipboard!"
        echo "   Now paste it into Supabase SQL Editor"
    fi
fi

echo ""
echo "📖 For detailed help, see:"
echo "   • QUICK_SETUP_FEED.md"
echo "   • LASH_FEED_SETUP.md"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "   Ready to launch! 🚀"
echo "═══════════════════════════════════════════════════════════"



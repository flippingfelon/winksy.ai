#!/bin/bash

echo "🚀 Winksy.ai Database Migration Script"
echo "====================================="
echo ""

# Check if we have the necessary tools
if ! command -v psql &> /dev/null; then
    echo "❌ psql not found. Please install PostgreSQL client tools."
    echo "Or use the Supabase SQL Editor method instead."
    exit 1
fi

# Check for database connection string
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  DATABASE_URL not found in environment."
    echo "Please set DATABASE_URL or use the Supabase SQL Editor method."
    echo ""
    echo "Example: export DATABASE_URL='postgresql://postgres:[password]@[host]:5432/postgres'"
    exit 1
fi

echo "📋 Migration Steps:"
echo "1. Basic tables (profiles, lash_techs, services, bookings, points, user_levels, reviews)"
echo "2. Tenants table"
echo "3. Row Level Security (RLS) policies"
echo "4. Functions and triggers"
echo ""

read -p "Continue with migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Step 1: Creating basic tables..."
if psql "$DATABASE_URL" -f migration-step-1-tables.sql; then
    echo "✅ Step 1 completed successfully"
else
    echo "❌ Step 1 failed"
    exit 1
fi

echo ""
echo "Step 2: Creating tenants table..."
if psql "$DATABASE_URL" -f migration-step-2-tenants.sql; then
    echo "✅ Step 2 completed successfully"
else
    echo "❌ Step 2 failed"
    exit 1
fi

echo ""
echo "Step 3: Setting up RLS policies..."
if psql "$DATABASE_URL" -f migration-step-3-rls.sql; then
    echo "✅ Step 3 completed successfully"
else
    echo "❌ Step 3 failed"
    exit 1
fi

echo ""
echo "Step 4: Creating functions and triggers..."
if psql "$DATABASE_URL" -f migration-step-4-triggers.sql; then
    echo "✅ Step 4 completed successfully"
else
    echo "❌ Step 4 failed"
    exit 1
fi

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "🔍 Verifying schema..."
psql "$DATABASE_URL" -c "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'tenants', 'lash_techs', 'services', 'bookings', 'points', 'user_levels', 'reviews')
ORDER BY table_name;
"

echo ""
echo "Checking if 'level' column exists in profiles table..."
psql "$DATABASE_URL" -c "
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'profiles' AND column_name = 'level';
"







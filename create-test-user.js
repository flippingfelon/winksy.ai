// Quick script to create a test user account
// Run with: node create-test-user.js

const { createClient } = require('@supabase/supabase-js');

// Hardcoded for this demo - replace with your actual values
const supabaseUrl = 'https://ixtfidglwgmapwcgdhlq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dGZpZGdsd2dtYXB3Y2dkaGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NTY4NywiZXhwIjoyMDc0NjcxNjg3fQ.neCKI0h4rX94ZxYU5UrcCEPmX9X0ncKUHfMzSL7HgiM';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUser() {
  const testEmail = 'test@winksy.ai';
  const testPassword = 'testpassword123';

  try {
    console.log('Creating test user account...');

    // Check if user already exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers.users.some(user => user.email === testEmail);

    if (userExists) {
      console.log('✅ Test user already exists!');
      console.log('Email:', testEmail);
      console.log('Password:', testPassword);
      return;
    }

    // Create new user
    const { data, error } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true, // Skip email confirmation for testing
      user_metadata: {
        full_name: 'Test Tech',
        user_type: 'tech'
      }
    });

    if (error) throw error;

    console.log('✅ Test user created successfully!');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('User ID:', data.user.id);

  } catch (error) {
    console.error('❌ Error creating test user:', error.message);
  }
}

createTestUser();

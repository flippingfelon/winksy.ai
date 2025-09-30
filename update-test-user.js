// Update existing test user to be a tech
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixtfidglwgmapwcgdhlq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dGZpZGdsd2dtYXB3Y2dkaGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NTY4NywiZXhwIjoyMDc0NjcxNjg3fQ.neCKI0h4rX94ZxYU5UrcCEPmX9X0ncKUHfMzSL7HgiM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTestUser() {
  try {
    // First, find the user by email
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const testUser = users.users.find(u => u.email === 'test@winksy.ai');
    if (!testUser) {
      console.log('Test user not found');
      return;
    }

    console.log('Found test user:', testUser.id);

    // Update the profile to be a tech
    const { data, error } = await supabase
      .from('profiles')
      .update({
        user_type: 'tech',
        full_name: 'Test Tech'
      })
      .eq('id', testUser.id)
      .select();

    if (error) throw error;

    console.log('✅ Profile updated successfully!');
    console.log('User type set to: tech');

  } catch (error) {
    console.error('❌ Error updating test user:', error.message);
  }
}

updateTestUser();







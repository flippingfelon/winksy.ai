// Update test user to have both consumer and tech roles
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ixtfidglwgmapwcgdhlq.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4dGZpZGdsd2dtYXB3Y2dkaGxxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTA5NTY4NywiZXhwIjoyMDc0NjcxNjg3fQ.neCKI0h4rX94ZxYU5UrcCEPmX9X0ncKUHfMzSL7HgiM';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateTestUserRoles() {
  try {
    // Find the test user
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const testUser = users.users.find(u => u.email === 'test@winksy.ai');
    if (!testUser) {
      console.log('Test user not found');
      return;
    }

    console.log('Found test user:', testUser.id);

    // Update to have both roles
    const { data, error } = await supabase
      .from('profiles')
      .update({
        roles: ['consumer', 'tech'],
        active_role: 'consumer' // Start as consumer
      })
      .eq('id', testUser.id)
      .select();

    if (error) throw error;

    console.log('✅ Updated test user with both consumer and tech roles!');
    console.log('Roles:', data[0].roles);
    console.log('Active role:', data[0].active_role);

  } catch (error) {
    console.error('❌ Error updating test user:', error.message);
  }
}

updateTestUserRoles();







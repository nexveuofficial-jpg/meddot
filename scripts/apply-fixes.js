require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyFixes() {
    console.log('🔧 Applying fixes...');

    // 1. Enable Uploads
    console.log('Enabling uploads...');
    const { error: flagError } = await supabase
        .from('feature_flags')
        .update({ is_enabled: true })
        .eq('key', 'enable_uploads');

    if (flagError) console.error('Flag error:', flagError.message);
    else console.log('✅ Uploads enabled.');

    // 2. Promote Admin
    console.log('Promoting Admin...');
    // We need the ID.
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const adminUser = users.find(u => u.email === 'admin@meddot.com');

    if (adminUser) {
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', adminUser.id);

        if (profileError) console.error('Profile error:', profileError.message);
        else console.log('✅ Admin role confirmed.');

        // 3. Seed Note
        console.log('Seeding test note...');
        const { data: existingNotes } = await supabase
            .from('notes')
            .select('id')
            .eq('title', 'System Start Guide');

        if (!existingNotes || existingNotes.length === 0) {
            const { error: noteError } = await supabase.from('notes').insert({
                title: 'System Start Guide',
                subject: 'General',
                category: 'Medicine',
                description: 'Welcome to Meddot!',
                status: 'approved',
                author_role: 'admin',
                uploader_id: adminUser.id,
                file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' // Dummy PDF
            });
            if (noteError) console.error('Note error:', noteError.message);
            else console.log('✅ Test note created.');
        } else {
            console.log('ℹ️ Test note already exists.');
        }

    } else {
        console.error('❌ Admin user not found in Auth system.');
    }
}

applyFixes();

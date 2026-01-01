const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Load Environment Variables from .env.local manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
    console.error('Error: .env.local file not found!');
    process.exit(1);
}

const envConfig = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envConfig.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Error: Missing Supabase credentials in .env.local');
    process.exit(1);
}

// 2. Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seed() {
    console.log('🌱 Starting local seed...');

    // --- A. Seed User ---
    const email = 'student@meddot.com';
    const password = 'password';

    console.log(`\nChecking for user: ${email}...`);

    // Attempt sign in to check existence
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (signInData.session) {
        console.log('✅ User already exists.');
    } else {
        console.log('User not found or password incorrect. Attempting to create...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: 'Student User',
                    role: 'student'
                }
            }
        });

        if (signUpError) {
            console.error('❌ Error creating user:', signUpError.message);
        } else {
            console.log('✅ User created successfully!');
        }
    }

    // --- A2. Seed Admin User ---
    const adminEmail = 'admin@meddot.com';
    const adminPassword = 'password';

    console.log(`\nChecking for admin: ${adminEmail}...`);
    const { data: adminSignInData } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: adminPassword
    });

    if (adminSignInData.session) {
        console.log('✅ Admin user already exists.');
    } else {
        console.log('Admin not found. Creating...');
        const { data: adminSignUpData, error: adminSignUpError } = await supabase.auth.signUp({
            email: adminEmail,
            password: adminPassword,
            options: {
                data: {
                    full_name: 'Admin User',
                    role: 'admin'
                }
            }
        });

        if (adminSignUpError) {
            console.error('❌ Error creating sensitive user:', adminSignUpError.message);
        } else {
            console.log('✅ Admin created successfully!');
            // Note: In a real app, we'd need to manually set the 'role' in the profiles table if the trigger doesn't handle it,
            // but for now we rely on the metadata or the user manually running the SQL script to promote.
        }
    }

    // --- B. Seed Feature Flags ---
    console.log('\n📱 Seeding Feature Flags...');
    const flags = [
        { key: 'enable_chat', is_enabled: true, description: 'Enable global chat features' },
        { key: 'enable_uploads', is_enabled: true, description: 'Enable note uploads' },
        { key: 'enable_ask_senior', is_enabled: true, description: 'Enable Ask a Senior' },
        { key: 'doctor_companion_enabled', is_enabled: true, description: 'Enable the Doctor Companion avatar' }
    ];

    for (const flag of flags) {
        const { error } = await supabase
            .from('feature_flags')
            .upsert(flag, { onConflict: 'key' });

        if (error) {
            // If table doesn't exist, we might get an error.
            console.warn(`⚠️ Could not set flag ${flag.key}: ${error.message}`);
        } else {
            console.log(`✅ Flag set: ${flag.key} = true`);
        }
    }

    console.log('\n🎉 Seed complete!');
}

seed().catch(err => {
    console.error('Unexpected error:', err);
});

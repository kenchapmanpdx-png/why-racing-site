const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function verifyIncludes() {
    // Get all unique include items from database
    const { data } = await supabase
        .from('races')
        .select('includes')
        .eq('is_visible', true)
        .eq('status', 'active');

    const dbItems = new Set();
    data.forEach(r => {
        if (r.includes) r.includes.forEach(i => dbItems.add(i));
    });

    // Read the HTML file and extract the includeLabels object
    const htmlPath = path.join(__dirname, '..', 'pages', 'events', 'race-detail.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    // Find all items in includeLabels
    const labelMatch = htmlContent.match(/const includeLabels = \{([^}]+)\}/s);
    const codeItems = new Set();
    if (labelMatch) {
        const matches = labelMatch[1].matchAll(/'([^']+)':/g);
        for (const m of matches) {
            codeItems.add(m[1]);
        }
    }

    console.log('='.repeat(70));
    console.log('INCLUDES VERIFICATION');
    console.log('='.repeat(70));
    console.log('\nDatabase items:', [...dbItems].sort().join(', '));
    console.log('\nCode mappings:', [...codeItems].sort().join(', '));
    console.log('');

    // Check for missing
    const missing = [...dbItems].filter(item => !codeItems.has(item));
    if (missing.length === 0) {
        console.log('✅ All database include items have display code mappings');
    } else {
        console.log('❌ Missing mappings for:', missing.join(', '));
    }

    console.log('='.repeat(70));
}

verifyIncludes();

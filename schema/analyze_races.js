/**
 * Fix Race Data Script - JSON Output Version
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
    const report = { analysis: {}, toRemove: [], issues: [] };

    // Get all races
    const { data: races, error } = await supabase
        .from('races')
        .select('id, name, status, race_date, city, state, venue, hero_image_url')
        .order('name');

    if (error) {
        console.error('Error:', error);
        return;
    }

    report.totalRaces = races.length;

    // Check each race for content
    const withContent = [];
    const withoutContent = [];

    for (const race of races) {
        const { data: content } = await supabase
            .from('race_content')
            .select('id, tagline')
            .eq('race_id', race.id)
            .single();

        const { data: distances } = await supabase
            .from('race_distances')
            .select('id, name')
            .eq('race_id', race.id);

        race.hasContent = !!content;
        race.contentTagline = content?.tagline || null;
        race.distanceCount = distances?.length || 0;

        if (content) {
            withContent.push(race);
        } else {
            withoutContent.push(race);
        }
    }

    report.racesWithContent = withContent.map(r => ({
        name: r.name,
        id: r.id,
        status: r.status,
        race_date: r.race_date,
        city: r.city,
        distanceCount: r.distanceCount,
        hasHeroImage: !!r.hero_image_url
    }));

    report.racesWithoutContent = withoutContent.map(r => ({
        name: r.name,
        id: r.id,
        status: r.status,
        race_date: r.race_date,
        city: r.city,
        distanceCount: r.distanceCount,
        hasHeroImage: !!r.hero_image_url
    }));

    // Check for duplicates
    const processed = new Set();
    const duplicates = [];

    for (const race of races) {
        const baseWords = race.name.toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .split(' ')
            .filter(w => w.length > 2)
            .slice(0, 2)
            .join(' ');

        if (processed.has(baseWords)) continue;
        processed.add(baseWords);

        const similar = races.filter(r => {
            const rWords = r.name.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(' ')
                .filter(w => w.length > 2)
                .slice(0, 2)
                .join(' ');
            return rWords === baseWords;
        });

        if (similar.length > 1) {
            duplicates.push({
                basePattern: baseWords,
                races: similar.map(r => ({
                    name: r.name,
                    id: r.id,
                    hasContent: r.hasContent,
                    status: r.status
                }))
            });
        }
    }

    report.duplicateGroups = duplicates;

    // Identify races to potentially remove (duplicates without content, test races)
    const toRemove = [];

    for (const group of duplicates) {
        const withContentInGroup = group.races.filter(r => r.hasContent);
        const withoutContentInGroup = group.races.filter(r => !r.hasContent);

        if (withContentInGroup.length > 0) {
            // Keep those with content, remove others
            toRemove.push(...withoutContentInGroup.map(r => ({
                name: r.name,
                id: r.id,
                reason: `Duplicate of ${withContentInGroup[0].name}`
            })));
        }
    }

    // Add test races
    races.filter(r => r.name.toLowerCase().includes('test')).forEach(r => {
        if (!toRemove.some(t => t.id === r.id)) {
            toRemove.push({
                name: r.name,
                id: r.id,
                reason: 'Test race'
            });
        }
    });

    report.toRemove = toRemove;

    // Missing fields analysis
    report.missingFields = races.map(r => ({
        name: r.name,
        id: r.id,
        missing: [
            !r.race_date ? 'race_date' : null,
            !r.city ? 'city' : null,
            !r.state ? 'state' : null,
            !r.venue ? 'venue' : null,
            !r.hero_image_url ? 'hero_image_url' : null
        ].filter(Boolean)
    })).filter(r => r.missing.length > 0);

    // Write report
    fs.writeFileSync('schema/analysis_report.json', JSON.stringify(report, null, 2));

    console.log('Analysis complete!');
    console.log(`Total races: ${report.totalRaces}`);
    console.log(`With content: ${report.racesWithContent.length}`);
    console.log(`Without content: ${report.racesWithoutContent.length}`);
    console.log(`Duplicate groups: ${report.duplicateGroups.length}`);
    console.log(`To remove: ${report.toRemove.length}`);
    console.log('\nFull report written to schema/analysis_report.json');
}

main().catch(console.error);

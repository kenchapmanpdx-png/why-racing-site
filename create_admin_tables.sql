-- create_admin_tables.sql
-- Table: training_clubs
CREATE TABLE IF NOT EXISTS training_clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT,
    schedule TEXT,
    description TEXT,
    url TEXT,
    logo_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table: beneficiaries
CREATE TABLE IF NOT EXISTS beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    total_donated TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Table: team_members
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    role TEXT,
    photo_url TEXT,
    bio TEXT,
    my_why TEXT,
    email TEXT,
    phone TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- RLS Policies
ALTER TABLE training_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
-- Allow public read for active records
CREATE POLICY "Public read training clubs" ON training_clubs FOR
SELECT USING (is_active = true);
CREATE POLICY "Public read beneficiaries" ON beneficiaries FOR
SELECT USING (is_active = true);
CREATE POLICY "Public read team members" ON team_members FOR
SELECT USING (is_active = true);
-- Note: Writes will use the service_role key to bypass RLS, so no explicit INSERT/UPDATE policies 
-- are necessary for the authenticated admin users via our custom password-gate API.
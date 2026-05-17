ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS main_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS sub_text TEXT;
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

ALTER TABLE profile ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS contact_email TEXT;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS education JSONB DEFAULT '[]'::jsonb;
ALTER TABLE profile ADD COLUMN IF NOT EXISTS work_links JSONB DEFAULT '[]'::jsonb;

ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS episodes JSONB DEFAULT '[]'::jsonb;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS keywords TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS production_date TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS sub_category TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS work_steps JSONB DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS comments (
	id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
	author_name TEXT NOT NULL,
	content TEXT NOT NULL,
	delete_key_hash TEXT,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read comments" ON comments;
DROP POLICY IF EXISTS "Allow public insert comments" ON comments;

CREATE POLICY "Allow public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Allow public insert comments" ON comments FOR INSERT WITH CHECK (true);

NOTIFY pgrst, 'reload schema';
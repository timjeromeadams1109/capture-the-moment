CREATE TABLE IF NOT EXISTS changelog (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  version text NOT NULL,
  title text NOT NULL,
  description text,
  type text NOT NULL DEFAULT 'feature' CHECK (type IN ('feature', 'fix', 'improvement', 'breaking', 'security', 'infrastructure')),
  created_at timestamptz DEFAULT now(),
  created_by text DEFAULT 'maven'
);

ALTER TABLE changelog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read changelog" ON changelog FOR SELECT USING (true);
CREATE POLICY "Service role can manage changelog" ON changelog FOR ALL USING (auth.role() = 'service_role');

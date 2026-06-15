-- Users profile table (references Supabase auth.users)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_select ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY users_update ON users
  FOR UPDATE USING (id = auth.uid());

CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK(role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT CHECK(type IN ('income', 'expense', 'saving')),
  is_shared BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount INTEGER NOT NULL,
  type TEXT CHECK(type IN ('income', 'expense', 'saving')),
  payment_method TEXT CHECK(payment_method IN ('cash', 'card', 'account', 'transfer')),
  note TEXT,
  date DATE NOT NULL,
  photo_urls TEXT[],
  is_shared BOOLEAN DEFAULT false,
  is_recurring BOOLEAN DEFAULT false,
  recurring_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id, month)
);

-- Indexes for performance
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_entries_user_id ON entries(user_id);
CREATE INDEX idx_entries_family_id ON entries(family_id);
CREATE INDEX idx_entries_date ON entries(date);
CREATE INDEX idx_entries_is_shared ON entries(is_shared);
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_is_shared ON categories(is_shared);
CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_month ON budgets(month);

-- Row Level Security

ALTER TABLE entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- entries: select own or shared family entries
CREATE POLICY entries_select ON entries
  FOR SELECT USING (
    user_id = auth.uid()
    OR (
      is_shared = true
      AND family_id IN (
        SELECT family_id FROM family_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY entries_insert ON entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY entries_update ON entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY entries_delete ON entries FOR DELETE USING (user_id = auth.uid());

-- categories
CREATE POLICY categories_select ON categories
  FOR SELECT USING (user_id = auth.uid() OR is_shared = true);

CREATE POLICY categories_insert ON categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY categories_update ON categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY categories_delete ON categories FOR DELETE USING (user_id = auth.uid());

-- families
CREATE POLICY families_select ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY families_insert ON families FOR INSERT WITH CHECK (true);
CREATE POLICY families_update ON families FOR UPDATE USING (
  id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'owner')
);

-- family_members
CREATE POLICY family_members_select ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY family_members_insert ON family_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY family_members_update ON family_members
  FOR UPDATE USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'owner')
  );

CREATE POLICY family_members_delete ON family_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- budgets
CREATE POLICY budgets_select ON budgets
  FOR SELECT USING (
    user_id = auth.uid()
    OR family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

CREATE POLICY budgets_insert ON budgets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY budgets_update ON budgets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY budgets_delete ON budgets FOR DELETE USING (user_id = auth.uid());

-- updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
  BEFORE UPDATE ON entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Money Space Database Schema

-- Users table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Families table
CREATE TABLE IF NOT EXISTS public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family members junction table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

-- Categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'saving')),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entries table
CREATE TABLE IF NOT EXISTS public.entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  amount BIGINT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'saving')),
  payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'account', 'transfer')),
  note TEXT,
  date DATE NOT NULL,
  photo_urls TEXT[],
  is_shared BOOLEAN DEFAULT FALSE,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_rule TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  family_id UUID REFERENCES public.families(id) ON DELETE SET NULL,
  category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  amount BIGINT NOT NULL,
  month TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, month)
);

-- Pending changes table (for offline sync)
CREATE TABLE IF NOT EXISTS public.pending_changes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('insert', 'update', 'delete')),
  data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- User settings table (extends user preferences)
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  currency TEXT DEFAULT 'KRW',
  language TEXT DEFAULT 'ko',
  notifications JSONB DEFAULT '{"budgetAlert":true,"recurringReminder":true,"weeklySummary":false,"monthlyReport":true}',
  security JSONB DEFAULT '{"biometricEnabled":false,"autoLockTimeout":5}',
  sync JSONB DEFAULT '{"wifiOnly":false,"autoSyncInterval":30}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Family invites table
CREATE TABLE IF NOT EXISTS public.family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES public.families(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  invite_code TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON public.entries(user_id);
CREATE INDEX IF NOT EXISTS idx_entries_date ON public.entries(date);
CREATE INDEX IF NOT EXISTS idx_entries_type ON public.entries(type);
CREATE INDEX IF NOT EXISTS idx_entries_category_id ON public.entries(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_changes_user_id ON public.pending_changes(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_changes_status ON public.pending_changes(status);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: users can read their own data
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User settings: users can manage their own settings
CREATE POLICY "Users can view own settings" ON public.user_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own settings" ON public.user_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Families: family members can view their families
CREATE POLICY "Family members can view families" ON public.families
  FOR SELECT USING (
    id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create families" ON public.families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family owners can update families" ON public.families
  FOR UPDATE USING (
    id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Family members
CREATE POLICY "Family members can view members" ON public.family_members
  FOR SELECT USING (family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid()));

CREATE POLICY "Family owners can manage members" ON public.family_members
  FOR ALL USING (
    family_id IN (SELECT family_id FROM public.family_members WHERE user_id = auth.uid() AND role = 'owner')
  );

-- Categories: users can view their categories and defaults
CREATE POLICY "Users can view own categories" ON public.categories
  FOR SELECT USING (user_id = auth.uid() OR is_default = TRUE);

CREATE POLICY "Users can create categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id AND is_default = FALSE);

-- Entries: users can CRUD their entries, family members can view shared entries
CREATE POLICY "Users can view own entries" ON public.entries
  FOR SELECT USING (user_id = auth.uid() OR (is_shared = TRUE AND family_id IN (
    SELECT family_id FROM public.family_members WHERE user_id = auth.uid()
  )));

CREATE POLICY "Users can create entries" ON public.entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries" ON public.entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries" ON public.entries
  FOR DELETE USING (auth.uid() = user_id);

-- Budgets: users can CRUD their budgets
CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create budgets" ON public.budgets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE USING (auth.uid() = user_id);

-- Pending changes: users manage their own sync queue
CREATE POLICY "Users can view own pending changes" ON public.pending_changes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own pending changes" ON public.pending_changes
  FOR ALL USING (user_id = auth.uid());

-- Family invites
CREATE POLICY "Users can view invites by code" ON public.family_invites
  FOR SELECT USING (invite_code IS NOT NULL);

CREATE POLICY "Users can create invites" ON public.family_invites
  FOR INSERT WITH CHECK (auth.uid() = invited_by);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (id, name, icon, type, user_id, is_default) VALUES
  ('food', '식비', '🍽️', 'expense', NULL, TRUE),
  ('shopping', '쇼핑', '🛒', 'expense', NULL, TRUE),
  ('transport', '교통', '🚗', 'expense', NULL, TRUE),
  ('cafe', '카페/음식', '☕', 'expense', NULL, TRUE),
  ('entertainment', '여가', '🎬', 'expense', NULL, TRUE),
  ('health', '건강', '💊', 'expense', NULL, TRUE),
  ('beauty', '미용', '💄', 'expense', NULL, TRUE),
  ('education', '교육', '📚', 'expense', NULL, TRUE),
  ('housing', '주거', '🏠', 'expense', NULL, TRUE),
  ('utility', '공과금', '💡', 'expense', NULL, TRUE),
  ('salary', '급여', '💰', 'income', NULL, TRUE),
  ('gift', '용돈', '💵', 'income', NULL, TRUE),
  ('investment', '투자수익', '📈', 'income', NULL, TRUE),
  ('other_income', '기타수입', '🎁', 'income', NULL, TRUE),
  ('saving', '저축', '🏦', 'saving', NULL, TRUE),
  ('etc', '기타', '📝', 'expense', NULL, TRUE)
ON CONFLICT (id) DO NOTHING;
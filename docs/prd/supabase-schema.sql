-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'saving')),
  is_system BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_categories_type ON public.categories(type);
CREATE INDEX idx_categories_sort_order ON public.categories(sort_order);

-- Families table
CREATE TABLE public.families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their families"
  ON public.families FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create families"
  ON public.families FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update their families"
  ON public.families FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete their families"
  ON public.families FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = families.id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    )
  );

-- Family members table
CREATE TABLE public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view family members"
  ON public.family_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_members.family_id
        AND fm.user_id = auth.uid()
    )
  );

CREATE POLICY "Members can join via invite"
  ON public.family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can update member roles"
  ON public.family_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = family_members.family_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

CREATE POLICY "Admins can remove members"
  ON public.family_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = family_members.family_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
    OR user_id = auth.uid()
  );

CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);

-- Family invites table
CREATE TABLE public.family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.family_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view invites by code"
  ON public.family_invites FOR SELECT
  USING (true);

CREATE POLICY "Admins can create invites"
  ON public.family_invites FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = family_invites.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete invites"
  ON public.family_invites FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.family_members
      WHERE family_members.family_id = family_invites.family_id
        AND family_members.user_id = auth.uid()
        AND family_members.role = 'admin'
    )
  );

CREATE INDEX idx_family_invites_code ON public.family_invites(code);
CREATE INDEX idx_family_invites_family_id ON public.family_invites(family_id);
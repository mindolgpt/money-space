# Money Space — 가계부 앱 설계 문서

## 개요

위플가계부 Pro의 부족한 부분을 보완한 차세대 가계부 앱. SQLite + Supabase 하이브리드 동기화로 오프라인/실시간 동기화를 모두 지원하며, 부부 공유 가계부 기능으로 차별화.

## 기술 스택

| 항목 | 선택 |
|------|------|
| 프레임워크 | Expo SDK 53+ (React Native 최신) |
| 네비게이션 | Expo Router (파일 기반 라우팅) |
| 아키텍처 | FSD (Feature-Sliced Design) |
| 로컬 DB | expo-sqlite (SQLite) |
| 백엔드/BaaS | Supabase (PostgreSQL + Realtime + Auth + RLS) |
| 동기화 | 큐 기반 하이브리드 (로컬 우선 → Supabase 전파) |
| 상태 관리 | Zustand |
| 디자인 | TailwindCSS (NativeWind) |
| 애니메이션 | react-native-reanimated + motion (Framer Motion for RN) |

## 아키텍처: FSD (Feature-Sliced Design)

```
src/
├── app/                    # Expo Router pages (FSD app layer)
│   ├── (tabs)/
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # 홈 탭
│   │   ├── statistics.tsx  # 통계 탭
│   │   ├── shared.tsx      # 공유 가계부 탭
│   │   ├── calendar.tsx    # 캘린더 탭
│   │   └── settings.tsx    # 설정 탭
│   ├── auth/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── invite/
│   │   └── [code].tsx
│   └── _layout.tsx
├── pages/                  # FSD pages layer (복잡한 페이지 컴포넌트)
│   ├── home/
│   ├── statistics/
│   ├── shared/
│   ├── calendar/
│   └── settings/
├── widgets/                # FSD widgets layer (재사용 가능한 섹션)
│   ├── monthly-summary/
│   ├── recent-entries/
│   ├── category-chart/
│   ├── budget-progress/
│   ├── quick-input/
│   └── sync-status/
├── features/               # FSD features layer (비즈니스 기능 단위)
│   ├── add-entry/
│   ├── edit-entry/
│   ├── search-entries/
│   ├── sync-engine/
│   ├── family-invite/
│   ├── budget-manager/
│   └── auth/
├── entities/               # FSD entities layer (도메인 모델)
│   ├── entry/
│   ├── category/
│   ├── budget/
│   ├── family/
│   ├── user/
│   └── sync-queue/
├── shared/                 # FSD shared layer (공통 유틸)
│   ├── api/
│   ├── lib/
│   ├── ui/
│   └── config/
└── supabase/
    ├── migrations/
    └── seed.sql
```

## 데이터베이스 설계

### SQLite (로컬) + Supabase PostgreSQL (원격)

**공통 스키마:**

```sql
-- 사용자
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 가족/커플 그룹
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 가족 구성원
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(family_id, user_id)
);

-- 카테고리
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

-- 가계부 항목
CREATE TABLE entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id),
  category_id UUID REFERENCES categories(id),
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

-- 예산
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  family_id UUID REFERENCES families(id),
  category_id UUID REFERENCES categories(id),
  amount INTEGER NOT NULL,
  month TEXT NOT NULL, -- '2026-06'
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, category_id, month)
);

-- 동기화 큐 (로컬 전용)
CREATE TABLE pending_changes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  operation TEXT CHECK(operation IN ('insert', 'update', 'delete')),
  payload TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

### Row Level Security (Supabase)

```sql
-- entries: 자신의 항목 또는 같은 family 구성원의 공유 항목
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

-- entries: 자신의 항목만 수정/삭제
CREATE POLICY entries_insert ON entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY entries_update ON entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY entries_delete ON entries FOR DELETE USING (user_id = auth.uid());
```

## 동기화 엔진 설계 (Sync Engine)

### 흐름

```
사용자 입력 → SQLite upsert
           → pending_changes에 {table, record_id, operation, payload} 추가
           → 온라인? → 큐 dequeue → Supabase REST API 호출
                     → 성공? → pending_changes 삭제
                     → 실패? → retry_count++, 재시도
           
Supabase Realtime 수신 → payload 파싱
                       → SQLite에 upsert (변경 충돌 방지: updated_at 비교)
                       → 화면 업데이트
```

### 충돌 해소 전략
- **Last-Write-Wins (LWW):** `updated_at`이 더 최신인 쪽 유지
- 사용자에게 충돌 알림 → 선택적으로 수동 병합 UI 제공

## 화면 설계

### 1. 홈 (메인)

```
┌──────────────────────────────┐
│  2026년 6월              🔍  │
│                              │
│  +--------+  +-----------+  │
│  | 수입   |  | 지출      |  │
│  | 3,200,000| | 1,850,000 |  │
│  +--------+  +-----------+  │
│         잔액: 1,350,000     │
│                              │
│  ─── 오늘 (6/15) ─────────  │
│  • 편의점     -12,800     💳  │
│  • 월급     +3,200,000   💰  │
│  • 점심       -9,500     💵  │
│                              │
│  ─── 어제 (6/14) ─────────  │
│  • 마트      -85,300      💳  │
│  • 교통비     -12,500     💳  │
│                              │
│                      [+]
└──────────────────────────────┘
```

### 2. 입력 모달 (Bottom Sheet)

```
┌──────────────────────────────┐
│          새 기록             │
│                              │
│    [지출] [수입] [저축]      │
│                              │
│  ┌──────────────────────┐   │
│  │  ₩ 50,000            │   │
│  └──────────────────────┘   │
│                              │
│  카테고리: 식비 ──────── >   │
│  결제수단: [현금][카드][계좌] │
│  메모: ___________________   │
│  날짜: 2026-06-15           │
│  공유: [ ] 부부 공유         │
│  사진: [📷]                  │
│                              │
│  ┌──────────────────────┐   │
│  │     저장              │   │
│  └──────────────────────┘   │
└──────────────────────────────┘
```

### 3. 통계

```
┌──────────────────────────────┐
│         통계                 │
│  [주간] [월간] [연간]       │
│                              │
│    ┌──────────────────┐     │
│    │   파이 차트       │     │
│    │  식비 35%        │     │
│    │  교통 15%        │     │
│    │  주거 25%        │     │
│    │  ...             │     │
│    └──────────────────┘     │
│                              │
│  추세 (일별 지출)           │
│  ██                         │
│  ██ ██                      │
│  ██ ██ ██  ██               │
│  ██ ██ ██ ████ ██          │
│  12 13 14 15 16 17 18       │
│                              │
│  전월 대비: -12% ▼         │
│  저축률: 35% 🎯             │
└──────────────────────────────┘
```

### 4. 공유 가계부

```
┌──────────────────────────────┐
│     공유 가계부       👤 👤  │
│  [전체] [개인] [공용]       │
│                              │
│  ─── 오늘 ────────────────  │
│  👤 나                       │
│    • 편의점     -12,800  💳  │
│  👤 배우자                   │
│    • 마트      -85,300   💳  │
│                              │
│  ─── 어제 ────────────────  │
│  👤 배우자                   │
│    • 통신비    -65,000   💳  │
│                              │
│  총 공용 지출: 1,200,000    │
│              [+]
└──────────────────────────────┘
```

### 5. 설정

```
┌──────────────────────────────┐
│         설정                 │
│                              │
│  프로필                      │
│  ┌──────────────────────┐   │
│  │ 👤  user@email.com   │   │
│  │  로그아웃             │   │
│  └──────────────────────┘   │
│                              │
│  가족 관리                   │
│  ┌──────────────────────┐   │
│  │  배우자: 김OO         │   │
│  │  [초대하기] [연결끊기]  │   │
│  └──────────────────────┘   │
│                              │
│  카테고리 관리 >             │
│  예산 설정     >             │
│  동기화 상태   >             │
│  백업/복원     >             │
│  알림 설정     >             │
│                              │
│  동기화: ✅ 최신             │
└──────────────────────────────┘
```

## 공유 모드 상세

| 모드 | 설명 |
|------|------|
| **완전 공유** | 부부가 모든 내역을 함께 보고 입력/수정 가능. 각 기록에 누가 입력했는지 표시 |
| **개인+공용 분리** | 각자 개인 지출은 비공개, 공용 카테고리(생활비/월세 등)만 공유. 공용 지출은 부부 모두 입력/수정 가능 |
| **태그 기반** | 모든 내역에 공유 태그를 개별 지정. 세밀한 제어 가능 |

## UI/UX 모션 디자인

전반적인 UI/UX는 `react-native-reanimated` + `motion` (Framer Motion for RN)을 사용하여 부드럽고 직관적인 애니메이션을 제공합니다.

### 진입 애니메이션 (Enter Animations)
- **페이지 전환:** 부드러운 fade + slide (Expo Router 기본 전환 커스터마이징)
- **리스트 아이템:** staggered fade-in (항목이 순차적으로 나타남)
- **모달:** bottom sheet가 자연스럽게 위로 슬라이드 + 배경 흐림(blur) 효과

### 인터랙션 애니메이션
- **FAB 버튼:** spring 애니메이션으로 튀어나오는 효과, 누르면 scale 축소
- **카테고리 선택:** 선택된 카테고리가 spring으로 살짝 확대되었다가 정상 크기로
- **탭 전환:** tab bar indicator가 부드러운 spring 애니메이션으로 이동
- **스와이프:** 항목을 좌우로 swipe하여 삭제/수정 (react-native-gesture-handler)

### 마이크로 인터랙션
- **금액 입력:** 숫자가 입력될 때마다 살짝 scale bounce
- **저장 버튼:** 누르면 체크 표시와 함께 check animation
- **동기화 상태:** 아이콘이 회전하거나 pulse 애니메이션
- **Pull-to-refresh:** 커스텀 리프레시 애니메이션 (통계 페이지)

### 차트 애니메이션
- **파이 차트:** 각 섹션이 순차적으로 나타나며 회전
- **막대 그래프:** 막대가 아래에서 위로 spring 애니메이션으로 성장
- **숫자 카운트:** 잔액/통계 숫자가 변화할 때 counting-up 애니메이션

### 공유 가계부 특화
- **실시간 업데이트:** 상대방이 입력한 내역이 fade-in + highlight 효과로 나타남
- **사용자 구분:** 내 기록과 배우자 기록이 다른 색상 강조와 함께 리스트에 표시

### 구현 가이드라인
- 모든 애니메이션은 `useAnimatedStyle`, `withSpring`, `withTiming` 사용
- spring: 기본 tension 100, friction 10
- duration: micro-interactions 200ms, page transitions 300ms, staggered delays 80ms 간격
- 성능을 위해 `Animated.FlatList`와 `Animated.View` 사용
- 저사양 기기에서는 `reduceMotion` 설정을 감지하여 애니메이션 축소

## 마일스톤

| 단계 | 내용 |
|------|------|
| **M1** | Supabase Auth + SQLite 로컬 저장 + 입출금 CRUD |
| **M2** | 동기화 엔진 (큐 기반) + Realtime 반영 |
| **M3** | 부부 연결 + 공유 가계부 (3가지 모드) |
| **M4** | 통계/차트 + 예산 관리 |
| **M5** | 위젯 + iPad 대응 + 문자 파싱 + 사진 첨부 |

---

이 설계는 위플가계부의 모든 기능을 포함하면서도 Supabase 기반 클라우드 동기화, 부부 공유 가계부, 현대적인 UI/UX로 차별화합니다.

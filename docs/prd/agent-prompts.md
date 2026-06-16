# AI 에이전트 개발 요청 프롬프트 가이드

> 이 가이드를 참고하여 AI 에이전트에게 개발 작업을 요청하세요.

---

## 기본 프롬프트 구조

```
역할 설정 + 작업 대상 + 참조 문서 + 출력 요구사항
```

### 프롬프트 구성 요소

1. **역할/지시** - "너는 Money-Space 앱의 개발자야"
2. **작업 대상** - "AddEntryModal 기능을 구현해줘"
3. **참조 문서** - "자세한 요구사항은 docs/prd/entry/README.md를 봐줘"
4. **출력 형식** - "구현 후 테스트 방법도 알려줘"
5. **제약사항** - "기존 코드 컨벤션 따라가고, FSD 구조 준수해줘"

---

## 프롬프트 템플릿 모음

### 템플릿 1: 기능 구현 요청

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
src/features/entry/add-entry/ui/AddEntryModal.tsx 를 새로 만들어줘.

## 요구사항
- docs/prd/entry/README.md 의 "5.1 AddEntryModal" 섹션 참조
- docs/prd/shared/README.md 의 공통 컴포넌트 규칙 준수
- src/features/entry/add-entry/model/types.ts 에 폼 상태 타입 정의

## 제약사항
- FSD 아키텍처 준수 (model/, ui/ 분리)
- export는 index.ts 통해서만 (export * 금지)
- nativewind/tailwind 사용 (className)
- 기존 코드 컨벤션 따르기

## 출력
구현 후:
1. 만들어진 파일 목록
2. 테스트 방법 (手动テスト 스크립트)
3. 주의할 점
```

### 템플릿 2: 위젯 구현 요청

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
src/widgets/quick-input/QuickInput.tsx 를 구현해줘.

## 요구사항
- docs/prd/entry/README.md 의 "5.3 QuickInput 위젯" 참조
- Floating Action Button 형태
- 금액 직접 입력 후 빠른 저장 기능
- HomeScreen에서 사용됨

## 제약사항
- src/widgets/[위젯명]/index.ts (Public API) 필수
- Zustand 스토어 직접 접근 금지, hooks 사용
- Haptic 피드백 포함

## 출력
구현 후 테스트 방법
```

### 템플릿 3: Entity API 구현 요청

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
src/entities/entry/api/index.ts 를 SQLite + Supabase 연동으로 구현해줘.

## 요구사항
- docs/prd/entry/README.md 의 "3. API 인터페이스" 참조
- Query Key Factory 포함 (ENTRY_KEYS)
- Factory 함수 (비React) + Hooks (React) 분리
- 오프라인 우선: SQLite 먼저 저장 후 동기화

## 제약사항
- supabase client는 shared/api/supabase.ts 에서만 import
- Pages/Features는 entity barrel만 import 가능 (deep import 금지)
- TanStack Query useQueryClient 접근은 hooks 내부에서만

## 출력
구현 후:
1. API 파일 구조
2. 사용 예시 (hooks + factory)
```

### 템플릿 4: 화면 완성 요청

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
app/(tabs)/home.tsx (HomeScreen) 완성해줘.

## 요구사항
- docs/prd/index.md 의 "Home" 섹션 체크리스트 참조
- docs/prd/entry/README.md 의 "4. 주요 유저 플로우" 참조
- 포함할 위젯:
  - MonthlySummary (수입/지출/저축 요약)
  - RecentEntries (최근 내역 목록)
  - QuickInput (빠른 입력 FAB)
  - SyncStatus (동기화 상태)

## 제약사항
- Expo Router 사용
- FSD: pages/home/ui/ 에 UI 컴포넌트 분리
- TanStack Query로 데이터 페칭
- Pull-to-refresh 지원

## 출력
완성 후 확인 체크리스트
```

### 템플릿 5: 버그 수정 요청

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
SyncStatus 위젯에서 SQLite 쿼리 오류가 발생하고 있어.

## 문제
- docs/prd/sync/README.md 의 "5.2 SyncStatusBar 위젯" 상태
- src/widgets/sync-status/SyncStatus.tsx 파일 확인 필요
- `getDb().getAllSync` 메서드 존재 여부 불명확

## 기대 동작
- pending_count 조회해서 동기화 대기 개수 표시
- 0개면 null 반환 (아무것도 표시 안 함)

## 출력
수정된 코드 + 원인 분석
```

### 템플릿 6: 리팩토링 요청

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
RecentEntries.tsx 리팩토링해줘.

## 현재 문제
- 데이터 연동 없이 더미 데이터만 표시
- docs/prd/entry/README.md 의 "5.2 EntryItem" 구현 안 됨
- swipe/delete 기능 없음

## 요구사항
- Entity barrel (@/entities/entry) 통해 데이터 페칭
- TanStack Query hooks 사용
- swipe手势 (react-native-gesture-handler)
- 삭제 시 확인 다이얼로그

## 출력
리팩토링 후 파일 비교 (before/after)
```

---

## 도메인별 빠른 참조

| 작업 | 참조 문서 |
|------|----------|
| Entry CRUD | `docs/prd/entry/README.md` |
| Budget 관리 | `docs/prd/budget/README.md` |
| Category 관리 | `docs/prd/category/README.md` |
| Family 공유 | `docs/prd/family/README.md` |
| Auth/Session | `docs/prd/auth/README.md` |
| Sync/Offline | `docs/prd/sync/README.md` |
| User/Settings | `docs/prd/user/README.md` |
| 공통 규칙 | `docs/prd/shared/README.md` |

---

## 프롬프트 작성 팁

### ✅ 효과적인 프롬프트

```
"src/widgets/recent-entries/RecentEntries.tsx 를
 docs/prd/entry/README.md 의 '5.2 EntryItem' 섹션 따라 구현해줘.
 EntryTypes, API hook은 @/entities/entry에서 import해."
```

### ❌ 피해야 할 프롬프트

```
"RecentEntries 위젯 만들어줘"  ← 너무 추상적
"가계부 앱 만들어줘"            ← 범위 너무 넓음
"(entry/README.md 참고)"       ← 경로 명확히
```

### 추가 정보 포함하기

| 상황 | 포함할 정보 |
|------|------------|
| 기존 코드 연동 | 참조할 파일 경로 |
| 특정 상태 처리 | expected behavior |
| 에러 발생 시 | 에러 메시지, 스택 트레이스 |
| 디자인 요구 | Figma 링크 또는 UI 묘사 |
| 테스트 환경 | expo start / specific device |

---

## 작업 완료 확인 방법

AI 에이전트에게 항상 요청하세요:

```
## 출력 요구사항
1. 구현된 파일 목록 (생성/수정 파일 경로)
2. 주요 구현 내용 요약
3. 테스트 방법 (수동 테스트 또는 자동화 테스트)
4. 알려진 제한사항 또는 주의점
5. 관련 문서 업데이트 여부
```

---

## 예시: 실제 프롬프트

```markdown
너는 Money-Space 앱의 개발자야.

## 작업
app/(tabs)/home.tsx HomeScreen을 완성해줘.

## 요구사항
docs/prd/index.md의 "Home (메인 화면)" 체크리스트 참고:
- MonthlySummary 위젯 (수입/지출/저축 월별 합계)
- RecentEntries 위젯 (최근 10개 내역, FlatList)
- QuickInput 위젯 (FAB, 탭하면 AddEntryModal)
- SyncStatus 위젯 (동기화 대기 개수)

## 현재 상태
- src/widgets/recent-entries/RecentEntries.tsx 는 애니메이션만 있고 데이터 없음
- src/widgets/monthly-summary/ 는 비어있음
- src/widgets/quick-input/ 는 비어있음

## 제약사항
- Expo Router: import { router } from 'expo-router'
- 데이터: @/entities/entry 의 useEntries hook 사용
- TanStack Query setup 완료됨
- nativewind/tailwind 사용

## 출력
완성 후:
1. 수정된 파일 목록
2. 각 위젯 연동 확인 방법
3. 수동 테스트 스크립트
```

이렇게 작성하면 AI 에이전트가 명확하게 작업을 이해하고 수행할 수 있습니다.
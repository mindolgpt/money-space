# 도메인 개발 요청 프롬프트

> 도메인 이름만 입력하면 AI 에이전트가 자동으로 PRD를 참조하여 개발합니다.

---

## 사용법

### 기본 패턴

```
[도메인] 도메인 개발해줘
```

### 지원 도메인 목록

| 도메인 | 명령어 | 설명 |
|--------|--------|------|
| Entry | `Entry 도메인 개발해줘` | 수입/지출 CRUD, 검색, QuickInput |
| Budget | `Budget 도메인 개발해줘` | 예산 설정, 진행률 추적 |
| Category | `Category 도메인 개발해줘` | 카테고리 CRUD, 그리드 |
| Family | `Family 도메인 개발해줘` | 가족 초대, 멤버 관리 |
| Auth | `Auth 도메인 개발해줘` | 로그인, 회원가입, 세션 |
| Sync | `Sync 도메인 개발해줘` | 오프라인 동기화, 큐 |
| User | `User 도메인 개발해줘` | 프로필, 설정 |
| Home | `Home 도메인 개발해줘` | 메인 화면 위젯들 |

---

## 프롬프트 템플릿

### 한국어 버전

```
너는 Money-Space 앱의 개발자야.

## 작업
{도메인} 도메인을 PRD에 맞춰 전부 구현해줘.

## 참조 문서
- docs/prd/index.md (프로젝트 개요)
- docs/prd/{domain}/README.md (상세 기능 명세)
- docs/prd/shared/README.md (공통 규칙)
- docs/prd/progress-tracker.md (현재 진행 상황)

## 구현 범위
docs/prd/{domain}/README.md 의 모든 섹션:
1. 기능 개요
2. 데이터 모델 (entity/model/types.ts)
3. API 인터페이스 (entity/api/index.ts)
4. 주요 유저 플로우
5. UI 이벤트 스크립트 (features/{domain}/*)
6. 위젯 (widgets/{component}/)

## 제약사항
- FSD 아키텍처 (features/, entities/, widgets/, shared/)
- TanStack Query (hooks + key factory)
- SQLite + Supabase 오프라인 우선
- nativewind/tailwind
- export는 index.ts barrel만 (export * 금지)
- Pages/Features는 entity barrel만 import

## 출력
1. 생성/수정된 파일 목록
2. 구현 완료 체크리스트 (progress-tracker.md 기준)
3. 수동 테스트 방법
4. 주의사항

## 진행률 업데이트
완료 후 docs/prd/progress-tracker.md 의 해당 도메인 상태를 ✅로 업데이트해줘.
```

### 영어 버전 (더 간결)

```
You are a developer for Money-Space app.

## Task
Implement the {Domain} domain according to PRD.

## Reference
- docs/prd/{domain}/README.md - detailed specs
- docs/prd/shared/README.md - common rules
- docs/prd/progress-tracker.md - current status

## Scope
Implement everything in docs/prd/{domain}/README.md:
- Entity types (entities/{domain}/model/types.ts)
- API (entities/{domain}/api/index.ts)
- Feature UI (features/{domain}/*/ui/)
- Feature logic (features/{domain}/*/model/)
- Widgets (widgets/{component}/)

## Rules
- FSD architecture
- TanStack Query with key factory
- SQLite + Supabase offline-first
- nativewind/tailwind
- index.ts barrel only (no export *)
- Pages/Features import from entity barrel only

## Output
1. List of created/modified files
2. Completed checklist
3. Manual test steps
4. Notes

Update docs/prd/progress-tracker.md when done.
```

---

## 바로 복사용

### Entry
```
너는 Money-Space 개발자야. Entry 도메인 전부 구현해줘.
docs/prd/entry/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Budget
```
너는 Money-Space 개발자야. Budget 도메인 전부 구현해줘.
docs/prd/budget/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Category
```
너는 Money-Space 개발자야. Category 도메인 전부 구현해줘.
docs/prd/category/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Family
```
너는 Money-Space 개발자야. Family 도메인 전부 구현해줘.
docs/prd/family/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Auth
```
너는 Money-Space 개발자야. Auth 도메인 전부 구현해줘.
docs/prd/auth/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Sync
```
너는 Money-Space 개발자야. Sync 도메인 전부 구현해줘.
docs/prd/sync/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### User
```
너는 Money-Space 개발자야. User 도메인 전부 구현해줘.
docs/prd/user/README.md 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Home
```
너는 Money-Space 개발자야. Home 도메인 (메인 화면) 전부 구현해줘.
docs/prd/index.md Home 섹션 참조.
포함: MonthlySummary, RecentEntries, QuickInput, SyncStatus.
완료 후 progress-tracker.md 업데이트해줘.
```

### Calendar
```
너는 Money-Space 개발자야. Calendar 도메인 전부 구현해줘.
docs/prd/index.md Calendar 섹션 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

### Statistics
```
너는 Money-Space 개발자야. Statistics 도메인 전부 구현해줘.
docs/prd/index.md Statistics 섹션 참조.
완료 후 progress-tracker.md 업데이트해줘.
```

---

## 복합 요청

여러 도메인 동시 개발:
```
너는 Money-Space 개발자야.
Entry + Budget + Category 도메인 동시에 개발해줘.
각각 docs/prd/{domain}/README.md 참조.
완료 후 progress-tracker.md 전부 업데이트해줘.
```

하위 도메인만:
```
너는 Money-Space 개발자야.
Entry 도메인 중 AddEntryModal만 개발해줘.
docs/prd/entry/README.md "5.1 AddEntryModal" 섹션만 참조.
```
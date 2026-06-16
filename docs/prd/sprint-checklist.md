# Sprint Checklist

> 이 파일을 매일 갱신하여 스프린트 진행 상황을 추적합니다.

---

## 📋 현재 스프린트: v1.0 MVP

### 목표: 기본 가계부 기능 완료 (2주)

---

## Week 1 체크리스트

### Day 1-2: 프로젝트 셋업 ✅ (완료)
- [x] Expo 프로젝트 초기화
- [x] FSD 폴더 구조 생성
- [x] Supabase/SQLite 연동
- [x] Navigation 설정
- [x] 공통 컴포넌트 setup

### Day 3-4: Auth ✅ (완료)
- [x] LoginScreen 기본 구조
- [x] RegisterScreen 기본 구조
- [x] AuthStore 셋업
- [ ] ~~소셜 로그인~~ (v2로 미루기)
- [ ] ~~비밀번호 재설정~~ (v2)

### Day 5-7: Entry CRUD 🔄 (진행중)
- [ ] AddEntryModal 완성
- [ ] SQLite 저장
- [ ] 동기화 큐 연동
- [ ] RecentEntries 위젯 완성
- [ ] Entry 편집/삭제

---

## 📌 이번 주 할 일

| 우선순위 | 기능 | 상태 | 비고 |
|----------|------|------|------|
| P0 | AddEntryModal | 🔄 진행중 | 금액 입력 미구현 |
| P0 | Entry SQLite 저장 | 🔄 진행중 | API 연동 필요 |
| P1 | RecentEntries 완료 | ⏳ 미시작 | |
| P1 | HomeScreen 완성 | ⏳ 미시작 | |
| P2 | CalendarScreen | ⏳ 미시작 | |

---

## 🐛 발견된 이슈

| 이슈 | 심각도 | 상태 | 해결 |
|------|--------|------|------|
| quick-input 폴더 비어있음 | 高 | ⏳ | |
| SyncStatus SQLite 쿼리 오류 가능성 | 中 | ⏳ | |

---

## 📝 메모

- SyncStatus에서 `getDb().getAllSync` 메서드 존재 여부 확인 필요
- recent-entries는 애니메이션만 있고 실제 데이터 연동 미구현

---

## 체크 표시 규칙

```
✅ 완료 - 모든 체크리스트 완료
🔄 진행중 - 작업 중, 완료되지 않음
⏳ 미시작 - 아직 작업 전
❌ 차단 - 블로커 있어서 진행 불가
🔵 준비됨 - 다음 작업 준비 완료
```

---

## 사용법

1. 이 파일을 사본으로 저장 (`sprint-YYYY-MM-DD.md`)
2. 매일 아침 업데이트
3. 완료된 항목은 `✅`로 표시
4. 블로커는 `❌`로 표시하고 메모 작성
5. 일간 스크럼에서 확인
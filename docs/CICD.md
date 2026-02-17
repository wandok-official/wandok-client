# CI/CD 가이드

이 문서는 프로젝트의 CI(지속적 통합) 및 CD(지속적 배포) 파이프라인을 정의합니다.

<br>

## 목차
- [CI/CD 가이드](#cicd-가이드)
  - [목차](#목차)
  - [1. 전체 구조](#1-전체-구조)
  - [2. CI 파이프라인 (ci.yml)](#2-ci-파이프라인-ciyml)
    - [2.1 트리거 조건](#21-트리거-조건)
    - [2.2 잡 구성](#22-잡-구성)
    - [2.3 변경 감지 (paths-filter)](#23-변경-감지-paths-filter)
    - [2.4 CI Gate](#24-ci-gate)
  - [3. CD 파이프라인 (deploy.yml)](#3-cd-파이프라인-deployyml)
    - [3.1 Preview 배포](#31-preview-배포)
    - [3.2 Production 배포](#32-production-배포)
    - [3.3 배포 흐름 예시](#33-배포-흐름-예시)
    - [3.4 확장 프로그램 (apps/extension)](#34-확장-프로그램-appsextension)
  - [4. 브랜치별 파이프라인 요약](#4-브랜치별-파이프라인-요약)
  - [5. 로컬 사전 검증](#5-로컬-사전-검증)
  - [6. 환경 변수 관리](#6-환경-변수-관리)
  - [7. 파이프라인 실패 시 대응](#7-파이프라인-실패-시-대응)

---
<br>

## 1. 전체 구조

```
PR 생성 / push
  ↓
CI: 린트 → 테스트 → 빌드 → E2E → CI Gate
  ↓
CD: Vercel Preview 배포 (web 변경 시)
  ↓
코드 리뷰 & 승인
  ↓
병합
  ↓
main push 시 → Vercel Production 배포
```

CI/CD는 GitHub Actions를 통해 자동 실행됩니다. 워크플로우는 두 개의 파일로 구성됩니다.

| 워크플로우 | 파일 | 역할 |
| :--- | :--- | :--- |
| CI | `.github/workflows/ci.yml` | 린트, 테스트, 빌드, E2E 검증 |
| Deploy | `.github/workflows/deploy.yml` | Vercel Preview / Production 배포 |

---
<br>

## 2. CI 파이프라인 (ci.yml)

### 2.1 트리거 조건

| 이벤트 | 대상 브랜치 |
| :--- | :--- |
| `pull_request` | `development`, `main`, `release/*` |
| `push` | `development` |

동일 브랜치에서 새로운 push가 발생하면 이전 CI 실행은 자동 취소됩니다. (`cancel-in-progress: true`)

### 2.2 잡 구성

| 잡 | 실행 조건 | 명령어 | 설명 |
| :--- | :--- | :--- | :--- |
| **Lint** | 항상 | `npm run lint` | ESLint 규칙 위반 검사 |
| **Test** | extension 관련 변경 시 | `npm run test:coverage` | Vitest 단위 테스트 + 커버리지 |
| **Build Web** | web 관련 변경 시 | `npm run build` | 웹 앱 빌드 검증 |
| **Build Extension** | extension 관련 변경 시 | `npm run build:extension` | 확장 프로그램 빌드 검증 |
| **E2E** | Build Extension 성공 시 | `npm run e2e` | Playwright E2E 테스트 |
| **CI Gate** | 항상 (모든 잡 완료 후) | - | 전체 결과를 단일 required check으로 통합 |

> PR에서 Test 잡이 실행되면 **커버리지 리포트**가 PR 코멘트로 자동 게시됩니다.

**커버리지 최소 기준** (`vitest.config.ts`):

| 항목 | 기준 |
| :--- | :--- |
| Functions | 70% |
| Branches | 60% |
| Statements | 70% |

> 기준 미달 시 테스트가 실패하여 CI Gate를 통과할 수 없습니다.

### 2.3 변경 감지 (paths-filter)

`dorny/paths-filter`를 사용하여 변경된 파일에 따라 필요한 잡만 실행합니다.

**extension 변경 감지 대상:**
```
apps/extension/**
vite.extension.config.ts, tsconfig.extension.json
vitest.config.ts, test/**, e2e/**, playwright.config.ts
tsconfig.json, package.json, package-lock.json
```

**web 변경 감지 대상:**
```
apps/web/**
vite.config.ts, tsconfig.app.json, tsconfig.node.json
vercel.json, tsconfig.json, package.json, package-lock.json
```

> `package.json`, `tsconfig.json` 등 공유 파일이 변경되면 양쪽 모두 트리거됩니다.

### 2.4 CI Gate

개별 잡은 변경 감지에 의해 skip될 수 있으므로, **CI Gate** 잡이 전체 결과를 하나의 required check으로 통합합니다.

- 각 잡의 결과가 `success` 또는 `skipped`이면 통과
- 하나라도 `failure` 또는 `cancelled`이면 실패

> Branch Rulesets에서 `CI Gate`를 required status check으로 설정하면, 단일 체크만으로 모든 CI 결과를 관리할 수 있습니다.

---
<br>

## 3. CD 파이프라인 (deploy.yml)

### 3.1 Preview 배포

| 조건 | 설명 |
| :--- | :--- |
| 이벤트 | PR → `development`, `main` 또는 `release/*` |
| 추가 조건 | web 관련 파일 변경 시에만 실행 |

- Vercel CLI로 Preview 환경에 배포합니다.
- 배포 완료 후 **Preview URL을 PR 코멘트로 자동 게시**합니다.
- 동일 PR에서 재배포 시 기존 코멘트를 업데이트합니다.

> PR은 아직 병합 전 단계이므로 Preview 환경에 배포됩니다. `main`을 대상으로 하는 PR(`release/*` → `main`, `hotfix/*` → `main`)도 이 단계에서는 Preview입니다.

### 3.2 Production 배포

| 조건 | 설명 |
| :--- | :--- |
| 이벤트 | `main` 브랜치에 push (병합) |

- PR이 `main`에 병합되면 push 이벤트가 발생하고, Vercel CLI로 Production 환경에 자동 배포합니다. (`--prod` 플래그)
- `release/*` → `main` 또는 `hotfix/*` → `main` 병합 시 트리거됩니다.

### 3.3 배포 흐름 예시

**릴리스 배포:**
```
release/* → main PR 생성
  → Vercel Preview 배포 (미리보기 확인)
  → CI 통과 + 코드 리뷰 + 승인
  → main에 병합
  → Vercel Production 배포
```

**긴급 수정 배포:**
```
hotfix/* → main PR 생성
  → Vercel Preview 배포 (미리보기 확인)
  → CI 통과 + 코드 리뷰 + 승인
  → main에 병합
  → Vercel Production 배포
```

### 3.4 확장 프로그램 (apps/extension)

Chrome Web Store에 수동으로 제출합니다.

```
1. npm run build:extension
2. dist 폴더를 zip으로 압축
3. Chrome Web Store Developer Dashboard에서 업로드
4. 심사 요청 제출
```

> 자세한 절차: [릴리스 프로세스 - 배포 방법](./RELEASE_PROCESS.md#5-배포-방법)

---
<br>

## 4. 브랜치별 파이프라인 요약

| 브랜치 | CI | CD |
| :--- | :--- | :--- |
| 작업 브랜치 → `development` PR | CI Gate | Vercel Preview (web 변경 시) |
| `fix/*` → `release/*` PR | CI Gate | Vercel Preview (web 변경 시) |
| `release/*` → `main` PR | CI Gate | Vercel Preview (web 변경 시) |
| `hotfix/*` → `main` PR | CI Gate | Vercel Preview (web 변경 시) |
| `development` push | CI Gate | - |
| `main` push (병합 후) | - | **Vercel Production** |

---
<br>

## 5. 로컬 사전 검증

커밋/푸시 시 `husky` + `lint-staged`가 자동으로 린트를 실행합니다.

```bash
# lint-staged 설정 (package.json)
*.{ts,tsx,js,jsx} → eslint --fix
```

CI에서 실패하기 전에 로컬에서 미리 검증할 수 있습니다.

```bash
# 린트 실행
npm run lint

# 테스트 실행
npm run test:run

# 빌드 검증
npm run build
npm run build:extension
```

---
<br>

## 6. 환경 변수 관리

| 환경 | 관리 위치 | 설명 |
| :--- | :--- | :--- |
| 로컬 | `.env.local` | 로컬 개발 환경 변수. Git에 포함하지 않음 |
| CI/CD | GitHub Secrets | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| Vercel | Vercel Dashboard | 배포 환경별 환경 변수 설정 |

- `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.
- 새로운 환경 변수가 추가되면 팀원에게 공유합니다.

---
<br>

## 7. 파이프라인 실패 시 대응

### 린트 실패

```bash
# 자동 수정 가능한 항목 수정
npx eslint --fix .

# 수정 후 다시 확인
npm run lint
```

### 테스트 실패

```bash
# 실패한 테스트 확인
npm run test:run

# 특정 파일만 실행
npx vitest run 파일경로
```

### 빌드 실패

```bash
# 타입 에러 확인
npx tsc -b

# 빌드 실행
npm run build
```

### E2E 실패

E2E 테스트 실패 시 `playwright-report` 아티팩트가 GitHub Actions에 7일간 보관됩니다. Actions 탭에서 다운로드하여 실패 원인을 확인할 수 있습니다.

> CI 실패 시 PR 병합이 차단됩니다. 실패 원인을 수정한 후 다시 push하면 CI가 재실행됩니다.

---

[← 협업 가이드로 돌아가기](./CONTRIBUTING.md)

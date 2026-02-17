# 브랜치 전략 가이드

이 문서는 프로젝트의 브랜치 전략과 병합 규칙을 정의합니다.

<br>

## 목차
- [브랜치 전략 가이드](#브랜치-전략-가이드)
  - [목차](#목차)
  - [1. 브랜치 구조](#1-브랜치-구조)
  - [2. 브랜치 역할](#2-브랜치-역할)
  - [3. 브랜치 명명 규칙](#3-브랜치-명명-규칙)
  - [4. 병합 규칙](#4-병합-규칙)
  - [5. Branch Rulesets](#5-branch-rulesets)
  - [6. 주의사항](#6-주의사항)

---
<br>

## 1. 브랜치 구조

```
main (프로덕션)
 ↑
release/* (릴리스)
 ↑
development (통합)
 ↑
feat/*, fix/*, refactor/*, chore/*, docs/*, test/* (작업 브랜치)
```

또는

```
hotfix/* (긴급 수정, main에서 분기)
 ↑
main
```

모든 작업 브랜치는 `development`에서 분기하고, `development`로 병합합니다.
`main`에는 반드시 `release/*` 또는 `hotfix/*` 브랜치를 통해서만 병합합니다.

---
<br>

## 2. 브랜치 역할

| 브랜치 | 역할 |
| :--- | :--- |
| `main` | 프로덕션 브랜치. 배포된 코드가 반영됩니다. 직접 커밋은 금지됩니다. |
| `development` | 통합 브랜치. 모든 작업 브랜치의 병합 대상이며, 기능 통합 및 테스트를 진행합니다. |
| `release/*` | 릴리스 브랜치. 릴리스마다 `release/<version>` 형태로 새로 생성하고, `main`과 `development`에 병합한 뒤 삭제합니다. |
| `hotfix/*` | 긴급 수정 브랜치. `main`에서 분기하여 수정 후 `main`과 `development`에 병합합니다. |
| 작업 브랜치 | 개별 기능 개발, 버그 수정 등 실제 작업이 이루어지는 브랜치입니다. |

---
<br>

## 3. 브랜치 명명 규칙

작업 브랜치는 `<type>/<설명>` 형식으로 작성합니다.

| 타입 | 용도 | 예시 |
| :--- | :--- | :--- |
| `feat` | 새로운 기능 | `feat/focus-mode` |
| `fix` | 버그 수정 | `fix/blur-overlap` |
| `chore` | 설정, 빌드, 의존성 등 | `chore/eslint-config` |
| `docs` | 문서 작업 | `docs/contributing-guide` |
| `refactor` | 리팩토링 | `refactor/extract-utils` |
| `test` | 테스트 코드 | `test/focus-mode-unit` |
| `release` | 릴리스 준비 | `release/1.2.0` |
| `hotfix` | 긴급 수정 | `hotfix/critical-crash` |

- 영문 소문자, kebab-case 사용
- 간결하고 명확한 설명 작성

---
<br>

## 4. 병합 규칙

| 출발 | 도착 | 허용 여부 |
| :--- | :--- | :--- |
| 작업 브랜치 | `development` | **허용** (기본 흐름) |
| `fix/*` | `release/*` | **허용** (릴리스 QA 중 버그 수정) |
| `release/*` | `main` | **허용** (릴리스 완료 시) |
| `release/*` | `development` | **허용** (릴리스 완료 시) |
| `hotfix/*` | `main` | **허용** (긴급 수정 완료 시) |
| `hotfix/*` | `development` | **허용** (긴급 수정 완료 시) |
| `development` | `main` | **금지** |
| 작업 브랜치 | `main` | **금지** |
| 작업 브랜치 | `release/*` | **금지** |

> **핵심 원칙**: `main`에는 반드시 `release/*` 또는 `hotfix/*` 브랜치를 통해서만 병합합니다. `development`나 작업 브랜치에서 `main`으로 직접 병합하지 않습니다.

---
<br>

## 5. Branch Rulesets

GitHub Branch Rulesets로 다음 규칙이 설정되어 있습니다.

**`main`, `development`, `release/*` 공통 규칙:**

| 규칙 | 설명 |
| :--- | :--- |
| Restrict deletions | 브랜치 삭제 금지 |
| Require a pull request before merging | PR을 통해서만 병합 가능 |
| Require status checks to pass | CI 상태 체크 통과 필수 |
| Block force pushes | 강제 푸시 금지 |

**`release/*` 추가 규칙:**

| 규칙 | 설명 |
| :--- | :--- |
| Require deployments to succeed | Preview 환경 배포 성공 필수 |

---
<br>

## 6. 주의사항

### 작업 브랜치를 `main`에 직접 병합하면 안 되는 이유

작업 브랜치를 `development`를 거치지 않고 `main`에 직접 병합하면 다음과 같은 문제가 발생할 수 있습니다.

1. **커밋 불일치**: `development`에는 없는 커밋이 `main`에만 존재하게 되어, 두 브랜치 간 코드가 달라집니다.
2. **코드 유실**: 이후 `development` → `main` 병합 시, `main`에만 있던 변경 사항이 충돌하거나 덮어씌워질 수 있습니다.
3. **추적 어려움**: 어떤 코드가 어느 브랜치에 반영되었는지 파악하기 어려워집니다.

> Branch Rulesets로 기술적으로 방지하고 있지만, PR 생성 시 **base 브랜치가 올바른지 반드시 확인**합니다.

---

[← 협업 가이드로 돌아가기](./CONTRIBUTING.md)

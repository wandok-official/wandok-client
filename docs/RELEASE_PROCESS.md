# 릴리스 프로세스 가이드

이 문서는 릴리스 및 배포 프로세스를 정의합니다.

<br>

## 목차
- [릴리스 프로세스 가이드](#릴리스-프로세스-가이드)
  - [목차](#목차)
  - [1. 프로젝트 구조](#1-프로젝트-구조)
  - [2. 릴리스 절차](#2-릴리스-절차)
  - [3. 긴급 핫픽스 절차](#3-긴급-핫픽스-절차)
  - [4. 배포 방법](#4-배포-방법)
    - [4.1 웹 (apps/web)](#41-웹-appsweb)
    - [4.2 확장 프로그램 (apps/extension)](#42-확장-프로그램-appsextension)
  - [5. 버전 관리](#5-버전-관리)

---
<br>

## 1. 프로젝트 구조

| 앱 | 경로 | 배포 환경 |
| :--- | :--- | :--- |
| 웹 랜딩 페이지 | `apps/web` | Vercel |
| Chrome 확장 프로그램 | `apps/extension` | Chrome Web Store |

---
<br>

## 2. 릴리스 절차

```
1. development에서 release/<version> 브랜치 생성
2. release 브랜치에서 QA 진행
3. QA 완료 후 배포 심사 제출
4. 배포 완료 후 release → main 병합 (PR)
5. release → development 병합 (PR)
```

> `main`에는 반드시 `release/*` 브랜치를 통해서만 병합합니다. `development` → `main` 직접 병합은 금지됩니다. ([브랜치 전략](./BRANCH_STRATEGY.md#4-병합-규칙) 참고)

### 상세 단계

**1단계: 릴리스 브랜치 생성**

`development`에서 `release/<version>` 브랜치를 생성합니다.

```bash
git checkout development
git pull origin development
git checkout -b release/1.2.0
```

**2단계: QA 진행**

릴리스 브랜치에서 최종 점검을 진행합니다. QA 중 발견된 버그는 fix 브랜치를 생성하여 PR로 수정합니다.

```bash
# release 브랜치에서 fix 브랜치 생성
git checkout release/1.2.0
git checkout -b fix/릴리스-버그수정
```

```
fix/릴리스-버그수정 → release/1.2.0 (PR)
```

> `release/*` 브랜치에도 PR 필수 규칙이 적용되어 있으므로, 직접 push는 할 수 없습니다.

**3단계: 배포 심사 제출**

배포 심사에 올릴 코드를 릴리스 브랜치에 반영합니다. `release/*` 브랜치는 Preview 환경 배포 성공이 필수입니다.

**4단계: 병합**

배포가 완료되면 릴리스 브랜치를 `main`과 `development` 양쪽에 병합합니다.

```
release/<version> → main        (PR)
release/<version> → development (PR)
```

---
<br>

## 3. 긴급 핫픽스 절차

프로덕션에서 긴급한 버그가 발견된 경우, 릴리스 절차를 거치지 않고 `hotfix` 브랜치를 통해 빠르게 수정합니다.

```
1. main에서 hotfix/<설명> 브랜치 생성
2. 버그 수정 후 hotfix → main 병합 (PR)
3. hotfix → development 병합 (PR)
```

### 상세 단계

**1단계: hotfix 브랜치 생성**

`main`에서 `hotfix/<설명>` 브랜치를 생성합니다.

```bash
git checkout main
git pull origin main
git checkout -b hotfix/critical-crash
```

**2단계: 수정 및 병합**

버그를 수정한 후, `main`과 `development` 양쪽에 PR을 생성하여 병합합니다.

```
hotfix/critical-crash → main        (PR)
hotfix/critical-crash → development (PR)
```

> `main`에 병합되면 프로덕션 환경에 자동 배포됩니다. `development`에도 반드시 병합하여 코드 동기화를 유지합니다.

---
<br>

## 4. 배포 방법

### 4.1 웹 (apps/web)

Vercel을 통해 자동 배포됩니다.

- `main` 브랜치에 병합되면 프로덕션 환경에 자동 배포됩니다.
- PR 생성 시 Preview 배포가 생성됩니다.

### 4.2 확장 프로그램 (apps/extension)

Chrome Web Store에 수동으로 제출합니다.

1. 확장 프로그램을 빌드합니다.
   ```bash
   npm run build:extension
   ```
2. `dist` 폴더를 zip으로 압축합니다.
3. [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)에서 새 버전을 업로드합니다.
4. 심사 요청을 제출합니다.

---
<br>

## 5. 버전 관리

[Semantic Versioning](https://semver.org/lang/ko/)을 따릅니다.

```
MAJOR.MINOR.PATCH
```

| 구분 | 변경 시점 | 예시 |
| :--- | :--- | :--- |
| MAJOR | 호환되지 않는 변경 | `1.0.0` → `2.0.0` |
| MINOR | 기능 추가 (하위 호환) | `1.0.0` → `1.1.0` |
| PATCH | 버그 수정 (하위 호환) | `1.0.0` → `1.0.1` |

---

[← 협업 가이드로 돌아가기](./CONTRIBUTING.md)

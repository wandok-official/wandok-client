# 협업 가이드

이 문서는 프로젝트의 협업 가이드 진입점입니다. 전체 작업 흐름과 관련 문서를 안내합니다.

<br>

## 목차
- [협업 가이드](#협업-가이드)
  - [목차](#목차)
  - [1. 문서 목록](#1-문서-목록)
  - [2. 작업 흐름](#2-작업-흐름)

---
<br>

## 1. 문서 목록

| 문서 | 설명 |
| :--- | :--- |
| [이슈 관리 가이드](./ISSUE_MANAGEMENT.md) | 이슈 템플릿, 라벨, 이슈 관리 방법 |
| [브랜치 전략 가이드](./BRANCH_STRATEGY.md) | 브랜치 구조, 명명 규칙, 병합 규칙 |
| [코드 컨벤션 가이드](./CODE_CONVENTION.md) | 명명 규칙, 코드 스타일, Import 규칙 |
| [코드 리뷰 가이드](./CODE_REVIEW.md) | PR 작성 규칙, 리뷰 프로세스, 병합 조건 |
| [CI/CD 가이드](./CICD.md) | CI 파이프라인, 배포 환경, 파이프라인 실패 대응 |
| [릴리스 프로세스 가이드](./RELEASE_PROCESS.md) | 릴리스 절차, 배포 방법, 버전 관리 |

---
<br>

## 2. 작업 흐름

프로젝트의 기본 작업 흐름은 다음과 같습니다.

### Step 1. 이슈 생성

작업을 시작하기 전에 GitHub 이슈를 생성합니다.

- 이슈 템플릿을 사용하여 작성합니다.
- 적절한 라벨을 지정합니다.

> 자세한 내용: [이슈 관리 가이드](./ISSUE_MANAGEMENT.md)

### Step 2. 브랜치 생성

`development`에서 작업 브랜치를 생성합니다.

```bash
git checkout development
git pull origin development
git checkout -b feat/기능-설명
```

> 자세한 내용: [브랜치 전략 가이드](./BRANCH_STRATEGY.md)

### Step 3. 개발 및 커밋

코드를 작성하고 커밋합니다.

- 커밋 메시지는 한글로 작성합니다.
- 커밋 타입: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`
- 형식: `<type>: <설명>`

```bash
git add 파일명
git commit -m 'feat: 포커스 모드 구현'
```

> 코드 작성 시 참고: [코드 컨벤션 가이드](./CODE_CONVENTION.md)

### Step 4. PR 생성

`development` 브랜치를 base로 PR을 생성합니다.

- PR 템플릿의 자가 점검 리스트를 확인합니다.
- 관련 이슈 번호를 연결합니다.

> 자세한 내용: [코드 리뷰 가이드](./CODE_REVIEW.md)

### Step 5. CI 확인

PR이 생성되면 CI가 자동으로 실행됩니다.

- 린트, 테스트, 빌드 등의 상태 체크를 확인합니다.
- web 관련 변경 시 Vercel Preview 배포가 생성됩니다.
- CI 실패 시 원인을 수정한 후 다시 push합니다.

> 자세한 내용: [CI/CD 가이드](./CICD.md)

### Step 6. 코드 리뷰

팀원이 코드를 리뷰합니다.

- 리뷰 피드백의 우선순위(P1/P2/P3)에 따라 대응합니다.
- P1은 필수, P2는 권장, P3은 선택입니다.

> 자세한 내용: [코드 리뷰 가이드](./CODE_REVIEW.md#22-피드백-우선순위)

### Step 7. 병합

리뷰 승인 후 PR을 병합합니다.

- CI 통과 및 승인이 완료되어야 병합할 수 있습니다.
- 병합 완료 후 작업 브랜치를 삭제합니다.

### Step 8. 릴리스

릴리스 시점에 `release/<version>` 브랜치를 생성하여 배포를 진행합니다.

- `main`에 병합되면 Vercel Production에 자동 배포됩니다.

> 자세한 내용: [릴리스 프로세스 가이드](./RELEASE_PROCESS.md)

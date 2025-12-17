# wandok-extension

## Tech Stack
- **Runtime**: Node.js (LTS 권장)
- **Framework**: React + TypeScript (Vite)
- **Package Manager**: npm
- **Linter/Formatter**: ESLint (Flat Config) + Stylistic Plugin
- **Git Hooks**: Husky + lint-staged

---
<br>

## Development Guide
프로젝트의 코드 규칙과 컨벤션은 아래 문서에서 상세히 확인할 수 있습니다. 개발 시작 전 반드시 읽어주세요.

👉 **[Code Convention Guide 보러 가기](./docs/CODE_CONVENTION.md)**

---
<br>

## Directory Structure
```
.
├── docs/                   # 프로젝트 컨벤션 및 문서
│   └── CODE_CONVENTION.md  # 코드 컨벤션 및 규칙 가이드
├── public/                 # 정적 파일 (이미지, 폰트 등)
├── src/                    # 주요 소스 코드
│   ├── App.tsx             # 메인 컴포넌트
│   └── main.tsx            # 진입점
├── eslint.config.js        # ESLint 설정
├── tsconfig.json           # TypeScript 설정
└── vite.config.ts          # Vite 설정
```

---
<br>

## Getting Started
```Bash
# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. 빌드
npm run build
```

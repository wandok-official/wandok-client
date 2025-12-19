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
├── apps
│   ├── extension                     # 크롬 확장 프로그램 (핵심 모듈)
│   │   ├── src                       # TypeScript 소스 코드
│   │   │   ├── background.ts         # 서비스 워커: 온/오프 토글 및 스크립트 주입 제어
│   │   │   ├── content.ts            # 메인 로직: 호버 감지 및 관계 기반 블러 처리
│   │   │   ├── extractTextNodes.ts   # 헬퍼: DOM 내 순수 텍스트 노드 추출 로직
│   │   │   └── splitParagraph.ts     # 텍스트 노드 분할 및 래핑 유틸리티
│   │   ├── public                    # 정적 자원 (Manifest, CSS, Icons)
│   │   │   ├── manifest.json         # 확장 프로그램 설정 (V3)
│   │   │   └── content.css           # 블러 효과 및 UI 스타일 정의
│   │   └── dist                      # 빌드 결과물 (크롬 브라우저에 로드되는 최종 파일)
│   │
│   └── web                           # 서비스 소개 웹 사이트
│       └── src                       # React/Vite 기반 프론트엔드 코드
│
├── docs                              # 문서화
│   └── CODE_CONVENTION.md            # 협업을 위한 코드 컨벤션 및 스타일 가이드
│
├── vite.config.ts                    # 웹 서비스 빌드 설정
├── vite.extension.config.ts          # 확장 프로그램 특화 빌드 설정 (Vite 기반)
└── tsconfig.json                     # 프로젝트 전반의 TypeScript 환경 설정
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

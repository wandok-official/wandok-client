# 코드 컨벤션 가이드

이 문서는 프로젝트의 코드 일관성과 품질 유지를 위한 규칙을 정의합니다.

<br>

## 목차
- [코드 컨벤션 가이드](#코드-컨벤션-가이드)
  - [목차](#목차)
  - [1. 명명 규칙 (Naming Conventions)](#1-명명-규칙-naming-conventions)
    - [1.1 Boolean 변수](#11-boolean-변수)
    - [1.2 배열(Array) 변수](#12-배열array-변수)
    - [1.3 파일 및 컴포넌트](#13-파일-및-컴포넌트)
  - [2. 코드 스타일 (Syntax \& Formatting)](#2-코드-스타일-syntax--formatting)
    - [2.1 따옴표 (Quotes)](#21-따옴표-quotes)
    - [2.2 포맷팅 일반](#22-포맷팅-일반)
    - [2.3 TypeScript 전용 규칙](#23-typescript-전용-규칙)
  - [3. 함수 및 모듈 (Functions \& Modules)](#3-함수-및-모듈-functions--modules)
    - [3.1 함수 작성](#31-함수-작성)
    - [3.2 Import 규칙](#32-import-규칙)
    - [3.3 Import/Export 순서](#33-importexport-순서)
  - [4. 자동화 및 린트 (Automation)](#4-자동화-및-린트-automation)
  - [5. IDE 설정 (VS Code)](#5-ide-설정-vs-code)

---
<br>

## 1. 명명 규칙 (Naming Conventions)

### 1.1 Boolean 변수
Boolean 변수는 `is` 접두사를 사용하여 상태를 명확히 표현합니다.

| 종류 | 형식 | 예시 |
| :--- | :--- | :--- |
| **상태 확인** | `is + 명사` | `isUser`, `isHappyUser` |
| **진행 상태** | `is + 동명사(~ing)` | `isEating`, `isLoading` |
| **완료 상태** | `is + 과거분사` | `isHighlighted`, `isHidden` |

### 1.2 배열(Array) 변수
기본적으로 **`~List`** 접미사를 사용합니다.
단, 복수형(`s`)이 문맥상 더 자연스러운 경우 팀 공유 후 예외적으로 허용합니다.
- **기본**: `userList`, `itemList`
- **예외**: `items` (사전 공유 필요)

### 1.3 파일 및 컴포넌트
- **React 컴포넌트**: PascalCase (`UserProfile.tsx`)
- **일반 TS/JS 파일**: camelCase 권장 (`formatDate.ts`, `apiClient.ts`)

---
<br>

## 2. 코드 스타일 (Syntax & Formatting)

이 규칙들은 `eslint.config.js`에 정의되어 있으며, 위반 시 린트 에러가 발생합니다.

### 2.1 따옴표 (Quotes)
언어 및 환경에 따라 따옴표 사용을 엄격히 구분합니다.

- **JavaScript/TypeScript**: **홑따옴표(`'`)** 사용. 단, 문자열 내에 홑따옴표가 포함된 경우 이스케이프 대신 쌍따옴표 사용이 허용됩니다. (`avoidEscape: true`)
  ```javascript
  const message = 'Hello World';
  const quote = "It's a string"; // 홑따옴표 포함 시 쌍따옴표 허용
  ```

- **JSX 속성(Attribute)**: **쌍따옴표(")** 사용 (HTML 표준 준수)
  ```jsx
  <Component className="container" />
  ```

### 2.2 포맷팅 일반
- **들여쓰기 (Indent)**: Space 2칸
- **세미콜론 (Semi)**: 문장 끝에 항상 사용 (always)
- **코드 길이 (Max Length)**: 한 줄당 최대 100자
- **후행 쉼표 (Trailing Comma)**: 멀티라인 배열/객체/함수는 항상 포함, **import 구문에서는 사용 금지**
  ```javascript
  // 배열/객체: 멀티라인일 때 후행 쉼표 필수
  const obj = {
    key: 'value', // 쉼표 필수
  };

  // import: 후행 쉼표 금지
  import { useState, useEffect } from 'react';
  ```
- **변수 선언**: var 사용 금지, const 사용을 기본으로 하되 재할당이 필요한 경우 let 사용
- **파일 끝 개행**: 모든 파일은 끝에 개행 문자가 있어야 합니다. (`@stylistic/eol-last`)
- **연속 빈 줄 제한**: 연속 빈 줄은 최대 1줄까지 허용됩니다. (`no-multiple-empty-lines`)
- **console 사용**: `console.*` 사용 시 경고가 발생합니다. 디버깅 후 반드시 제거하세요. (`no-console: warn`)
- **빈 블록**: 빈 블록(`{}`) 사용 시 경고가 발생합니다. (`no-empty: warn`)

### 2.3 TypeScript 전용 규칙
TypeScript 파일(`*.ts`, `*.tsx`)에 추가로 적용되는 규칙입니다.

- **type import 권장**: 타입만 가져올 때는 `import type`을 사용합니다. (`@typescript-eslint/consistent-type-imports: warn`)
  ```typescript
  // Good
  import type { User } from './types';

  // Bad (자동 수정됨)
  import { User } from './types'; // User가 타입으로만 사용될 경우
  ```
- **미사용 변수**: 미사용 변수는 에러로 처리되지만, `_` 접두사가 붙은 인자는 허용됩니다. (`@typescript-eslint/no-unused-vars`)
  ```typescript
  // OK — 사용하지 않는 인자에 _ 접두사
  const handler = (_event: Event) => { ... };
  ```

---
<br>

## 3. 함수 및 모듈 (Functions & Modules)
### 3.1 함수 작성
- **화살표 함수 (Arrow Function)** 사용을 기본 원칙으로 합니다.
- 함수는 필요한 곳에서만 사용할 수 있도록, 외부 공개가 필요한 경우에만 export 합니다.

### 3.2 Import 규칙
- **Selective Import**: 전체 라이브러리를 가져오는 것`(import * as ...)`을 지양하고, 필요한 함수만 선택적으로 import 합니다.
    - Bad:
        ```javascript
        import * as utils from './utils';
        ```
    - Good:
        ```javascript
        import { formatDate } from './utils';
        ```

### 3.3 Import/Export 순서
`eslint-plugin-simple-import-sort`의 기본 규칙에 따라 import와 export 모두 자동 정렬됩니다. 커밋 시 `eslint --fix`로 자동 수정되므로 수동으로 정렬할 필요는 없습니다.

기본 정렬 순서:
1. **Side effect imports** (`import './styles.css'`)
2. **Node.js 내장 모듈** (`node:fs`, `path` 등)
3. **외부 패키지** (`react`, `zustand` 등)
4. **내부 모듈** - 상대 경로 (`./`, `../`, 깊이순 정렬)

예시 코드:
```javascript
import './App.css';

import path from 'path';

import React, { useState } from 'react';
import { create } from 'zustand';

import { formatDate } from '../utils/formatDate';
import { UserProfile } from './UserProfile';
```

---
<br>

## 4. 자동화 및 린트 (Automation)

이 프로젝트는 **Husky**와 **lint-staged**가 설정되어 있습니다.

- `git commit` 실행 시, 스테이징된 파일에 대해 자동으로 `eslint --fix`가 수행됩니다. (`pre-commit` 훅)
- `git push` 실행 시에도 동일한 린트 검사가 실행됩니다. (`pre-push` 훅)
- 자동 수정 가능한 규칙(따옴표, 세미콜론, import 정렬 등)은 자동으로 수정됩니다.
- 자동 수정이 불가능한 린트 에러가 발생하면 커밋/푸시가 중단되므로, 에러를 직접 수정한 뒤 다시 시도해야 합니다.

---
<br>

## 5. IDE 설정 (VS Code)
TypeScript 버전 불일치로 인한 오작동을 방지하기 위해, VS Code에서 프로젝트 버전을 사용하도록 설정합니다.
1. `cmd` + `shift` + `p` (Mac) / `ctrl` + `shift` + `p` (Win)
2. **"TypeScript: Select TypeScript Version"** 검색 및 실행
3. **"Use Workspace Version"** 선택

---

[← 협업 가이드로 돌아가기](./CONTRIBUTING.md)

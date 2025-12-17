# Code Convention Guide

이 문서는 프로젝트의 코드 일관성과 품질 유지를 위한 규칙을 정의합니다.

<br>

## 목차
- [Code Convention Guide](#code-convention-guide)
  - [목차](#목차)
  - [1. 명명 규칙 (Naming Conventions)](#1-명명-규칙-naming-conventions)
    - [1.1 Boolean 변수](#11-boolean-변수)
    - [1.2 배열(Array) 변수](#12-배열array-변수)
    - [1.3 파일 및 컴포넌트](#13-파일-및-컴포넌트)
  - [2. 코드 스타일 (Syntax \& Formatting)](#2-코드-스타일-syntax--formatting)
    - [2.1 따옴표 (Quotes)](#21-따옴표-quotes)
    - [2.2 중괄호 및 블록 (Braces)](#22-중괄호-및-블록-braces)
    - [2.3 포맷팅 일반](#23-포맷팅-일반)
  - [3. 함수 및 모듈 (Functions \& Modules)](#3-함수-및-모듈-functions--modules)
    - [3.1 함수 작성](#31-함수-작성)
    - [3.2 Import 규칙](#32-import-규칙)
    - [3.3 Import 순서](#33-import-순서)
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

- **JavaScript/TypeScript**: **홑따옴표(`'`)** 사용
  ```javascript
  const message = 'Hello World';
  ```


- **JSX 속성(Attribute)**: **쌍따옴표(")** 사용 (HTML 표준 준수)
  ```jsx
  <Component className="container" />
  ```

### 2.2 중괄호 및 블록 (Braces)
제어문(`if`, `for` 등)이나 함수 본문이 단 한 줄이라도 반드시 **중괄호 {}** 를 사용합니다.
- Bad:
  ```javascript
  if (isValid) return;
  const fn = () => console.log('bad');
  ```
- Good:
  ```javascript
  if (isValid) {
    return;
  }
  const fn = () => {
    console.log('중괄호를 작성해주세요.');
  };
  ```

### 2.3 포맷팅 일반
- **들여쓰기 (Indent)**: Space 2칸
- **세미콜론 (Semi)**: 문장 끝에 항상 사용 (always)
- **코드 길이 (Max Length)**: 한 줄당 최대 100자
- **후행 쉼표 (Trailing Comma)**: 멀티라인 배열/객체 작성 시 항상 포함
  ```javascript
  const obj = {
    key: 'value', // 쉼표 필수
  };
  ```
- **변수 선언**: var 사용 금지, const 사용을 기본으로 하되 재할당이 필요한 경우 let 사용

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

### 3.3 Import 순서
import 구문은 아래 그룹 순서대로 정렬하며, 가독성을 위해 그룹 간 빈 줄을 권장합니다.
1. **Node.js 내장 모듈** (`fs`, `path` 등)
2. **외부 라이브러리 (npm 패키지)** (`react`, `lodash` 등)
3. **내부 애플리케이션 모듈**
   1. 상수 (`constants`) 및 설정 (`config`)
   2. 유틸리티 (`lib`, `utils`)
   3. 비즈니스 로직 및 데이터 계층 (`services`, `repository`)
4. **스타일시트** (`.css`, `.scss`)

예시 코드:
```javascript
// 1. Node.js 내장 모듈
import path from 'path';

// 2. 외부 라이브러리
import React, { useState } from 'react';
import _ from 'lodash';

// 3. 내부 모듈 (상수 -> 유틸 -> 비즈니스 로직)
import { API_URL } from './constants';
import { formatDate } from './utils/formatDate';
import { getUserData } from './services/userService';

// 4. 스타일시트
import './App.css';
```

---
<br>

## 4. 자동화 및 린트 (Automation)

본 프로젝트는 **Husky**와 **lint-staged**가 설정되어 있습니다.

- `git commit` 실행 시, 변경된 파일(`staged`)에 대해 자동으로 ESLint 검사가 수행됩니다.
- **자동 수정(`--fix`) 옵션은 적용되지 않습니다.**
    - 이는 개발자가 변경 사항을 명확히 인지하고, 컨벤션을 숙지하기 위함입니다.
    - 린트 에러가 발생하면 커밋이 중단되므로, 에러를 직접 수정한 뒤 다시 커밋해야 합니다.

---
<br>

## 5. IDE 설정 (VS Code)
TypeScript 버전 불일치로 인한 오작동을 방지하기 위해, VS Code에서 프로젝트 버전을 사용하도록 설정합니다.
1. `cmd` + `shift` + `p` (Mac) / `ctrl` + `shift` + `p` (Win)
2. **"TypeScript: Select TypeScript Version"** 검색 및 실행
3. **"Use Workspace Version"** 선택

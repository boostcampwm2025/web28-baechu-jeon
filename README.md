## 🥬 web28-baechu-jeon

## 프로젝트 소개

안녕하세요 저희는 SHOW ME THE 구조~!  
프로젝트 업로드를 통한 AI 분석 및 시각화를 제공하여 프로젝트를 쉽게 파악할 수 있도록 도움을 주는 서비스입니다!

## 배포 주소

## https://showmethegujo.site

## 주요 기능

### 1. 프로젝트 업로드

- **ZIP 업로드**: 로컬에서 압축한 프로젝트 폴더를 드래그 앤 드롭 또는 선택하여 업로드합니다.
- **GitHub 연동**: GitHub 저장소 URL을 입력하면 해당 저장소의 코드를 가져와 분석합니다.
- **탭 전환**: ZIP / GitHub 중 편한 방식을 선택해 사용할 수 있습니다.

### 2. 분석 진행 상태 확인

- 업로드 후 분석이 비동기로 진행되며, 진행 상태를 확인할 수 있는 화면을 제공합니다.
- 분석이 완료되면 결과 페이지로 이동하여 시각화와 코드 설명을 바로 확인할 수 있습니다.

### 3. AI 3단계 자동 분석

- **[STEP1] 중요한 파일 추천**
  - AI가 프로젝트의 파일 목록과 README, package.json을 살펴보고, 꼭 확인해야 할 핵심 파일 8~20개를 골라줍니다. 여기에는 "주요 로직", "진입점", "API 경로" 등이 포함됩니다.
- **2단계 구조와 의도 파악**
  - 추천된 파일을 기반으로, 각 폴더와 파일이 어떤 역할을 하는지, 프로젝트가 어떤 목적과 구조를 가지고 있는지, 핵심 기능과 기술 스택, 사용자 스토리를 함께 정리합니다.
- **3단계 코드 설명 문서 생성**
  - 주요 파일마다 개요와 핵심 코드 내용을 정리한 문서를 자동으로 만들어, 새로운 개발자나 유지보수 담당자가 빠르게 이해할 수 있도록 도와줍니다.

### 4. 결과 시각화 및 코드 뷰

- **구조 시각화 탭**: 폴더·파일을 트리 형태의 노드로 표시합니다. 노드를 클릭하면 해당 경로의 역할 설명을 확인할 수 있고, 프로젝트 전체 개요(의도, 기술 스택, 사용자 스토리)도 함께 제공됩니다.
  - 유저스토리 노드를 클릭하면 연관된 폴더·파일이 하이라이트 표시 됩니다.
  - 하이라이트된 주요 파일들을 클릭해 코드탭으로 이동할 수 있습니다.
- **코드 설명 탭**: 3단계에서 생성된 파일별 마크다운 요약을 탭으로 전환해 읽을 수 있습니다. 파일 경로를 선택하면 해당 파일의 개요와 주요 메서드 설명을 확인할 수 있습니다.
- **저장·공유**: 결과 페이지 링크를 공유하여 팀원과 함께 볼 수 있습니다.

---

## 🛠 기술 스택

### Frontend

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-443E38?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![React Flow](https://img.shields.io/badge/React_Flow-FF0072?style=for-the-badge&logo=react&logoColor=white)
![React Markdown](https://img.shields.io/badge/React_Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white)

### Backend

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google%20gemini&logoColor=white)

### Infra & DevOps

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2671E5?style=for-the-badge&logo=githubactions&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Turborepo](https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white)

---

## 📁 프로젝트 구조

```
web28-boostcamp/
├── apps/
│   ├── server/                 # NestJS 백엔드 서버
│   │   ├── src/
│   │   │   ├── ai/             # AI (Gemini) 분석 모듈
│   │   │   ├── analyses/       # 분석 처리 모듈
│   │   │   ├── code/           # 코드 처리 모듈
│   │   │   ├── database/       # 데이터베이스 모듈
│   │   │   ├── intentions/     # 의도 분석 모듈
│   │   │   ├── prisma/         # Prisma 서비스
│   │   │   ├── projects/       # 프로젝트 관리 모듈
│   │   │   ├── sse/            # Server-Sent Events 모듈
│   │   │   ├── storage/        # 스토리지 모듈
│   │   │   └── visualizations/ # 시각화 모듈
│   │   └── prisma/             # Prisma 스키마 & 마이그레이션
│   │
│   └── web/                    # Next.js 프론트엔드
│       └── src/
│           ├── api/            # API 클라이언트
│           ├── app/            # Next.js App Router
│           ├── components/     # React 컴포넌트
│           ├── hooks/          # 커스텀 훅
│           ├── stores/         # Zustand 스토어
│           ├── types/          # TypeScript 타입 정의
│           └── utils/          # 유틸리티 함수
│
├── packages/
│   ├── eslint-config/          # 공유 ESLint 설정
│   ├── typescript-config/      # 공유 TypeScript 설정
│   └── ui/                     # 공유 UI 컴포넌트
│
├── nginx/                      # Nginx 설정
├── docker-compose.yml          # Docker Compose 설정
├── turbo.json                  # Turborepo 설정
└── pnpm-workspace.yaml         # pnpm 워크스페이스 설정
```

---

## 🚀 실행 방법

### 사전 요구사항

- Node.js >= 18
- pnpm 9.0.0
- Docker & Docker Compose
- PostgreSQL
- Redis

### 1. 저장소 클론

```bash
git clone https://github.com/boostcampwm2025/web28-baechu-jeon.git
cd web28-baechu-jeon
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

루트 디렉토리와 `apps/server` 디렉토리에 `.env` 파일을 생성합니다. (아래 환경 변수 설정 섹션 참고)

### 4. 데이터베이스 마이그레이션

```bash
cd apps/server
pnpm prisma:migrate
```

### 5. 개발 서버 실행

```bash
# 루트 디렉토리에서 모든 앱 동시 실행
pnpm dev
```

또는 개별 실행:

```bash
# 백엔드 서버
cd apps/server
pnpm dev

# 프론트엔드
cd apps/web
pnpm dev
```

### Docker로 실행 (프로덕션)

```bash
docker compose up -d
```

---

## 📜 스크립트

| 명령어             | 설명                   |
| ------------------ | ---------------------- |
| `pnpm dev`         | 모든 앱 개발 모드 실행 |
| `pnpm build`       | 모든 앱 빌드           |
| `pnpm lint`        | 전체 린트 검사         |
| `pnpm format`      | 코드 포맷팅 (Prettier) |
| `pnpm check-types` | 타입 검사              |

### 서버 전용 스크립트 (apps/server)

| 명령어                 | 설명                   |
| ---------------------- | ---------------------- |
| `pnpm prisma:generate` | Prisma 클라이언트 생성 |
| `pnpm prisma:migrate`  | DB 마이그레이션 실행   |
| `pnpm prisma:studio`   | Prisma Studio 실행     |
| `pnpm test`            | 테스트 실행            |

---

## 팀원 소개

|                                           김근선                                            |                                           노지혜                                            |                                           신채은                                            |                                           추정우                                           |
| :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
|                       [@geunseonkim](https://github.com/geunseonkim)                        |                           [@hienjoy](https://github.com/hienjoy)                            |                      [@chae-eunshin](https://github.com/chae-eunshin)                       |                         [@chuka9809](https://github.com/chuka9809)                         |
| <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/155948612?v=4" /> | <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/103023483?v=4" /> | <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/115004531?v=4" /> | <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/76270678?v=4" /> |
|                                나는야 배추전을 먹는 개발자🥬                                |                                      배추전 히엔조이!                                       |                      뜨거운 배추전처럼 뜨거운 열정으로 임하겠습니다~!                       |                             추어탕처럼 진득하게 임하겠습니다~                              |

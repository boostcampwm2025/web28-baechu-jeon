## 🥬 web28-baechu-jeon

## 프로젝트 소개

안녕하세요 저희는 SHOW ME THE 구조~!  
프로젝트 업로드를 통한 AI 분석 및 시각화를 제공하여 프로젝트를 쉽게 파악할 수 있도록 도움을 주는 서비스입니다!

## 배포 주소

https://showmethegujo.site

## 팀원 소개

|                                           김근선                                            |                                           노지혜                                            |                                           신채은                                            |                                           추정우                                           |
| :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------: |
|                       [@geunseonkim](https://github.com/geunseonkim)                        |                           [@hienjoy](https://github.com/hienjoy)                            |                      [@chae-eunshin](https://github.com/chae-eunshin)                       |                         [@chuka9809](https://github.com/chuka9809)                         |
| <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/155948612?v=4" /> | <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/103023483?v=4" /> | <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/115004531?v=4" /> | <img width="300" alt="image" src="https://avatars.githubusercontent.com/u/76270678?v=4" /> |
|                                나는야 배추전을 먹는 개발자🥬                                |                                      배추전 히엔조이!                                       |                      뜨거운 배추전처럼 뜨거운 열정으로 임하겠습니다~!                       |                             추어탕처럼 진득하게 임하겠습니다~                              |

---

## 🛠 기술 스택

### Frontend
| 분류 | 기술 |
|------|------|
| Framework | Next.js 16, React 19 |
| Language | TypeScript 5 |
| State Management | Zustand |
| Styling | Tailwind CSS 4 |
| Visualization | React Flow (@xyflow/react), Dagre |
| Markdown | React Markdown, Remark GFM |

### Backend
| 분류 | 기술 |
|------|------|
| Framework | NestJS 11 |
| Language | TypeScript 5 |
| Database | PostgreSQL + Prisma ORM |
| Queue | BullMQ + Redis (IORedis) |
| AI | Google Gemini (@google/genai) |
| Storage | NCloud Object Storage (S3 Compatible) |

### Infra & DevOps
| 분류 | 기술 |
|------|------|
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Web Server | Nginx |
| Monorepo | Turborepo + pnpm Workspaces |
| Cloud | Naver Cloud Platform (NCP) |

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

## ⚙️ 환경 변수 설정

### 루트 `.env` (Docker Compose용)

```env
# Web
WEB_PORT=3001

# Server
SERVER_PORT=3000

# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=mydb
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# AI
GEMINI_API_KEY=your_gemini_api_key

# Web URL
WEB_URL=http://localhost:3001

# NCloud Object Storage
NCLOUD_ACCESS_KEY_ID=your_ncloud_access_key
NCLOUD_SECRET_ACCESS_KEY=your_ncloud_secret_key
NCLOUD_S3_ENDPOINT=https://kr.ncloudstorage.com
NCLOUD_BUCKET=your_bucket_name
```

### `apps/server/.env` (로컬 개발용)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/mydb?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# AI
GEMINI_API_KEY=your_gemini_api_key

# NCloud Object Storage
NCLOUD_ACCESS_KEY_ID=your_ncloud_access_key
NCLOUD_SECRET_ACCESS_KEY=your_ncloud_secret_key
NCLOUD_S3_ENDPOINT=https://kr.ncloudstorage.com
NCLOUD_BUCKET=your_bucket_name
```

### 환경 변수 설명

| 변수명 | 설명 |
|--------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 |
| `REDIS_HOST` | Redis 호스트 주소 |
| `REDIS_PORT` | Redis 포트 번호 |
| `GEMINI_API_KEY` | Google Gemini API 키 (AI 분석용) |
| `NCLOUD_ACCESS_KEY_ID` | NCloud Object Storage Access Key |
| `NCLOUD_SECRET_ACCESS_KEY` | NCloud Object Storage Secret Key |
| `NCLOUD_S3_ENDPOINT` | NCloud S3 엔드포인트 URL |
| `NCLOUD_BUCKET` | NCloud 버킷 이름 |
| `WEB_URL` | 프론트엔드 URL (CORS 설정용) |

---

## 📜 스크립트

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 모든 앱 개발 모드 실행 |
| `pnpm build` | 모든 앱 빌드 |
| `pnpm lint` | 전체 린트 검사 |
| `pnpm format` | 코드 포맷팅 (Prettier) |
| `pnpm check-types` | 타입 검사 |

### 서버 전용 스크립트 (apps/server)

| 명령어 | 설명 |
|--------|------|
| `pnpm prisma:generate` | Prisma 클라이언트 생성 |
| `pnpm prisma:migrate` | DB 마이그레이션 실행 |
| `pnpm prisma:studio` | Prisma Studio 실행 |
| `pnpm test` | 테스트 실행 |

---

## 📝 라이선스

This project is UNLICENSED.

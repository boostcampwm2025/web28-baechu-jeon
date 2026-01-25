import { EdgeInput, NodeTemp, Step2Json } from '../types/graph-builder.type';

export function buildStep2(step2: Step2Json, maxDepth: number) {
  const nodes: NodeTemp[] = [];
  const edges: EdgeInput[] = [];

  // apps 외에 다른 root 폴더도 포함되어 있어서 그거 필터링 해야 할 듯?
  // 트리 모양이 이상할 것 같음. 근데 흠...
  // 그냥 프롬프트에서 root의 애매한 폴더 빼달라고 하면 될 수도. git, docker 등등 그래서 apps만 받도록.

  const map = new Map<string, NodeTemp>();

  // 1. folder_path -> node (중복 제거)
  for (const item of step2.responsibility_hypotheses) {
    const path = normalize(item.folder_path, maxDepth);

    if (!map.has(path)) {
      map.set(path, {
        path,
        label: getLastSegment(path),
        contents: item.hypothesis,
      });
    }
  }

  // Map -> nodes 배열
  for (const node of map.values()) {
    nodes.push(node);
  }

  // 2. 부모 -> 자식 edge 생성 (트리 구조)
  for (const node of map.values()) {
    const parentPath = getParentPath(node.path);

    if (parentPath && map.has(parentPath)) {
      edges.push({
        sourcePath: parentPath,
        targetPath: node.path,
        // type: 'folder',
      });
    }
  }

  return { nodes, edges };
}

// // {
// //   "responsibility_hypotheses": [
// //     {
// //       "folder_path": "폴더 경로",
// //       "hypothesis": "이 폴더가 무슨 일을 할 가능성이 있는지 가설",
// //       "evidence": "가설의 근거 (구조적 특징, 메타데이터 내용 등)",
// //       "confidence": 0.0 ~ 1.0
// //     }
// //   ]
// // }

function normalize(path: string, maxDepth: number): string {
  const parts = path.split('/').filter(Boolean);
  return parts.slice(0, maxDepth).join('/');
}

function getLastSegment(path: string): string {
  const parts = path.split('/').filter(Boolean);
  return parts[parts.length - 1] ?? path;
}

function getParentPath(path: string): string | null {
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 1) return null;
  return parts.slice(0, -1).join('/');
}

// console.log(
//   buildStep2(
//     {
//       responsibility_hypotheses: [
//         {
//           evidence:
//             "하위 폴더에 'ISSUE_TEMPLATE'와 'workflows'가 있으며, 'custom.md' (이슈 템플릿), 'PULL_REQUEST_TEMPLATE.md' (PR 템플릿), 'deploy-docker.yml' (CI/CD 워크플로우) 파일들이 존재합니다.",
//           confidence: 'high',
//           hypothesis:
//             '프로젝트의 GitHub 저장소와 관련된 설정, 이슈 템플릿, 그리고 CI/CD 워크플로우를 관리합니다.',
//           folder_path: '.github',
//         },
//         {
//           evidence:
//             "파일 '.github/ISSUE_TEMPLATE/custom.md'의 내용이 이슈 템플릿으로 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis: 'GitHub 이슈 생성을 위한 템플릿 파일을 포함합니다.',
//           folder_path: '.github/ISSUE_TEMPLATE',
//         },
//         {
//           evidence:
//             "파일 '.github/workflows/deploy-docker.yml'은 Docker 배포와 관련된 워크플로우를 정의하고 있음을 시사합니다.",
//           confidence: 'high',
//           hypothesis:
//             'GitHub Actions를 사용한 CI/CD(지속적 통합/지속적 배포) 워크플로우 정의 파일을 포함합니다.',
//           folder_path: '.github/workflows',
//         },
//         {
//           evidence:
//             "파일명이 'Dockerfile-server'로 백엔드 서버의 컨테이너 이미지를 생성하는 스크립트임을 명확히 나타냅니다. 프로젝트의 모노레포 구조에서 'server' 애플리케이션에 해당합니다.",
//           confidence: 'high',
//           hypothesis:
//             '백엔드 서버 애플리케이션을 Docker 이미지로 빌드하기 위한 Dockerfile입니다.',
//           folder_path: 'Dockerfile-server',
//         },
//         {
//           evidence:
//             "파일명이 'Dockerfile-web'으로 프론트엔드 웹의 컨테이너 이미지를 생성하는 스크립트임을 명확히 나타냅니다. 프로젝트의 모노레포 구조에서 'web' 애플리케이션에 해당합니다.",
//           confidence: 'high',
//           hypothesis:
//             '프론트엔드 웹 애플리케이션을 Docker 이미지로 빌드하기 위한 Dockerfile입니다.',
//           folder_path: 'Dockerfile-web',
//         },
//         {
//           evidence:
//             '제공된 파일 내용이 프로젝트의 모든 중요한 정보를 담고 있습니다.',
//           confidence: 'high',
//           hypothesis:
//             '프로젝트의 개요, 핵심 기능, 개발 기간, 서비스 정보, 팀 소개, 그라운드룰, 기술 스택, 네이밍 규칙 및 컨벤션 등 프로젝트 전반에 대한 정보를 제공합니다.',
//           folder_path: 'README.md',
//         },
//         {
//           evidence:
//             "루트 'package.json'에서 'turbo run' 명령어가 'start:dev --filter=web' 및 'start:dev --filter=server'와 같이 사용되며, 'pnpm-workspace.yaml'이 워크스페이스를 정의하고 'server'와 'web' 폴더를 포함합니다.",
//           confidence: 'high',
//           hypothesis:
//             '모노레포 구조 내에서 개별 애플리케이션(백엔드 서버, 프론트엔드 웹)의 코드를 포함하는 루트 폴더입니다.',
//           folder_path: 'apps',
//         },
//         {
//           evidence:
//             "'apps/server/package.json'에 `@nestjs/common`, `@nestjs/core`, `typeorm`, `mysql2`, `vm2` 등 NestJS 및 관련 기술 스택 의존성이 명시되어 있으며, 'nest-cli.json' 파일도 존재합니다.",
//           confidence: 'high',
//           hypothesis:
//             'NestJS 프레임워크 기반의 백엔드 애플리케이션 코드와 설정을 포함합니다.',
//           folder_path: 'apps/server',
//         },
//         {
//           evidence:
//             '표준 NestJS 프로젝트 구조에서 애플리케이션 로직, 모듈, 컨트롤러, 서비스, 엔티티 등이 이 폴더 아래에 위치합니다.',
//           confidence: 'high',
//           hypothesis:
//             'NestJS 백엔드 애플리케이션의 모든 소스 코드를 담는 루트 폴더입니다.',
//           folder_path: 'apps/server/src',
//         },
//         {
//           evidence:
//             'NestJS 애플리케이션의 핵심 모듈 파일로, 다른 모듈들을 묶어주고 애플리케이션을 구성하는 역할을 합니다.',
//           confidence: 'high',
//           hypothesis:
//             'NestJS 애플리케이션의 루트 모듈 정의 파일입니다. 애플리케이션의 전반적인 구성 및 모듈 의존성을 설정합니다.',
//           folder_path: 'apps/server/src/app.module.ts',
//         },
//         {
//           evidence:
//             "폴더명 'common'이 일반적인 유틸리티나 공유 로직을 나타내며, 하위에 'logging' 모듈을 포함하고 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '서버 애플리케이션 전반에서 재사용될 수 있는 공통 기능 또는 유틸리티 모듈을 포함합니다.',
//           folder_path: 'apps/server/src/commmon',
//         },
//         {
//           evidence:
//             "파일 목록에 'logging.controller.ts', 'logging.interceptor.ts', 'logging.service.ts', 'loggingStore.service.ts' 등이 포함되어 로깅 관련 모든 구성 요소를 갖추고 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '애플리케이션의 로깅 기능을 담당하는 모듈입니다. 로그 기록, 처리, 저장 등의 로직을 구현합니다.',
//           folder_path: 'apps/server/src/commmon/logging',
//         },
//         {
//           evidence:
//             "'database.module.ts', 'entities', 'migrations', 'seed' 하위 폴더들이 데이터베이스와 관련된 다양한 기능을 제공함을 나타냅니다. 'apps/server/package.json'의 'typeorm' 의존성도 이를 뒷받침합니다.",
//           confidence: 'high',
//           hypothesis:
//             '데이터베이스 연동 및 관리를 위한 코드와 설정을 포함합니다. TypeORM 엔티티, 마이그레이션, 시드 스크립트 등을 관리합니다.',
//           folder_path: 'apps/server/src/database',
//         },
//         {
//           evidence:
//             "파일명이 'fileSystem.entity.ts', 'operatingSystem.entity.ts', 'user.entity.ts', 'window.entity.ts', 'windowList.entity.ts'와 같이 '.entity.ts'로 끝나 TypeORM 엔티티임을 명확히 보여줍니다. 1단계 분석의 주요 기능들도 이 엔티티들을 활용합니다.",
//           confidence: 'high',
//           hypothesis:
//             'TypeORM 엔티티 정의 파일을 포함합니다. 각 파일은 데이터베이스 테이블의 구조와 해당 테이블의 데이터 모델을 정의합니다.',
//           folder_path: 'apps/server/src/database/entities',
//         },
//         {
//           evidence:
//             "파일명 '1762262634999-Init.ts'는 마이그레이션 스크립트의 일반적인 명명 규칙을 따르며, 'dataSource.ts'는 TypeORM 마이그레이션 설정 파일입니다. 'apps/server/package.json'의 'migration:generate', 'migration:run' 스크립트가 이를 확인합니다.",
//           confidence: 'high',
//           hypothesis:
//             '데이터베이스 스키마 변경 사항을 관리하고 적용하기 위한 마이그레이션 스크립트를 포함합니다.',
//           folder_path: 'apps/server/src/database/migrations',
//         },
//         {
//           evidence:
//             "파일명 'generate-seed.ts'와 'run-seed.ts'는 데이터베이스 시딩 기능을 명확히 나타냅니다. 'apps/server/package.json'에 'seed' 스크립트가 정의되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '애플리케이션 초기 구동 시 데이터베이스에 샘플 데이터를 삽입하는 시드(Seed) 스크립트를 포함합니다.',
//           folder_path: 'apps/server/src/database/seed',
//         },
//         {
//           evidence:
//             "파일 'userId.decorator.ts'가 포함되어 있으며, 이는 사용자 ID를 추출하거나 주입하는 커스텀 데코레이터일 가능성이 높습니다. '운영체제 코어 관리' 기능과 관련되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             'NestJS 애플리케이션 내에서 재사용 가능한 커스텀 데코레이터를 정의합니다.',
//           folder_path: 'apps/server/src/decorators',
//         },
//         {
//           evidence:
//             "1단계 분석에서 '가상 파일 시스템 (VFS) 관리' 기능과 직접 연관되어 있으며, 'fileSystem.controller.ts', 'fileSystem.service.ts', 'fileSystem.module.ts', 'fileSystem.dto.ts'와 테스트 파일(`fileSystem.controller.spec.ts`, `fileSystem.service.spec.ts`)을 포함합니다. 테스트 파일에서 `getFileList`, `editTitle` 같은 파일 시스템 작업이 확인됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '가상 파일 시스템(VFS)의 백엔드 로직을 처리하는 모듈입니다. 파일 및 폴더의 생성, 조회, 수정, 삭제 등의 기능을 제공합니다.',
//           folder_path: 'apps/server/src/fileSystem',
//         },
//         {
//           evidence:
//             "NestJS 프로젝트의 표준 엔트리 파일로, 'app.module.ts'를 사용하여 애플리케이션을 부트스트랩하는 역할을 합니다.",
//           confidence: 'high',
//           hypothesis:
//             'NestJS 애플리케이션의 메인 엔트리 포인트 파일입니다. 여기서 애플리케이션 인스턴스를 생성하고 서버를 시작합니다.',
//           folder_path: 'apps/server/src/main.ts',
//         },
//         {
//           evidence:
//             "1단계 분석에서 '메모 애플리케이션 백엔드' 기능과 직접 연관되어 있으며, 'memo.controller.ts', 'memo.service.ts', 'memo.module.ts', 'memo.dto.ts'와 테스트 파일(`memo.controller.spec.ts`, `memo.service.spec.ts`)을 포함합니다. 테스트 파일에서 메모 CRUD 작업이 확인됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '메모 애플리케이션의 백엔드 로직을 처리하는 모듈입니다. 메모 파일의 생성, 조회, 수정, 삭제 기능을 담당합니다.',
//           folder_path: 'apps/server/src/memo',
//         },
//         {
//           evidence:
//             "1단계 분석에서 '운영체제 코어 관리' 기능과 직접 연관되어 있으며, 'operatingSystem.controller.ts', 'operatingSystem.service.ts', 'operatingSystem.module.ts', 'operatingSystem.dto.ts', 'operatingSystem.guard.ts', 'operatingSystem.interface.ts'와 테스트 파일(`operatingSystem.controller.spec.ts`)을 포함합니다.",
//           confidence: 'high',
//           hypothesis:
//             '운영체제 코어 관리 백엔드 모듈입니다. 사용자별 가상 OS 인스턴스 생성, 상태 관리, 세션 유지 등을 담당합니다.',
//           folder_path: 'apps/server/src/operatingSystem',
//         },
//         {
//           evidence:
//             "1단계 분석에서 '운영체제 코어 관리' 및 '터미널 명령 실행 (시스템 콜 에뮬레이션)' 기능과 연관되어 있습니다. 'sessionManager.service.ts'와 'sessionManager.interface.ts'를 포함하며, 'syscall.service.spec.ts'에서 세션 관리에 사용되는 모습이 확인됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '사용자 세션 정보를 관리하는 백엔드 모듈입니다. 각 사용자의 가상 OS 상태(현재 경로, 열린 윈도우 목록 등)를 유지하고 업데이트합니다.',
//           folder_path: 'apps/server/src/sessionManager',
//         },
//         {
//           evidence:
//             "1단계 분석에서 '터미널 명령 실행 (시스템 콜 에뮬레이션)' 기능과 직접 연관되어 있습니다. 'syscall.controller.ts', 'syscall.service.ts', 'syscall.module.ts', 'syscall.dto.ts', 'syscall.exception.ts', 'syscall.exceptionFilter.ts', 'syscall.interface.ts', 'syscallResponse.dto.ts'와 테스트 파일(`syscall.service.spec.ts`)을 포함합니다. 테스트 파일에서 'pwd', 'cd', 'ls', 'rm', 'cat', 'mkdir', 'write', 'uname', 'date', 'clear', 'exec' 등 다양한 명령 처리 로직이 확인됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '터미널 명령 실행(시스템 콜 에뮬레이션) 백엔드 모듈입니다. 다양한 CLI 명령어를 해석하고, 가상 파일 시스템 및 OS 정보에 접근하여 실행합니다.',
//           folder_path: 'apps/server/src/syscall',
//         },
//         {
//           evidence:
//             "파일 'file-entry.util.ts'가 포함되어 있으며, '가상 파일 시스템 (VFS) 관리' 기능의 관련 폴더로도 언급되어 있습니다. syscall 내부의 파일 시스템 관련 유틸리티로 추정됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '시스템 콜 모듈 내부에서 사용되는 유틸리티 함수들을 포함합니다. 주로 파일 엔트리 처리와 관련된 로직일 가능성이 높습니다.',
//           folder_path: 'apps/server/src/syscall/utils',
//         },
//         {
//           evidence:
//             "1단계 분석에서 '애플리케이션 윈도우 관리 (백엔드)' 및 '실시간 UI 동기화 (SSE)' 기능과 직접 연관되어 있습니다. 'windows.controller.ts', 'windows.service.ts', 'windows.module.ts', 'windows.dto.ts', 'windows.constants.ts'와 테스트 파일(`windows.controller.spec.ts`, `windows.service.spec.ts`)을 포함합니다. 테스트 파일에서 윈도우의 열기, 닫기, 이동, 크기 조절, SSE 이벤트 발생 로직이 확인됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '애플리케이션 윈도우 관리 백엔드 모듈입니다. 윈도우의 상태(위치, 크기, z-index)를 관리하고, 실시간 UI 동기화를 위한 SSE 이벤트를 발생시킵니다.',
//           folder_path: 'apps/server/src/windows',
//         },
//         {
//           evidence:
//             "파일 'app.e2e-spec.ts'와 'jest-e2e.json'이 포함되어 있으며, 'apps/server/package.json'의 'test:e2e' 스크립트가 이 폴더를 참조합니다.",
//           confidence: 'high',
//           hypothesis:
//             'NestJS 백엔드 애플리케이션의 E2E(End-to-End) 테스트 코드를 포함합니다.',
//           folder_path: 'apps/server/test',
//         },
//         {
//           evidence:
//             "'apps/web/package.json'에 `react`, `vite`, `tailwindcss` 등 프론트엔드 기술 스택 의존성이 명시되어 있으며, 'index.html', 'main.tsx', 'vite.config.ts' 파일이 존재합니다.",
//           confidence: 'high',
//           hypothesis:
//             'React 및 Vite 기반의 프론트엔드 웹 애플리케이션 코드와 설정을 포함합니다.',
//           folder_path: 'apps/web',
//         },
//         {
//           evidence:
//             "파일 'vite.svg'가 포함되어 있으며, Vite 프로젝트의 표준 정적 자산 폴더입니다.",
//           confidence: 'high',
//           hypothesis:
//             '정적 자산(static assets)을 포함하는 폴더입니다. 웹팩이나 Vite 빌드 프로세스에 의해 처리되지 않고 직접 서빙됩니다.',
//           folder_path: 'apps/web/public',
//         },
//         {
//           evidence:
//             '표준 웹 프로젝트 구조에서 애플리케이션 로직, 컴포넌트, 훅, API 인터페이스, 자산 등이 이 폴더 아래에 위치합니다.',
//           confidence: 'high',
//           hypothesis:
//             'React 프론트엔드 애플리케이션의 모든 소스 코드를 담는 루트 폴더입니다.',
//           folder_path: 'apps/web/src',
//         },
//         {
//           evidence:
//             "1단계 분석의 '그래픽 사용자 인터페이스 (GUI) 렌더링' 기능에 명시되어 있으며, React 앱의 일반적인 시작점입니다.",
//           confidence: 'high',
//           hypothesis:
//             'React 애플리케이션의 최상위 컴포넌트입니다. 전체 웹 OS UI 구조를 렌더링하는 역할을 합니다.',
//           folder_path: 'apps/web/src/App.tsx',
//         },
//         {
//           evidence:
//             "파일 'fileSystem.ts', 'memo.ts', 'syscall.ts', 'system.ts', 'window.ts'는 각각 백엔드의 'fileSystem', 'memo', 'syscall', 'operatingSystem', 'windows' 모듈과 연동되는 API 클라이언트임을 나타냅니다. 'Finder 애플리케이션 UI', '메모 애플리케이션 UI', '터미널 애플리케이션 UI', '대화형 윈도우 관리 UI' 등 여러 프론트엔드 기능에서 이 API 파일들을 사용합니다.",
//           confidence: 'high',
//           hypothesis:
//             '백엔드 API와 통신하기 위한 프론트엔드 클라이언트 코드를 포함합니다. 각 파일은 특정 백엔드 도메인에 대한 API 호출을 추상화합니다.',
//           folder_path: 'apps/web/src/apis',
//         },
//         {
//           evidence:
//             "폴더 내에 다양한 '.svg', '.png' 파일들이 포함되어 있어, UI/UX 디자인에 필요한 그래픽 요소들임을 알 수 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '웹 애플리케이션에서 사용되는 이미지, 아이콘 등 시각적 자산(media assets)을 저장합니다.',
//           folder_path: 'apps/web/src/assets',
//         },
//         {
//           evidence:
//             "일반적인 React 프로젝트에서 컴포넌트들을 분류하고 관리하는 표준 방식입니다. 'common', 'domain', 'operatingSystem'과 같은 하위 폴더로 구성되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '재사용 가능한 React UI 컴포넌트들을 구조화하여 저장하는 최상위 폴더입니다.',
//           folder_path: 'apps/web/src/components',
//         },
//         {
//           evidence:
//             "'button', 'iconButton', 'spinner', 'toggle', 'window'와 같은 하위 폴더들이 있으며, 1단계 분석의 '공통 UI 컴포넌트 라이브러리' 기능과 연관되어 있습니다. 'window' 컴포넌트는 모든 애플리케이션 윈도우의 기본 틀을 제공합니다.",
//           confidence: 'high',
//           hypothesis:
//             '애플리케이션 전반에서 공통적으로 사용되는 일반적인 UI 컴포넌트들을 포함합니다. 특정 도메인에 종속되지 않는 재사용 가능한 요소들입니다.',
//           folder_path: 'apps/web/src/components/common',
//         },
//         {
//           evidence:
//             "파일 'button.tsx', 'button.types.ts', 'index.ts'가 포함되어 있으며, '공통 UI 컴포넌트 라이브러리' 기능에 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '재사용 가능한 일반 버튼 UI 컴포넌트와 관련 타입을 정의합니다.',
//           folder_path: 'apps/web/src/components/common/button',
//         },
//         {
//           evidence:
//             "파일 'iconButton.tsx', 'iconButton.types.ts', 'intex.ts'가 포함되어 있으며, '공통 UI 컴포넌트 라이브러리' 기능에 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '재사용 가능한 아이콘 버튼 UI 컴포넌트와 관련 타입을 정의합니다.',
//           folder_path: 'apps/web/src/components/common/iconButton',
//         },
//         {
//           evidence:
//             "파일 'spinner.tsx', 'index.ts'가 포함되어 있으며, '공통 UI 컴포넌트 라이브러리' 기능에 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis: '로딩 상태를 나타내는 스피너 UI 컴포넌트를 정의합니다.',
//           folder_path: 'apps/web/src/components/common/spinner',
//         },
//         {
//           evidence:
//             "파일 'toggle.tsx', 'toggle.types.ts', 'index.ts'가 포함되어 있으며, '공통 UI 컴포넌트 라이브러리' 기능에 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '재사용 가능한 토글 스위치 UI 컴포넌트와 관련 타입을 정의합니다.',
//           folder_path: 'apps/web/src/components/common/toggle',
//         },
//         {
//           evidence:
//             "파일 'window.tsx', 'window.types.ts', 'index.ts'가 포함되어 있으며, 1단계 분석의 '대화형 윈도우 관리 UI' 기능에서 재사용 가능한 윈도우 컴포넌트로 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '드래그, 리사이즈, Z-index 관리 등 공통적인 윈도우 동작을 추상화한 기본 윈도우 UI 컴포넌트입니다. 모든 애플리케이션 윈도우의 기반이 됩니다.',
//           folder_path: 'apps/web/src/components/common/window',
//         },
//         {
//           evidence:
//             "하위에 'finder', 'memo', 'setting', 'terminal' 폴더와 'taskBar.tsx', 'windowManager.tsx' 파일이 존재하여, 각 애플리케이션 또는 주요 OS UI 영역을 담당하는 컴포넌트들을 분류하고 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '특정 애플리케이션 도메인(예: Finder, Memo, Terminal) 또는 OS의 주요 시각적 구성 요소(예: Task Bar, Window Manager)와 관련된 UI 컴포넌트들을 포함합니다.',
//           folder_path: 'apps/web/src/components/domain',
//         },
//         {
//           evidence:
//             "1단계 분석의 'Finder 애플리케이션 UI' 기능과 직접 연관되어 있습니다. 'finder.tsx', 'finderBody.tsx', 'finderContextMenu.tsx', 'finderFooter.tsx', 'finderHeader.tsx' 파일들이 존재하여 파일 탐색기 UI의 여러 부분을 구성함을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             '가상 파일 시스템을 시각적으로 탐색하고 관리하는 Finder 애플리케이션의 UI 컴포넌트들을 포함합니다.',
//           folder_path: 'apps/web/src/components/domain/finder',
//         },
//         {
//           evidence:
//             "1단계 분석의 '메모 애플리케이션 UI' 기능과 직접 연관되어 있습니다. 'memo.tsx', 'fileEditor.tsx', 'fileList.tsx', 'folderList.tsx', 'memoItem.tsx', 'textEditorBar.tsx' 파일들이 존재하여 메모 애플리케이션의 전체 UI 구성을 보여줍니다.",
//           confidence: 'high',
//           hypothesis:
//             '텍스트 기반 메모를 생성하고 편집하는 메모 애플리케이션의 UI 컴포넌트들을 포함합니다.',
//           folder_path: 'apps/web/src/components/domain/memo',
//         },
//         {
//           evidence:
//             "파일 'icons.ts', 'memo.utils.ts'가 포함되어 있어, 메모 앱 UI에 특화된 로직이나 자산이 이곳에 위치할 가능성이 높습니다.",
//           confidence: 'high',
//           hypothesis:
//             '메모 애플리케이션 UI 컴포넌트에서 사용되는 유틸리티 함수나 데이터를 정의합니다.',
//           folder_path: 'apps/web/src/components/domain/memo/utils',
//         },
//         {
//           evidence:
//             "1단계 분석의 '시스템 설정 UI' 기능과 직접 연관되어 있습니다. 'setting.tsx', 'fontSetting.tsx', 'programSetting.tsx', 'timeSetting.tsx', 'userProfileSetting.tsx', 'wallPaperSetting.tsx' 파일들이 존재하여 다양한 설정 항목을 담당하는 컴포넌트임을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             '운영체제의 다양한 설정을 사용자화할 수 있는 시스템 설정 애플리케이션의 UI 컴포넌트들을 포함합니다.',
//           folder_path: 'apps/web/src/components/domain/setting',
//         },
//         {
//           evidence:
//             "1단계 분석의 '그래픽 사용자 인터페이스 (GUI) 렌더링' 기능에 명시되어 있으며, 파일명이 운영체제 UI의 핵심 요소임을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             'Mac OS 스타일의 데스크톱 환경에서 상단 바(task bar 또는 menu bar)를 렌더링하는 UI 컴포넌트입니다.',
//           folder_path: 'apps/web/src/components/domain/taskBar.tsx',
//         },
//         {
//           evidence:
//             "1단계 분석의 '터미널 애플리케이션 UI' 기능과 직접 연관되어 있으며, 'terminal.tsx' 파일이 존재합니다.",
//           confidence: 'high',
//           hypothesis:
//             'CLI(Command Line Interface)를 통해 명령어를 입력하고 결과를 확인할 수 있는 터미널 애플리케이션의 UI 컴포넌트들을 포함합니다.',
//           folder_path: 'apps/web/src/components/domain/terminal',
//         },
//         {
//           evidence:
//             "1단계 분석의 '그래픽 사용자 인터페이스 (GUI) 렌더링' 기능에 명시되어 있으며, 파일명이 윈도우 관리를 담당하는 컴포넌트임을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             '열려있는 모든 애플리케이션 윈도우의 가시성, 순서(z-index), 레이아웃 등을 관리하는 최상위 UI 컴포넌트입니다.',
//           folder_path: 'apps/web/src/components/domain/windowManager.tsx',
//         },
//         {
//           evidence:
//             "하위에 'operatingSystem.tsx' 파일이 존재하며, 1단계 분석의 '그래픽 사용자 인터페이스 (GUI) 렌더링' 기능에 명시되어 있습니다. 이는 OS의 최상위 시각적 표현을 담당할 가능성이 높습니다.",
//           confidence: 'high',
//           hypothesis:
//             '전체 웹 기반 운영체제 에뮬레이션의 핵심 UI를 구성하는 컴포넌트를 포함합니다.',
//           folder_path: 'apps/web/src/components/operatingSystem',
//         },
//         {
//           evidence:
//             "1단계 분석의 '그래픽 사용자 인터페이스 (GUI) 렌더링' 기능에 명시되어 있으며, 웹 OS의 전체적인 시각적 레이아웃과 동작을 담당하는 핵심 컴포넌트임을 알 수 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '가상 운영체제 전체의 데스크톱 환경(배경화면, 태스크바, 윈도우 관리자 등)을 렌더링하고 상호작용하는 루트 UI 컴포넌트입니다.',
//           folder_path:
//             'apps/web/src/components/operatingSystem/operatingSystem.tsx',
//         },
//         {
//           evidence:
//             "파일 'systemTimeContext.tsx'와 'systemTimeProvider.tsx'가 존재하여, 시스템 시간과 같은 전역 상태를 여러 컴포넌트에 공유하기 위한 패턴임을 나타냅니다. '시스템 설정 UI' 기능에서도 `systemTimeContext.tsx`가 언급됩니다.",
//           confidence: 'high',
//           hypothesis:
//             'React Context API를 사용하여 전역 상태 또는 공유 데이터를 관리하는 프로바이더와 컨슈머 컴포넌트들을 포함합니다.',
//           folder_path: 'apps/web/src/contexts',
//         },
//         {
//           evidence:
//             "React 프로젝트의 표준적인 훅 저장 폴더입니다. 'memo', 'operatingSystem', 'windows'와 같은 하위 폴더로 특정 도메인에 특화된 훅들을 분류하고 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '재사용 가능한 상태 로직이나 부수 효과를 캡슐화하는 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks',
//         },
//         {
//           evidence:
//             "파일 'useDebounceString.ts'가 포함되어 있으며, 1단계 분석의 '메모 애플리케이션 UI' 기능과 연관되어 있습니다. 텍스트 에디터에서 흔히 사용되는 디바운싱 로직을 담당하는 훅으로 추정됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '메모 애플리케이션의 UI 로직과 관련된 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/memo',
//         },
//         {
//           evidence:
//             "파일 'useLogin.ts', 'useOperatingSystem.ts'가 포함되어 있으며, OS의 핵심적인 동작과 관련된 상태 및 로직을 관리하는 훅임을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             '운영체제 전반의 기능(예: 로그인, OS 상태 관리)과 관련된 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/operatingSystem',
//         },
//         {
//           evidence:
//             "하위에 'finder', 'terminal', 'window', 'windowManager' 폴더가 존재하여, 윈도우 시스템의 다양한 측면을 관리하는 훅들을 분류하고 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '윈도우 관리 및 특정 애플리케이션 윈도우(Finder, Terminal 등)와 관련된 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/windows',
//         },
//         {
//           evidence:
//             "파일 'useFinder.hook.ts', 'useFinderBody.hook.ts'가 포함되어 있으며, 1단계 분석의 'Finder 애플리케이션 UI' 기능과 연관되어 있습니다. Finder의 파일 목록, 경로 탐색 등의 상태를 관리할 것으로 예상됩니다.",
//           confidence: 'high',
//           hypothesis:
//             'Finder 애플리케이션의 UI 로직과 관련된 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/windows/finder',
//         },
//         {
//           evidence:
//             "파일 'useTerminal.hook.ts'가 포함되어 있으며, 1단계 분석의 '터미널 애플리케이션 UI' 기능과 연관되어 있습니다. 터미널의 입력 처리, 출력 관리, 스크롤 등의 로직을 담당할 것으로 예상됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '터미널 애플리케이션의 UI 로직과 관련된 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/windows/terminal',
//         },
//         {
//           evidence:
//             "파일 'useWindow.hook.ts', 'window.constant.ts'가 포함되어 있으며, 1단계 분석의 '대화형 윈도우 관리 UI' 기능에 명시되어 있습니다. 각 윈도우 인스턴스의 개별적인 UI/UX 로직을 담당합니다.",
//           confidence: 'high',
//           hypothesis:
//             '단일 윈도우 컴포넌트의 상태(위치, 크기, Z-index) 및 상호작용 로직을 관리하는 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/windows/window',
//         },
//         {
//           evidence:
//             "파일 'useWindowManager.hook.ts'가 포함되어 있으며, 1단계 분석의 '대화형 윈도우 관리 UI' 기능에 명시되어 있습니다. `WindowManager.tsx` 컴포넌트와 함께 전체 윈도우 시스템을 조율합니다.",
//           confidence: 'high',
//           hypothesis:
//             '여러 윈도우들의 전체적인 관리 로직(예: Z-ordering, 활성 윈도우 추적, 윈도우 생성/닫기 조정)을 담당하는 커스텀 React 훅들을 포함합니다.',
//           folder_path: 'apps/web/src/hooks/windows/windowManager',
//         },
//         {
//           evidence:
//             "일반적인 웹 프로젝트의 전역 스타일시트 파일입니다. 'apps/web/package.json'에 'tailwindcss' 의존성이 명시되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             '전역 CSS 스타일을 정의하는 파일입니다. 주로 Tailwind CSS 설정이나 기본적인 스타일 재정의가 포함될 수 있습니다.',
//           folder_path: 'apps/web/src/index.css',
//         },
//         {
//           evidence:
//             "1단계 분석의 '그래픽 사용자 인터페이스 (GUI) 렌더링' 기능에 명시되어 있으며, React 애플리케이션을 부트스트랩하는 역할을 합니다.",
//           confidence: 'high',
//           hypothesis:
//             'React 프론트엔드 애플리케이션의 엔트리 포인트 파일입니다. 여기서 React 앱을 DOM에 마운트합니다.',
//           folder_path: 'apps/web/src/main.tsx',
//         },
//         {
//           evidence:
//             "파일 'wallpaper.tsx'가 포함되어 있으며, 이는 전체 배경 화면을 담당하는 컴포넌트일 가능성이 높습니다. 일반적인 웹사이트의 '페이지' 개념과는 다소 다를 수 있지만, 최상위 시각적 영역을 정의하는 역할로 추정됩니다.",
//           confidence: 'high',
//           hypothesis:
//             "최상위 또는 전체 화면을 구성하는 React 컴포넌트들을 포함합니다. 웹 OS 맥락에서는 특정 '페이지'나 배경 화면 등을 나타낼 수 있습니다.",
//           folder_path: 'apps/web/src/pages',
//         },
//         {
//           evidence:
//             "파일 이름이 'wallpaper'임을 명확히 나타내며, '시스템 설정 UI' 기능에서 `wallPaperSetting.tsx`와 연관되어 배경 화면 설정을 관리할 것으로 예상됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '데스크톱 배경 화면을 렌더링하는 React 컴포넌트입니다. 사용자 설정에 따라 배경을 변경하는 기능을 제공할 수 있습니다.',
//           folder_path: 'apps/web/src/pages/wallpaper.tsx',
//         },
//         {
//           evidence:
//             "파일 'cn.ts' (클래스 이름 조건부 병합), 'date.ts' (날짜 관련 유틸리티)가 포함되어 있어, 일반적인 범용 유틸리티 함수들을 모아둔 폴더임을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             '애플리케이션 전반에서 사용되는 일반적인 유틸리티 함수들을 포함합니다. 컴포넌트나 훅에 종속되지 않는 헬퍼 함수들입니다.',
//           folder_path: 'apps/web/src/utils',
//         },
//         {
//           evidence:
//             "루트 'package.json'의 `config` 섹션에서 `cz-customizable`의 설정 파일로 지정되어 있으며, 'README.md'에도 커밋 컨벤션에 대한 내용이 상세히 설명되어 있습니다.",
//           confidence: 'high',
//           hypothesis:
//             'Commitizen 도구(`cz-customizable`)의 설정 파일입니다. 커밋 메시지 작성 규칙 및 형식을 정의합니다.',
//           folder_path: 'cz-config.js',
//         },
//         {
//           evidence:
//             '표준 Docker Compose 파일명으로, 여러 Docker 서비스를 함께 정의하고 실행하는 데 사용됩니다. 백엔드 서버와 MySQL 데이터베이스가 함께 배포될 가능성이 높습니다.',
//           confidence: 'high',
//           hypothesis:
//             'Docker Compose 설정 파일입니다. 다중 컨테이너 Docker 애플리케이션(서버, 데이터베이스 등)의 서비스, 네트워크, 볼륨 등을 정의하고 오케스트레이션합니다.',
//           folder_path: 'docker-compose.yml',
//         },
//         {
//           evidence:
//             '프로젝트의 최상위 `package.json`으로 `turbo`, `commitizen`, `cz-customizable` 등 모노레포 및 개발 환경 관련 의존성과 스크립트가 명시되어 있습니다. `pnpm-workspace.yaml`과 함께 모노레포 구조의 핵심 설정입니다.',
//           confidence: 'high',
//           hypothesis:
//             "루트 워크스페이스의 'package.json' 파일입니다. 모노레포의 스크립트, 개발 의존성, pnpm 워크스페이스 설정, Commitizen 설정 등을 정의합니다.",
//           folder_path: 'package.json',
//         },
//         {
//           evidence:
//             "하위에 'eslint-config'와 'typescript-config' 폴더가 존재하며, 이는 모노레포에서 공통 개발 환경 설정을 공유하는 일반적인 패턴입니다.",
//           confidence: 'high',
//           hypothesis:
//             '모노레포 내에서 여러 애플리케이션이 공유하는 코드, 설정, 또는 라이브러리 패키지들을 저장하는 폴더입니다.',
//           folder_path: 'packages',
//         },
//         {
//           evidence:
//             "파일 'base.js', 'react-internal.js', 'package.json'을 포함하며, ESLint 구성 파일임을 명확히 나타냅니다. 'README.md'에도 관련 내용이 있을 것으로 예상됩니다.",
//           confidence: 'high',
//           hypothesis:
//             '모노레포 내의 모든 애플리케이션에 적용되는 공통 ESLint 설정 패키지입니다. 코드 스타일 일관성을 유지합니다.',
//           folder_path: 'packages/eslint-config',
//         },
//         {
//           evidence:
//             "파일 'base.json', 'nextjs.json', 'react-library.json', 'package.json'을 포함하며, TypeScript 설정 파일임을 명확히 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             '모노레포 내의 모든 애플리케이션에 적용되는 공통 TypeScript 설정 패키지입니다. TypeScript 컴파일러 옵션의 일관성을 유지합니다.',
//           folder_path: 'packages/typescript-config',
//         },
//         {
//           evidence:
//             'pnpm이 패키지 매니저로 사용되고 있음을 나타내는 표준 파일입니다. (루트 package.json에 `packageManager: pnpm` 명시)',
//           confidence: 'high',
//           hypothesis:
//             'pnpm 패키지 매니저가 사용하는 잠금(lock) 파일입니다. 프로젝트의 모든 패키지 의존성에 대한 정확한 버전과 무결성 정보를 기록하여 재현 가능한 빌드를 보장합니다.',
//           folder_path: 'pnpm-lock.yaml',
//         },
//         {
//           evidence:
//             'pnpm이 패키지 매니저로 사용되고 있음을 나타내는 표준 파일이며, 모노레포 구조의 핵심 구성 파일입니다.',
//           confidence: 'high',
//           hypothesis:
//             'pnpm 워크스페이스를 정의하는 파일입니다. 모노레포 내에서 어떤 폴더들이 별도의 패키지(워크스페이스)로 관리될지 설정합니다.',
//           folder_path: 'pnpm-workspace.yaml',
//         },
//         {
//           evidence:
//             "루트 'package.json'의 스크립트에서 'turbo run' 명령어가 사용되고 있으며, 'turbo'가 devDependencies에 명시되어 있습니다. 이는 Turborepo를 사용하여 모노레포 관리를 하는 프로젝트임을 나타냅니다.",
//           confidence: 'high',
//           hypothesis:
//             'Turbo (Turborepo) 빌드 시스템의 설정 파일입니다. 모노레포 내의 작업(빌드, 테스트, 린트 등)을 정의하고, 의존성 관계 및 캐싱 전략을 설정하여 빌드 성능을 최적화합니다.',
//           folder_path: 'turbo.json',
//         },
//       ],
//     },
//     7,
//   ),
// );
